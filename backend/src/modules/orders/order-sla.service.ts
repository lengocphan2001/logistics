import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  OrderStatus,
  PaymentStatus,
  WalletTransactionType,
} from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { WalletTransactionsService } from '../wallet-transactions/wallet-transactions.service';
import { statusLabelFor } from './order-workflow';

/** Yêu cầu mới quá số giờ này mà chưa được báo giá thì nhắc nhân viên. */
const QUOTE_SLA_HOURS = 4;

/** Nhắc lại tối đa mỗi 12 giờ, tránh dội thông báo. */
const REMINDER_COOLDOWN_HOURS = 12;

/**
 * Two clocks run on every order the staff have not finished with.
 *
 * The first is ours: a request nobody has priced within a few hours is a
 * request the customer is waiting on, and staff get told. The second is the
 * customer's: a quote nobody accepts eventually goes stale, and holding the
 * order open at a price we may no longer be able to honour helps nobody, so it
 * closes and any money taken goes back.
 */
@Injectable()
export class OrderSlaService {
  private readonly logger = new Logger(OrderSlaService.name);

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private walletTransactionsService: WalletTransactionsService,
  ) {}

  @Cron(CronExpression.EVERY_30_MINUTES)
  async run() {
    await this.expireStaleQuotes();
    await this.remindUnquotedRequests();
  }

  /**
   * A quote that ran out of time is cancelled, not left hanging: the price was
   * only good until the deadline staff set.
   */
  async expireStaleQuotes() {
    const stale = await this.prisma.order.findMany({
      where: {
        status: OrderStatus.QUOTED,
        quoteApprovedAt: null,
        quoteExpiresAt: { lt: new Date() },
      },
      select: {
        id: true,
        type: true,
        billOfLadingCode: true,
        customerId: true,
        assignedToId: true,
        depositAmount: true,
        walletPaidAmount: true,
      },
    });

    for (const order of stale) {
      try {
        const paid =
          Number(order.depositAmount) + Number(order.walletPaidAmount);

        if (paid > 0 && order.customerId) {
          await this.walletTransactionsService.recordSystemTransaction({
            customerId: order.customerId,
            type: WalletTransactionType.ORDER_REFUND,
            amount: paid,
            orderId: order.id,
            note: `Hoàn tiền do báo giá hết hạn, đơn ${order.billOfLadingCode}`,
          });
        }

        const updated = await this.prisma.order.update({
          where: { id: order.id },
          data: {
            status: OrderStatus.CANCELLED,
            cancelledAt: new Date(),
            ...(paid > 0
              ? {
                  depositAmount: 0,
                  walletPaidAmount: 0,
                  paymentStatus: PaymentStatus.REFUNDED,
                }
              : {}),
            events: {
              create: {
                status: OrderStatus.CANCELLED,
                note: 'Báo giá hết hạn, đơn tự huỷ',
              },
            },
          },
        });

        await this.notificationsService.notifyOrderStatusChange(
          updated,
          statusLabelFor(order.type, OrderStatus.CANCELLED),
        );
        await this.notificationsService.notifyStaffAboutOrder(
          updated,
          'Báo giá hết hạn',
          `Đơn ${order.billOfLadingCode} tự huỷ vì khách không duyệt báo giá đúng hạn`,
        );
      } catch (err) {
        // One bad order must not stop the rest of the sweep.
        this.logger.error(
          `Không huỷ được đơn báo giá hết hạn ${order.billOfLadingCode}`,
          err instanceof Error ? err.stack : undefined,
        );
      }
    }

    if (stale.length > 0) {
      this.logger.log(`Đã huỷ ${stale.length} đơn có báo giá hết hạn`);
    }
  }

  /** Nhắc nhân viên những yêu cầu chưa ai báo giá. */
  async remindUnquotedRequests() {
    const threshold = new Date(Date.now() - QUOTE_SLA_HOURS * 3_600_000);
    const cooldown = new Date(Date.now() - REMINDER_COOLDOWN_HOURS * 3_600_000);

    const waiting = await this.prisma.order.findMany({
      where: {
        status: OrderStatus.NEW_REQUEST,
        createdAt: { lt: threshold },
      },
      select: {
        id: true,
        billOfLadingCode: true,
        customerId: true,
        assignedToId: true,
        createdAt: true,
      },
    });

    for (const order of waiting) {
      // Don't repeat a reminder that already went out recently.
      const recent = await this.prisma.notification.findFirst({
        where: {
          orderId: order.id,
          title: 'Yêu cầu chờ báo giá',
          createdAt: { gt: cooldown },
        },
        select: { id: true },
      });
      if (recent) continue;

      const hours = Math.floor(
        (Date.now() - order.createdAt.getTime()) / 3_600_000,
      );

      await this.notificationsService.notifyStaffAboutOrder(
        order,
        'Yêu cầu chờ báo giá',
        `Đơn ${order.billOfLadingCode} đã chờ ${hours} giờ mà chưa được báo giá`,
      );
    }
  }
}
