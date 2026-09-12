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
import { needsSourceProperties } from '../products/sku-properties.util';
import { WalletTransactionsService } from '../wallet-transactions/wallet-transactions.service';
import { ProductsService } from '../products/products.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import {
  ChargeOrderWalletDto,
  RefundOrderWalletDto,
} from './dto/charge-order-wallet.dto';

const ORDER_INCLUDE = {
  customer: {
    select: { id: true, fullName: true, phone: true, username: true },
  },
  createdBy: { select: { id: true, name: true, email: true } },
  driver: { select: { id: true, name: true, email: true } },
  warehouse: { select: { id: true, name: true, code: true } },
  events: { orderBy: { createdAt: 'desc' as const }, take: 10 },
  items: { orderBy: { createdAt: 'asc' as const } },
};

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private walletTransactionsService: WalletTransactionsService,
    private productsService: ProductsService,
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
        estimatedDelivery: estimatedDelivery
          ? new Date(estimatedDelivery)
          : undefined,
        customerId,
        createdById,
        driverId,
        warehouseId,
        events: {
          create: {
            status: OrderStatus.DEPOSIT_PAID,
            note: 'Đơn hàng được tạo',
          },
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

  async chargeWallet(
    orderId: string,
    dto: ChargeOrderWalletDto,
    userId: string,
  ) {
    const order = await this.findOne(orderId);

    if (!order.customerId) {
      throw new BadRequestException(
        'Đơn hàng chưa gắn khách hàng, không thể trừ ví',
      );
    }

    const defaultNote =
      dto.type === WalletTransactionType.ORDER_DEPOSIT
        ? `Đặt cọc đơn ${order.billOfLadingCode}`
        : `Thanh toán đơn ${order.billOfLadingCode}`;

    const walletTx =
      await this.walletTransactionsService.recordSystemTransaction({
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

  async refundWallet(
    orderId: string,
    dto: RefundOrderWalletDto,
    userId: string,
  ) {
    const order = await this.findOne(orderId);

    if (!order.customerId) {
      throw new BadRequestException(
        'Đơn hàng chưa gắn khách hàng, không thể hoàn tiền',
      );
    }

    const walletTx =
      await this.walletTransactionsService.recordSystemTransaction({
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

    const { status, eventNote, eventLocation, estimatedDelivery, ...rest } =
      updateOrderDto;

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
              ...(status === OrderStatus.COMPLETED
                ? { deliveredAt: new Date() }
                : {}),
              ...(status === OrderStatus.CANCELLED
                ? { cancelledAt: new Date() }
                : {}),
              events: {
                create: { status, note: eventNote, location: eventLocation },
              },
            }
          : {}),
        ...(estimatedDelivery
          ? { estimatedDelivery: new Date(estimatedDelivery) }
          : {}),
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

  async findAllForCustomer(
    customerId: string,
    params: {
      page?: number;
      limit?: number;
      status?: OrderStatus;
      type?: OrderType;
      search?: string;
    },
  ) {
    const page = params.page ?? 1;
    const limit = params.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = { customerId };

    if (params.status) where.status = params.status;
    if (params.type) where.type = params.type;

    if (params.search) {
      where.OR = [
        { billOfLadingCode: { contains: params.search, mode: 'insensitive' } },
        { description: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        select: {
          id: true,
          billOfLadingCode: true,
          type: true,
          status: true,
          paymentStatus: true,
          totalFee: true,
          depositAmount: true,
          declaredValue: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.order.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getStatsForCustomer(customerId: string) {
    const [total, byType] = await Promise.all([
      this.prisma.order.count({ where: { customerId } }),
      this.prisma.order.groupBy({
        by: ['type'],
        where: { customerId },
        _count: { id: true },
      }),
    ]);

    const typeCounts = byType.reduce<Record<string, number>>((acc, row) => {
      acc[row.type] = row._count.id;
      return acc;
    }, {});

    return { total, byType: typeCounts };
  }

  async findOneForCustomer(customerId: string, id: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, customerId },
      include: {
        events: { orderBy: { createdAt: 'desc' }, take: 20 },
        warehouse: { select: { id: true, name: true, code: true } },
        items: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }

    return order;
  }

  /**
   * Checkout giỏ hàng mua hộ:
   * 1. Gom cart items (theo shop nếu nhiều shop → tạo nhiều đơn)
   * 2. Tính tổng ¥
   * 3. Kiểm tra số dư ví
   * 4. Dùng prisma.$transaction: trừ ví (ORDER_DEPOSIT), tạo Order + OrderItem, xóa CartItem đã checkout
   */
  async checkoutCart(
    customerId: string,
    dto: import('./dto/checkout.dto').CheckoutDto,
  ) {
    // Load cart items
    const cart = await this.prisma.cart.findUnique({
      where: { customerId },
      include: { items: true },
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Giỏ hàng trống');
    }

    const selectedItems = dto.cartItemIds?.length
      ? cart.items.filter((i) => dto.cartItemIds!.includes(i.id))
      : cart.items;

    if (selectedItems.length === 0) {
      throw new BadRequestException('Không có sản phẩm nào được chọn');
    }

    const enrichedItems = await Promise.all(
      selectedItems.map(async (item) => {
        if (!needsSourceProperties(item.properties)) return item;

        const resolved = await this.productsService.resolveSkuProperties(
          item.providerAlias,
          item.itemId,
          item.skuId,
        );
        if (resolved.length === 0) return item;

        await this.prisma.cartItem.update({
          where: { id: item.id },
          data: { properties: resolved as any },
        });
        return { ...item, properties: resolved as any };
      }),
    );

    const logParts: string[] = [];
    if (dto.cnWarehouseId) {
      const cnWh = await this.prisma.warehouse.findFirst({
        where: { id: dto.cnWarehouseId, country: 'CN' },
      });
      if (cnWh) logParts.push(`Kho TQ: ${cnWh.name}`);
    }
    if (dto.vnWarehouseId) {
      const vnWh = await this.prisma.warehouse.findFirst({
        where: { id: dto.vnWarehouseId, country: 'VN' },
      });
      if (vnWh) logParts.push(`Kho VN: ${vnWh.name}`);
    }
    if (dto.shippingMethod) logParts.push(`Vận chuyển: ${dto.shippingMethod}`);
    const orderNote = [dto.note, ...logParts].filter(Boolean).join(' | ');

    // Load customer balance
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
      select: { balance: true, fullName: true, phone: true, address: true },
    });
    if (!customer) throw new NotFoundException('Không tìm thấy khách hàng');

    // Group by shop
    const shopMap = new Map<string, typeof enrichedItems>();
    for (const item of enrichedItems) {
      const key = `${item.providerAlias}:${item.shopId ?? '__single__'}`;
      if (!shopMap.has(key)) shopMap.set(key, []);
      shopMap.get(key)!.push(item);
    }

    const shopGroups = Array.from(shopMap.entries()).map(([, items]) => ({
      items,
      shopId: items[0].shopId ?? undefined,
      shopName: items[0].shopName ?? undefined,
      platform: items[0].platform ?? undefined,
      providerAlias: items[0].providerAlias,
      totalCny: items.reduce((s, i) => s + Number(i.priceCny) * i.quantity, 0),
    }));

    const grandTotalCny = shopGroups.reduce((s, g) => s + g.totalCny, 0);

    if (Number(customer.balance) < grandTotalCny) {
      throw new BadRequestException(
        `Số dư ví không đủ. Cần ¥${grandTotalCny.toFixed(2)}, hiện có ¥${Number(customer.balance).toFixed(2)}`,
      );
    }

    // Exchange rate for VND reference
    const settings = await this.prisma.appSetting.findUnique({
      where: { id: 'default' },
    });
    const rate = Number(settings?.vndPerCny ?? 3500);

    const createdOrders: string[] = [];

    await this.prisma.$transaction(async (tx) => {
      let remainingBalance = Number(customer.balance);

      for (const group of shopGroups) {
        const depositCny = group.totalCny;

        // Create Order
        const order = await tx.order.create({
          data: {
            type: 'PROXY_PURCHASE',
            status: 'DEPOSIT_PAID',
            paymentStatus: 'UNPAID',
            paymentMethod: 'BALANCE',
            platform: group.platform,
            shopId: group.shopId,
            shopName: group.shopName,
            itemsTotalCny: depositCny,
            depositAmount: depositCny,
            senderName: group.shopName ?? 'Taman Logistics',
            senderPhone: '0000000000',
            senderAddress: 'Trung Quốc',
            receiverName: dto.receiverName,
            receiverPhone: dto.receiverPhone,
            receiverAddress: dto.receiverAddress,
            receiverProvince: dto.receiverProvince,
            receiverDistrict: dto.receiverDistrict,
            note: orderNote || undefined,
            warehouseId: dto.vnWarehouseId,
            customerId,
            items: {
              create: group.items.map((i) => ({
                itemId: i.itemId,
                providerAlias: i.providerAlias,
                skuId: i.skuId,
                title: i.title,
                image: i.image,
                priceCny: i.priceCny,
                quantity: i.quantity,
                totalCny: Number(i.priceCny) * i.quantity,
                url: i.url,
                properties: i.properties ?? [],
              })),
            },
            events: {
              create: {
                status: 'DEPOSIT_PAID',
                note: 'Đơn hàng được tạo tự động từ giỏ hàng',
              },
            },
          },
        });

        createdOrders.push(order.id);

        // Deduct wallet
        remainingBalance -= depositCny;
        await tx.customer.update({
          where: { id: customerId },
          data: { balance: remainingBalance },
        });

        // Wallet transaction
        await tx.walletTransaction.create({
          data: {
            type: 'ORDER_DEPOSIT',
            status: 'APPROVED',
            amount: depositCny,
            vndAmount: depositCny * rate,
            exchangeRate: rate,
            note: `Đặt cọc đơn mua hộ ${group.shopName ?? group.shopId ?? ''}`,
            balanceBefore: remainingBalance + depositCny,
            balanceAfter: remainingBalance,
            customerId,
            orderId: order.id,
          },
        });
      }

      // Delete checked-out cart items
      const checkedOutIds = enrichedItems.map((i) => i.id);
      await tx.cartItem.deleteMany({ where: { id: { in: checkedOutIds } } });
    });

    return { success: true, orderIds: createdOrders };
  }
}
