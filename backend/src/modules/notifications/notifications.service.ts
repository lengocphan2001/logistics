import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Notification,
  NotificationRecipientType,
  NotificationType,
  Role,
  WalletTransactionType,
} from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import type { AuthUser } from '../../common/decorators/current-user.decorator';
import { NotificationsGateway } from './notifications.gateway';

type WalletTxForNotification = {
  id: string;
  code: string;
  type: WalletTransactionType;
  amount: { toString(): string };
  customerId: string;
  rejectReason?: string | null;
  customer?: { fullName: string };
};

const MANUAL_WALLET_TYPES: WalletTransactionType[] = [
  WalletTransactionType.DEPOSIT,
  WalletTransactionType.WITHDRAWAL,
];

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private notificationsGateway: NotificationsGateway,
  ) {}

  private recipientFromUser(user: AuthUser) {
    if (user.accountType === 'customer') {
      return {
        recipientType: NotificationRecipientType.CUSTOMER,
        recipientId: user.id,
      };
    }

    return {
      recipientType: NotificationRecipientType.USER,
      recipientId: user.id,
    };
  }

  async findForUser(
    user: AuthUser,
    params: { page?: number; limit?: number; unreadOnly?: boolean } = {},
  ) {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const skip = (page - 1) * limit;
    const { recipientType, recipientId } = this.recipientFromUser(user);

    const where = {
      recipientType,
      recipientId,
      ...(params.unreadOnly ? { readAt: null } : {}),
    };

    const [data, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({
        where: { recipientType, recipientId, readAt: null },
      }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      unreadCount,
    };
  }

  async getUnreadCount(user: AuthUser) {
    const { recipientType, recipientId } = this.recipientFromUser(user);
    const count = await this.prisma.notification.count({
      where: { recipientType, recipientId, readAt: null },
    });
    return { count };
  }

  async markAsRead(id: string, user: AuthUser) {
    const { recipientType, recipientId } = this.recipientFromUser(user);
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException('Không tìm thấy thông báo');
    }

    if (
      notification.recipientType !== recipientType ||
      notification.recipientId !== recipientId
    ) {
      throw new ForbiddenException('Không có quyền truy cập thông báo này');
    }

    if (notification.readAt) {
      return notification;
    }

    return this.prisma.notification.update({
      where: { id },
      data: { readAt: new Date() },
    });
  }

  async markAllAsRead(user: AuthUser) {
    const { recipientType, recipientId } = this.recipientFromUser(user);
    const result = await this.prisma.notification.updateMany({
      where: { recipientType, recipientId, readAt: null },
      data: { readAt: new Date() },
    });
    return { updated: result.count };
  }

  async notifyWalletRequest(tx: WalletTxForNotification) {
    if (!MANUAL_WALLET_TYPES.includes(tx.type)) return;

    const customerName = tx.customer?.fullName ?? 'Khách hàng';
    const amount = Number(tx.amount);
    const isDeposit = tx.type === WalletTransactionType.DEPOSIT;
    const typeLabel = isDeposit ? 'nạp tiền' : 'rút tiền';

    const staffUsers = await this.prisma.user.findMany({
      where: {
        role: { in: [Role.ADMIN, Role.SALES] },
        status: 'ACTIVE',
      },
      select: { id: true },
    });

    if (staffUsers.length === 0) return;

    await this.prisma.notification.createMany({
      data: staffUsers.map((user) => ({
        recipientType: NotificationRecipientType.USER,
        recipientId: user.id,
        type: isDeposit
          ? NotificationType.WALLET_DEPOSIT_REQUEST
          : NotificationType.WALLET_WITHDRAWAL_REQUEST,
        title: `Yêu cầu ${typeLabel} mới`,
        message: `${customerName} gửi yêu cầu ${typeLabel} ${amount}¥ (mã ${tx.code})`,
        link: '/wallet-transactions',
        walletTransactionId: tx.id,
      })),
    });

    const created = await this.prisma.notification.findMany({
      where: { walletTransactionId: tx.id },
      orderBy: { createdAt: 'desc' },
    });
    this.emitMany(created);
  }

  private emitMany(notifications: Notification[]) {
    for (const notification of notifications) {
      this.notificationsGateway.emitNotification(notification);
    }
  }

  private emitOne(notification: Notification) {
    this.notificationsGateway.emitNotification(notification);
  }

  async notifyWalletDecision(tx: WalletTxForNotification, approved: boolean) {
    if (!MANUAL_WALLET_TYPES.includes(tx.type)) return;

    const amount = Number(tx.amount);
    const isDeposit = tx.type === WalletTransactionType.DEPOSIT;
    const typeLabel = isDeposit ? 'nạp tiền' : 'rút tiền';

    const title = approved
      ? `Yêu cầu ${typeLabel} đã được duyệt`
      : `Yêu cầu ${typeLabel} bị từ chối`;

    const message = approved
      ? `Yêu cầu ${typeLabel} ${amount}¥ (mã ${tx.code}) đã được duyệt.`
      : `Yêu cầu ${typeLabel} ${amount}¥ (mã ${tx.code}) bị từ chối.${
          tx.rejectReason ? ` Lý do: ${tx.rejectReason}` : ''
        }`;

    const notification = await this.prisma.notification.create({
      data: {
        recipientType: NotificationRecipientType.CUSTOMER,
        recipientId: tx.customerId,
        type: approved
          ? NotificationType.WALLET_REQUEST_APPROVED
          : NotificationType.WALLET_REQUEST_REJECTED,
        title,
        message,
        link: '/wallet',
        walletTransactionId: tx.id,
      },
    });
    this.emitOne(notification);
  }
}
