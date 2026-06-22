import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Prisma,
  WalletTransactionStatus,
  WalletTransactionType,
} from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { SettingsService } from '../settings/settings.service';
import { CreateWalletTransactionDto } from './dto/create-wallet-transaction.dto';
import { RequestWalletTransactionDto } from './dto/request-wallet-transaction.dto';
import { isWalletCredit } from './wallet-transaction.utils';

const TX_INCLUDE = {
  customer: {
    select: { id: true, fullName: true, phone: true, username: true, balance: true },
  },
  order: {
    select: { id: true, billOfLadingCode: true, type: true, status: true },
  },
  createdBy: { select: { id: true, name: true, email: true } },
  processedBy: { select: { id: true, name: true, email: true } },
};

type LedgerEntryParams = {
  customerId: string;
  type: WalletTransactionType;
  amount: number;
  status: WalletTransactionStatus;
  orderId?: string;
  vndAmount?: number;
  exchangeRate?: number;
  note?: string;
  referenceCode?: string;
  rejectReason?: string;
  createdById?: string;
  processedById?: string | null;
  processedAt?: Date | null;
};

@Injectable()
export class WalletTransactionsService {
  constructor(
    private prisma: PrismaService,
    private settingsService: SettingsService,
  ) {}

  private async getDefaultExchangeRate(): Promise<number> {
    const settings = await this.settingsService.getExchangeRate();
    return settings.vndPerCny;
  }

  private ensureSufficientBalance(balance: Prisma.Decimal, amount: number) {
    if (Number(balance) < amount) {
      throw new BadRequestException('Số dư ví khách hàng không đủ');
    }
  }

  private async createLedgerEntry(
    tx: Prisma.TransactionClient,
    params: LedgerEntryParams,
  ) {
    const customer = await tx.customer.findUnique({
      where: { id: params.customerId },
    });
    if (!customer) {
      throw new NotFoundException('Không tìm thấy khách hàng');
    }

    const balanceBefore = Number(customer.balance);
    let balanceAfter = balanceBefore;

    if (params.status === WalletTransactionStatus.APPROVED) {
      if (!isWalletCredit(params.type)) {
        this.ensureSufficientBalance(customer.balance, params.amount);
      }

      await tx.customer.update({
        where: { id: params.customerId },
        data: isWalletCredit(params.type)
          ? { balance: { increment: params.amount } }
          : { balance: { decrement: params.amount } },
      });

      const updated = await tx.customer.findUnique({
        where: { id: params.customerId },
      });
      balanceAfter = Number(updated!.balance);
    }

    return tx.walletTransaction.create({
      data: {
        customerId: params.customerId,
        type: params.type,
        amount: params.amount,
        vndAmount: params.vndAmount,
        exchangeRate: params.exchangeRate,
        note: params.note,
        referenceCode: params.referenceCode,
        rejectReason: params.rejectReason,
        orderId: params.orderId,
        status: params.status,
        balanceBefore:
          params.status === WalletTransactionStatus.APPROVED ? balanceBefore : null,
        balanceAfter:
          params.status === WalletTransactionStatus.APPROVED ? balanceAfter : null,
        createdById: params.createdById,
        processedById: params.processedById,
        processedAt: params.processedAt,
      },
      include: TX_INCLUDE,
    });
  }

  /** Giao dịch hệ thống — luôn duyệt ngay (đơn hàng, hoàn tiền) */
  async recordSystemTransaction(params: {
    customerId: string;
    type: WalletTransactionType;
    amount: number;
    orderId?: string;
    note?: string;
    createdById?: string;
    vndAmount?: number;
    exchangeRate?: number;
  }) {
    const exchangeRate =
      params.exchangeRate ??
      (params.vndAmount ? params.vndAmount / params.amount : await this.getDefaultExchangeRate());

    return this.prisma.$transaction((tx) =>
      this.createLedgerEntry(tx, {
        customerId: params.customerId,
        type: params.type,
        amount: params.amount,
        orderId: params.orderId,
        note: params.note,
        vndAmount: params.vndAmount,
        exchangeRate,
        status: WalletTransactionStatus.APPROVED,
        createdById: params.createdById,
        processedById: params.createdById,
        processedAt: new Date(),
      }),
    );
  }

  async createCustomerRequest(customerId: string, dto: RequestWalletTransactionDto) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
    });
    if (!customer) {
      throw new NotFoundException('Không tìm thấy khách hàng');
    }

    const exchangeRate =
      dto.vndAmount != null
        ? dto.vndAmount / dto.amount
        : await this.getDefaultExchangeRate();

    return this.prisma.$transaction((tx) =>
      this.createLedgerEntry(tx, {
        customerId,
        type: dto.type,
        amount: dto.amount,
        vndAmount: dto.vndAmount,
        exchangeRate,
        note: dto.note,
        referenceCode: dto.referenceCode,
        status: WalletTransactionStatus.PENDING,
      }),
    );
  }

  /** @deprecated Admin không tạo nạp/rút — chỉ khách hàng qua frontend */
  async create(dto: CreateWalletTransactionDto, createdById: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: dto.customerId },
    });
    if (!customer) {
      throw new NotFoundException('Không tìm thấy khách hàng');
    }

    const approveImmediately = dto.approveImmediately !== false;
    const exchangeRate =
      dto.exchangeRate ??
      (dto.vndAmount ? dto.vndAmount / dto.amount : await this.getDefaultExchangeRate());

    if (
      approveImmediately &&
      !isWalletCredit(dto.type)
    ) {
      this.ensureSufficientBalance(customer.balance, dto.amount);
    }

    return this.prisma.$transaction((tx) =>
      this.createLedgerEntry(tx, {
        customerId: dto.customerId,
        type: dto.type,
        amount: dto.amount,
        vndAmount: dto.vndAmount,
        exchangeRate,
        note: dto.note,
        referenceCode: dto.referenceCode,
        status: approveImmediately
          ? WalletTransactionStatus.APPROVED
          : WalletTransactionStatus.PENDING,
        createdById,
        processedById: approveImmediately ? createdById : null,
        processedAt: approveImmediately ? new Date() : null,
      }),
    );
  }

  async findAll(params: {
    page?: number;
    limit?: number;
    type?: WalletTransactionType;
    status?: WalletTransactionStatus;
    customerId?: string;
    orderId?: string;
    search?: string;
  }) {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.WalletTransactionWhereInput = {};

    if (params.type) where.type = params.type;
    if (params.status) where.status = params.status;
    if (params.customerId) where.customerId = params.customerId;
    if (params.orderId) where.orderId = params.orderId;

    if (params.search) {
      where.OR = [
        { code: { contains: params.search, mode: 'insensitive' } },
        { referenceCode: { contains: params.search, mode: 'insensitive' } },
        { note: { contains: params.search, mode: 'insensitive' } },
        { order: { billOfLadingCode: { contains: params.search, mode: 'insensitive' } } },
        { customer: { fullName: { contains: params.search, mode: 'insensitive' } } },
        { customer: { phone: { contains: params.search, mode: 'insensitive' } } },
        { customer: { username: { contains: params.search, mode: 'insensitive' } } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.walletTransaction.findMany({
        where,
        include: TX_INCLUDE,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.walletTransaction.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const tx = await this.prisma.walletTransaction.findUnique({
      where: { id },
      include: TX_INCLUDE,
    });
    if (!tx) {
      throw new NotFoundException('Không tìm thấy giao dịch');
    }
    return tx;
  }

  async approve(id: string, processedById: string, note?: string) {
    const existing = await this.findOne(id);

    if (existing.status !== WalletTransactionStatus.PENDING) {
      throw new BadRequestException('Chỉ có thể duyệt giao dịch đang chờ xử lý');
    }

    return this.prisma.$transaction(async (tx) => {
      const customer = await tx.customer.findUnique({
        where: { id: existing.customerId },
      });
      if (!customer) {
        throw new NotFoundException('Không tìm thấy khách hàng');
      }

      const balanceBefore = Number(customer.balance);
      const amount = Number(existing.amount);

      if (!isWalletCredit(existing.type)) {
        this.ensureSufficientBalance(customer.balance, amount);
      }

      await tx.customer.update({
        where: { id: existing.customerId },
        data: isWalletCredit(existing.type)
          ? { balance: { increment: amount } }
          : { balance: { decrement: amount } },
      });

      const updatedCustomer = await tx.customer.findUnique({
        where: { id: existing.customerId },
      });

      return tx.walletTransaction.update({
        where: { id },
        data: {
          status: WalletTransactionStatus.APPROVED,
          balanceBefore,
          balanceAfter: Number(updatedCustomer!.balance),
          processedById,
          processedAt: new Date(),
          ...(note ? { note } : {}),
        },
        include: TX_INCLUDE,
      });
    });
  }

  async reject(id: string, processedById: string, rejectReason: string) {
    const existing = await this.findOne(id);

    if (existing.status !== WalletTransactionStatus.PENDING) {
      throw new BadRequestException('Chỉ có thể từ chối giao dịch đang chờ xử lý');
    }

    return this.prisma.walletTransaction.update({
      where: { id },
      data: {
        status: WalletTransactionStatus.REJECTED,
        rejectReason,
        processedById,
        processedAt: new Date(),
      },
      include: TX_INCLUDE,
    });
  }
}
