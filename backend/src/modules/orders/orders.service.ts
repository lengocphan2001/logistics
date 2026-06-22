import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  OrderStatus,
  OrderType,
  PaymentMethod,
  PaymentStatus,
  Prisma,
  WalletTransactionType,
} from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { WalletTransactionsService } from '../wallet-transactions/wallet-transactions.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import {
  ChargeOrderWalletDto,
  RefundOrderWalletDto,
} from './dto/charge-order-wallet.dto';

const ORDER_INCLUDE = {
  customer: { select: { id: true, fullName: true, phone: true, username: true } },
  createdBy: { select: { id: true, name: true, email: true } },
  driver: { select: { id: true, name: true, email: true } },
  warehouse: { select: { id: true, name: true, code: true } },
  events: { orderBy: { createdAt: 'desc' as const }, take: 10 },
};

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private walletTransactionsService: WalletTransactionsService,
  ) {}

  async create(createOrderDto: CreateOrderDto, createdById: string) {
    const {
      type,
      senderName,
      senderPhone,
      senderAddress,
      receiverName,
      receiverPhone,
      receiverAddress,
      receiverProvince,
      receiverDistrict,
      weight,
      length,
      width,
      height,
      description,
      quantity,
      declaredValue,
      codAmount,
      feeTransfer,
      feeInsurance,
      feeExtra,
      paymentMethod,
      paymentStatus,
      note,
      estimatedDelivery,
      customerId,
      driverId,
      warehouseId,
    } = createOrderDto;

    const totalFee = (feeTransfer ?? 0) + (feeInsurance ?? 0) + (feeExtra ?? 0);

    return this.prisma.order.create({
      data: {
        type,
        senderName,
        senderPhone,
        senderAddress,
        receiverName,
        receiverPhone,
        receiverAddress,
        receiverProvince,
        receiverDistrict,
        weight,
        length,
        width,
        height,
        description,
        quantity: quantity ?? 1,
        declaredValue: declaredValue ?? 0,
        codAmount: codAmount ?? 0,
        feeTransfer: feeTransfer ?? 0,
        feeInsurance: feeInsurance ?? 0,
        feeExtra: feeExtra ?? 0,
        totalFee,
        paymentMethod,
        paymentStatus,
        note,
        estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : undefined,
        customerId,
        createdById,
        driverId,
        warehouseId,
        events: {
          create: { status: OrderStatus.DEPOSIT_PAID, note: 'Đơn hàng được tạo' },
        },
      },
      include: ORDER_INCLUDE,
    });
  }

  async findAll(params: {
    page?: number;
    limit?: number;
    status?: OrderStatus;
    type?: OrderType;
    search?: string;
    driverId?: string;
    warehouseId?: string;
    customerId?: string;
    fromDate?: string;
    toDate?: string;
  }) {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {};

    if (params.status) where.status = params.status;
    if (params.type) where.type = params.type;
    if (params.driverId) where.driverId = params.driverId;
    if (params.warehouseId) where.warehouseId = params.warehouseId;
    if (params.customerId) where.customerId = params.customerId;

    if (params.fromDate || params.toDate) {
      where.createdAt = {
        ...(params.fromDate ? { gte: new Date(params.fromDate) } : {}),
        ...(params.toDate ? { lte: new Date(params.toDate) } : {}),
      };
    }

    if (params.search) {
      where.OR = [
        { billOfLadingCode: { contains: params.search, mode: 'insensitive' } },
        { senderName: { contains: params.search, mode: 'insensitive' } },
        { senderPhone: { contains: params.search, mode: 'insensitive' } },
        { receiverName: { contains: params.search, mode: 'insensitive' } },
        { receiverPhone: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          customer: { select: { id: true, fullName: true, phone: true } },
          driver: { select: { id: true, name: true } },
          warehouse: { select: { id: true, name: true, code: true } },
          createdBy: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.order.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: ORDER_INCLUDE,
    });
    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }
    return order;
  }

  async findByBillCode(code: string) {
    const order = await this.prisma.order.findUnique({
      where: { billOfLadingCode: code },
      include: ORDER_INCLUDE,
    });
    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng với mã vận đơn này');
    }
    return order;
  }

  async chargeWallet(orderId: string, dto: ChargeOrderWalletDto, userId: string) {
    const order = await this.findOne(orderId);

    if (!order.customerId) {
      throw new BadRequestException('Đơn hàng chưa gắn khách hàng, không thể trừ ví');
    }

    const defaultNote =
      dto.type === WalletTransactionType.ORDER_DEPOSIT
        ? `Đặt cọc đơn ${order.billOfLadingCode}`
        : `Thanh toán đơn ${order.billOfLadingCode}`;

    const walletTx = await this.walletTransactionsService.recordSystemTransaction({
      customerId: order.customerId,
      type: dto.type,
      amount: dto.amount,
      orderId: order.id,
      note: dto.note ?? defaultNote,
      createdById: userId,
    });

    const orderUpdate: Prisma.OrderUpdateInput = {};

    if (dto.type === WalletTransactionType.ORDER_DEPOSIT) {
      orderUpdate.depositAmount = { increment: dto.amount };
      orderUpdate.status = OrderStatus.DEPOSIT_PAID;
    } else {
      orderUpdate.walletPaidAmount = { increment: dto.amount };
      orderUpdate.paymentStatus = PaymentStatus.PAID;
      orderUpdate.paymentMethod = PaymentMethod.BALANCE;
      orderUpdate.status = OrderStatus.PAID;
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: orderUpdate,
      include: ORDER_INCLUDE,
    });

    return { transaction: walletTx, order: updatedOrder };
  }

  async refundWallet(orderId: string, dto: RefundOrderWalletDto, userId: string) {
    const order = await this.findOne(orderId);

    if (!order.customerId) {
      throw new BadRequestException('Đơn hàng chưa gắn khách hàng, không thể hoàn tiền');
    }

    const walletTx = await this.walletTransactionsService.recordSystemTransaction({
      customerId: order.customerId,
      type: WalletTransactionType.ORDER_REFUND,
      amount: dto.amount,
      orderId: order.id,
      note: dto.note ?? `Hoàn tiền đơn ${order.billOfLadingCode}`,
      createdById: userId,
    });

    return { transaction: walletTx };
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }

    const { status, eventNote, eventLocation, estimatedDelivery, ...rest } = updateOrderDto;

    const feeTransfer = rest.feeTransfer ?? Number(order.feeTransfer);
    const feeInsurance = rest.feeInsurance ?? Number(order.feeInsurance);
    const feeExtra = rest.feeExtra ?? Number(order.feeExtra);
    const totalFee = feeTransfer + feeInsurance + feeExtra;

    return this.prisma.order.update({
      where: { id },
      data: {
        ...rest,
        totalFee,
        ...(status
          ? {
              status,
              ...(status === OrderStatus.COMPLETED ? { deliveredAt: new Date() } : {}),
              ...(status === OrderStatus.CANCELLED ? { cancelledAt: new Date() } : {}),
              events: {
                create: { status, note: eventNote, location: eventLocation },
              },
            }
          : {}),
        ...(estimatedDelivery ? { estimatedDelivery: new Date(estimatedDelivery) } : {}),
      },
      include: ORDER_INCLUDE,
    });
  }

  async remove(id: string) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }

    await this.prisma.order.delete({ where: { id } });
    return { message: 'Xóa đơn hàng thành công' };
  }

  async getStats() {
    const [total, byStatus, revenue] = await Promise.all([
      this.prisma.order.count(),
      this.prisma.order.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      this.prisma.order.aggregate({
        _sum: { totalFee: true, codAmount: true },
      }),
    ]);

    return {
      total,
      byStatus: byStatus.reduce<Record<string, number>>((acc, row) => {
        acc[row.status] = row._count.id;
        return acc;
      }, {}),
      revenue: revenue._sum,
    };
  }
}
