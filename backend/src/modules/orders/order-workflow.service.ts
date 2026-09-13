import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  OrderItemStatus,
  OrderStatus,
  OrderType,
  PaymentMethod,
  PaymentStatus,
  Prisma,
  WalletTransactionType,
} from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { SettingsService } from '../settings/settings.service';
import { WalletTransactionsService } from '../wallet-transactions/wallet-transactions.service';
import { NotificationsService } from '../notifications/notifications.service';
import { orderTypeLabels } from '../../common/enums/order-type-label';
import { ORDER_INCLUDE } from './order-include';
import {
  allowedNextStatuses,
  assertStatusIn,
  assertTransition,
  chargesGoodsOnApproval,
  flowFor,
  statusAfterQuoteApproval,
  statusLabelFor,
} from './order-workflow';
import {
  AssignOrderDto,
  CancelOrderDto,
  CancelRequestDto,
  CnReceiveDto,
  DeliverOrderDto,
  DepartOrderDto,
  OrderItemPurchaseDto,
  PurchaseOrderDto,
  QuoteOrderDto,
  RejectQuoteDto,
  SettleOrderDto,
  UpdateOrderItemsDto,
  VnReceiveDto,
} from './dto/order-actions.dto';

const QUOTE_DEFAULT_HOURS = 48;

/** Dòng hàng không còn phải trả tiền. */
const UNCHARGED_ITEM_STATUSES: OrderItemStatus[] = [
  OrderItemStatus.OUT_OF_STOCK,
  OrderItemStatus.REFUNDED,
];

type OrderRow = Prisma.OrderGetPayload<{ include: typeof ORDER_INCLUDE }>;

export type OrderAmounts = {
  /** Tiền hàng phải trả cho sàn (¥). Đơn ký gửi luôn bằng 0. */
  goodsCny: number;
  /** Tổng phí dịch vụ và vận chuyển (VND). */
  feesVnd: number;
  /** Cùng khoản phí trên, quy ra ¥ theo tỉ giá hiện hành. */
  feesCny: number;
  /** Đã trừ khỏi ví khách cho đơn này (¥). */
  paidCny: number;
  /** Còn phải thu (¥). Không bao giờ âm. */
  dueCny: number;
  /** Thu thừa, cần hoàn lại (¥). */
  overpaidCny: number;
  exchangeRate: number;
};

/**
 * Every step staff take on an order, one method per step.
 *
 * Each method checks the order is in a state where the step makes sense, moves
 * money if the step moves money, writes an OrderEvent, and tells the customer.
 * Nothing here trusts the caller to send a status: the status is a consequence
 * of the action, never an input.
 */
@Injectable()
export class OrderWorkflowService {
  constructor(
    private prisma: PrismaService,
    private settingsService: SettingsService,
    private walletTransactionsService: WalletTransactionsService,
    private notificationsService: NotificationsService,
  ) {}

  // ---------------------------------------------------------------- helpers

  private async load(id: string): Promise<OrderRow> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: ORDER_INCLUDE,
    });
    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');
    return order;
  }

  private async loadForCustomer(
    customerId: string,
    id: string,
  ): Promise<OrderRow> {
    const order = await this.prisma.order.findFirst({
      where: { id, customerId },
      include: ORDER_INCLUDE,
    });
    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');
    return order;
  }

  /**
   * Goods are what the customer owes the marketplace, fees are what they owe
   * us. They are held in different currencies on purpose, so the only place the
   * two meet is here, at today's rate.
   */
  async amounts(order: OrderRow): Promise<OrderAmounts> {
    const { vndPerCny } = await this.settingsService.getExchangeRate();

    const chargeableItems = order.items.filter(
      (item) => !UNCHARGED_ITEM_STATUSES.includes(item.status),
    );

    // Once staff have priced the lines, the lines are the truth. Before that,
    // the order-level total is all there is.
    const itemsSum = chargeableItems.reduce(
      (sum, item) =>
        sum + Number(item.purchasedPriceCny ?? item.priceCny) * item.quantity,
      0,
    );

    const orderLevelGoods = Number(order.itemsTotalCny ?? 0);
    const rawGoods = itemsSum > 0 ? itemsSum : orderLevelGoods;
    const goodsCny = order.type === OrderType.CONSIGNMENT ? 0 : rawGoods;

    const feesVnd = Number(order.totalFee);
    const feesCny = vndPerCny > 0 ? feesVnd / vndPerCny : 0;
    const paidCny =
      Number(order.depositAmount) + Number(order.walletPaidAmount);

    const balance = goodsCny + feesCny - paidCny;

    return {
      goodsCny,
      feesVnd,
      feesCny,
      paidCny,
      dueCny: balance > 0 ? this.round(balance) : 0,
      overpaidCny: balance < 0 ? this.round(-balance) : 0,
      exchangeRate: vndPerCny,
    };
  }

  private round(value: number): number {
    return Math.round(value * 100) / 100;
  }

  /**
   * The single place a status changes. Validates the move against the type's
   * own flow, records the event, and notifies the customer once.
   */
  private async advance(
    order: OrderRow,
    to: OrderStatus,
    note: string,
    data: Prisma.OrderUncheckedUpdateInput = {},
  ): Promise<OrderRow> {
    assertTransition(order.type, order.status, to, orderTypeLabels[order.type]);

    const updated = await this.prisma.order.update({
      where: { id: order.id },
      data: {
        ...data,
        status: to,
        ...(to === OrderStatus.COMPLETED ? { deliveredAt: new Date() } : {}),
        ...(to === OrderStatus.CANCELLED ? { cancelledAt: new Date() } : {}),
        events: { create: { status: to, note } },
      },
      include: ORDER_INCLUDE,
    });

    if (to !== order.status) {
      await this.notificationsService.notifyOrderStatusChange(
        updated,
        statusLabelFor(order.type, to),
      );
    }

    return updated;
  }

  /** Trừ ví khách và ghi sổ, dùng chung cho thu tiền hàng và thu cước. */
  private async charge(
    order: OrderRow,
    type: WalletTransactionType,
    amount: number,
    note: string,
    userId?: string,
  ) {
    if (!order.customerId) {
      throw new BadRequestException(
        'Đơn hàng chưa gắn khách hàng, không thể trừ ví',
      );
    }
    if (amount <= 0) return null;

    return this.walletTransactionsService.recordSystemTransaction({
      customerId: order.customerId,
      type,
      amount,
      orderId: order.id,
      note,
      createdById: userId,
    });
  }

  /**
   * Whoever first acts on an unassigned order owns it. Staff should not have to
   * remember to claim a job they have already started.
   */
  private claim(
    order: OrderRow,
    userId: string,
  ): Prisma.OrderUncheckedUpdateInput {
    if (order.assignedToId) return {};
    return { assignedToId: userId, assignedAt: new Date() };
  }

  private applyItemUpdates(
    order: OrderRow,
    updates: OrderItemPurchaseDto[] | undefined,
  ): Prisma.PrismaPromise<unknown>[] {
    if (!updates?.length) return [];

    const known = new Set(order.items.map((item) => item.id));
    for (const update of updates) {
      if (!known.has(update.id)) {
        throw new BadRequestException('Có dòng hàng không thuộc đơn hàng này');
      }
    }

    return updates.map((update) =>
      this.prisma.orderItem.update({
        where: { id: update.id },
        data: {
          status: update.status,
          purchasedPriceCny: update.purchasedPriceCny,
          statusNote: update.statusNote,
        },
      }),
    );
  }

  // ----------------------------------------------------------------- staff

  async getSummary(id: string) {
    const order = await this.load(id);
    return {
      order,
      amounts: await this.amounts(order),
      ...this.flowInfo(order),
    };
  }

  /**
   * Everything a client needs to draw the right buttons: the path this type of
   * order takes, where it is on that path, and what it may do next. Keeping it
   * on the server means the admin and the portal cannot disagree about it.
   */
  private flowInfo(order: OrderRow) {
    return {
      flow: flowFor(order.type).map((status) => ({
        status,
        label: statusLabelFor(order.type, status),
      })),
      nextStatuses: allowedNextStatuses(order.type, order.status).map(
        (status) => ({ status, label: statusLabelFor(order.type, status) }),
      ),
      statusLabel: statusLabelFor(order.type, order.status),
    };
  }

  async assign(id: string, dto: AssignOrderDto) {
    const order = await this.load(id);

    if (dto.assignedToId) {
      const staff = await this.prisma.user.findFirst({
        where: { id: dto.assignedToId, status: 'ACTIVE' },
        select: { id: true, name: true },
      });
      if (!staff) throw new NotFoundException('Không tìm thấy nhân viên');

      return this.prisma.order.update({
        where: { id: order.id },
        data: {
          assignedToId: staff.id,
          assignedAt: new Date(),
          events: {
            create: {
              status: order.status,
              note: `Giao cho ${staff.name} phụ trách`,
            },
          },
        },
        include: ORDER_INCLUDE,
      });
    }

    return this.prisma.order.update({
      where: { id: order.id },
      data: {
        assignedToId: null,
        assignedAt: null,
        events: {
          create: { status: order.status, note: 'Gỡ người phụ trách' },
        },
      },
      include: ORDER_INCLUDE,
    });
  }

  /**
   * Staff price the request. Nothing is charged yet: the customer has to accept
   * the number first, and the quote goes stale if they never do.
   */
  async quote(id: string, dto: QuoteOrderDto, userId: string) {
    const order = await this.load(id);

    assertStatusIn(
      order.type,
      order.status,
      order.type === OrderType.CONSIGNMENT
        ? [OrderStatus.AT_CN_WAREHOUSE, OrderStatus.QUOTED]
        : [OrderStatus.NEW_REQUEST, OrderStatus.QUOTED],
      'báo giá',
    );

    const feeTransfer = dto.feeTransfer ?? Number(order.feeTransfer);
    const feeInsurance = dto.feeInsurance ?? Number(order.feeInsurance);
    const feeExtra = dto.feeExtra ?? Number(order.feeExtra);
    const itemsTotalCny = dto.itemsTotalCny ?? Number(order.itemsTotalCny ?? 0);

    const expiresAt = new Date(
      Date.now() + (dto.expiresInHours ?? QUOTE_DEFAULT_HOURS) * 60 * 60 * 1000,
    );

    const updated = await this.advance(
      order,
      OrderStatus.QUOTED,
      dto.note
        ? `Báo giá: ${dto.note}`
        : 'Nhân viên gửi báo giá, chờ khách duyệt',
      {
        itemsTotalCny,
        feeTransfer,
        feeInsurance,
        feeExtra,
        totalFee: feeTransfer + feeInsurance + feeExtra,
        quotedAt: new Date(),
        quoteExpiresAt: expiresAt,
        quoteApprovedAt: null,
        quoteNote: dto.note,
        ...this.claim(order, userId),
      },
    );

    return { order: updated, amounts: await this.amounts(updated) };
  }

  /** Xác nhận đã mua hàng trên sàn, hoặc đã trả tiền cho shop. */
  async purchase(id: string, dto: PurchaseOrderDto, userId: string) {
    const order = await this.load(id);

    assertStatusIn(
      order.type,
      order.status,
      [OrderStatus.DEPOSIT_PAID],
      order.type === OrderType.PROXY_PAYMENT
        ? 'xác nhận đã thanh toán cho shop'
        : 'xác nhận đã mua hàng',
    );

    const itemUpdates = this.applyItemUpdates(order, dto.items);
    if (itemUpdates.length > 0) {
      await this.prisma.$transaction(itemUpdates);
    }

    const note =
      dto.note ??
      (order.type === OrderType.PROXY_PAYMENT
        ? 'Đã thanh toán cho shop'
        : 'Nhân viên đã đặt mua trên sàn');

    const moved = await this.advance(
      await this.load(order.id),
      OrderStatus.PURCHASED,
      dto.purchaseOrderCode
        ? `${note} (mã đơn sàn ${dto.purchaseOrderCode})`
        : note,
      {
        purchaseOrderCode: dto.purchaseOrderCode?.trim() || undefined,
        ...this.claim(order, userId),
      },
    );

    // Lines that fell through — out of stock, or bought cheaper than quoted —
    // leave the customer in credit. Give it back straight away rather than
    // holding it until delivery.
    const after = await this.amounts(moved);
    if (after.overpaidCny > 0) {
      await this.charge(
        moved,
        WalletTransactionType.ORDER_REFUND,
        after.overpaidCny,
        `Hoàn chênh lệch sau khi mua đơn ${moved.billOfLadingCode}`,
        userId,
      );
      await this.prisma.order.update({
        where: { id: moved.id },
        data: { depositAmount: { decrement: after.overpaidCny } },
      });
    }

    const fresh = await this.load(moved.id);
    return { order: fresh, amounts: await this.amounts(fresh) };
  }

  /** Kho Trung Quốc nhận hàng, cân đo. */
  async cnReceive(id: string, dto: CnReceiveDto, userId: string) {
    const order = await this.load(id);

    if (dto.cnWarehouseId) {
      const warehouse = await this.prisma.warehouse.findFirst({
        where: { id: dto.cnWarehouseId, country: 'CN' },
      });
      if (!warehouse) {
        throw new BadRequestException('Kho tiếp nhận phải là kho Trung Quốc');
      }
    }

    const parts = [dto.note ?? 'Hàng đã về kho Trung Quốc'];
    if (dto.weight) parts.push(`${dto.weight} kg`);

    const updated = await this.advance(
      order,
      OrderStatus.AT_CN_WAREHOUSE,
      parts.join(' — '),
      {
        cnWarehouseId: dto.cnWarehouseId,
        weight: dto.weight,
        length: dto.length,
        width: dto.width,
        height: dto.height,
        sourceTrackingCode: dto.sourceTrackingCode?.trim() || undefined,
        ...this.claim(order, userId),
      },
    );

    return { order: updated, amounts: await this.amounts(updated) };
  }

  async depart(id: string, dto: DepartOrderDto, userId: string) {
    const order = await this.load(id);

    // A consignment cannot leave China until the customer has accepted the
    // shipping quote, otherwise we would be shipping at a price nobody agreed.
    if (
      order.type === OrderType.CONSIGNMENT &&
      order.status === OrderStatus.QUOTED &&
      !order.quoteApprovedAt
    ) {
      throw new BadRequestException(
        'Khách chưa duyệt báo cước, chưa thể xuất hàng',
      );
    }

    const updated = await this.advance(
      order,
      OrderStatus.IN_TRANSIT_TO_VN,
      dto.note ?? 'Hàng đã xuất khỏi kho Trung Quốc',
      {
        estimatedDelivery: dto.estimatedDelivery
          ? new Date(dto.estimatedDelivery)
          : undefined,
        ...this.claim(order, userId),
      },
    );

    return { order: updated, amounts: await this.amounts(updated) };
  }

  async vnReceive(id: string, dto: VnReceiveDto, userId: string) {
    const order = await this.load(id);

    if (dto.warehouseId) {
      const warehouse = await this.prisma.warehouse.findFirst({
        where: { id: dto.warehouseId, country: 'VN' },
      });
      if (!warehouse) {
        throw new BadRequestException('Kho nhận phải là kho Việt Nam');
      }
    }

    const updated = await this.advance(
      order,
      OrderStatus.AT_VN_WAREHOUSE,
      dto.note ?? 'Hàng đã về kho Việt Nam',
      { warehouseId: dto.warehouseId, ...this.claim(order, userId) },
    );

    const amounts = await this.amounts(updated);
    if (amounts.dueCny > 0 && updated.customerId) {
      await this.notificationsService.notifyOrderStatusChange(
        updated,
        `Về kho Việt Nam. Còn phải thanh toán ¥${amounts.dueCny.toFixed(2)}`,
      );
    }

    return { order: updated, amounts };
  }

  /** Thu nốt phần còn thiếu rồi chuyển sang đã thanh toán. */
  async settle(id: string, dto: SettleOrderDto, userId: string) {
    const order = await this.load(id);
    const amounts = await this.amounts(order);

    const amount = dto.amount ?? amounts.dueCny;
    if (amount <= 0) {
      throw new BadRequestException('Đơn hàng không còn khoản phải thu');
    }

    await this.charge(
      order,
      WalletTransactionType.ORDER_PAYMENT,
      amount,
      dto.note ?? `Thanh toán đơn ${order.billOfLadingCode}`,
      userId,
    );

    const remaining = this.round(amounts.dueCny - amount);
    const updated = await this.advance(
      order,
      remaining > 0 ? order.status : OrderStatus.PAID,
      `Thu ¥${amount.toFixed(2)} từ ví khách${
        remaining > 0 ? `, còn thiếu ¥${remaining.toFixed(2)}` : ''
      }`,
      {
        walletPaidAmount: { increment: amount },
        ...this.claim(order, userId),
        ...(remaining > 0
          ? {}
          : {
              paymentStatus: PaymentStatus.PAID,
              paymentMethod: PaymentMethod.BALANCE,
            }),
      },
    );

    return { order: updated, amounts: await this.amounts(updated) };
  }

  async requestDelivery(id: string, note: string | undefined) {
    const order = await this.load(id);
    const updated = await this.advance(
      order,
      OrderStatus.DELIVERY_REQUESTED,
      note ?? 'Đã tạo yêu cầu giao hàng',
    );
    return { order: updated, amounts: await this.amounts(updated) };
  }

  async deliver(id: string, dto: DeliverOrderDto, userId: string) {
    const order = await this.load(id);
    const amounts = await this.amounts(order);

    if (amounts.dueCny > 0) {
      throw new BadRequestException(
        `Còn phải thu ¥${amounts.dueCny.toFixed(2)} trước khi giao hàng`,
      );
    }

    const updated = await this.advance(
      order,
      OrderStatus.COMPLETED,
      dto.note ?? 'Đã giao hàng cho khách',
      { driverId: dto.driverId, ...this.claim(order, userId) },
    );

    return { order: updated, amounts: await this.amounts(updated) };
  }

  /**
   * Cancelling refunds whatever we are still holding, unless staff say
   * otherwise — for example when the goods were already bought and cannot be
   * returned.
   */
  async cancel(id: string, dto: CancelOrderDto, userId: string) {
    const order = await this.load(id);

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Đơn hàng đã bị huỷ trước đó');
    }

    const refund = dto.refund ?? true;
    const paid = Number(order.depositAmount) + Number(order.walletPaidAmount);

    if (refund && paid > 0) {
      await this.charge(
        order,
        WalletTransactionType.ORDER_REFUND,
        paid,
        `Hoàn tiền huỷ đơn ${order.billOfLadingCode}: ${dto.reason}`,
        userId,
      );
    }

    const updated = await this.advance(
      order,
      OrderStatus.CANCELLED,
      `Huỷ đơn: ${dto.reason}${
        refund && paid > 0 ? ` — đã hoàn ¥${paid.toFixed(2)}` : ''
      }`,
      refund && paid > 0
        ? {
            depositAmount: 0,
            walletPaidAmount: 0,
            paymentStatus: PaymentStatus.REFUNDED,
          }
        : {},
    );

    return { order: updated, amounts: await this.amounts(updated) };
  }

  async updateItems(id: string, dto: UpdateOrderItemsDto) {
    const order = await this.load(id);
    const updates = this.applyItemUpdates(order, dto.items);
    if (updates.length > 0) await this.prisma.$transaction(updates);

    const fresh = await this.load(order.id);
    return { order: fresh, amounts: await this.amounts(fresh) };
  }

  // -------------------------------------------------------------- customer

  /**
   * The customer accepts the quote. Money moves here, in one transaction with
   * the status change, so a wallet that cannot cover it leaves the order
   * exactly as it was.
   */
  async approveQuote(customerId: string, id: string) {
    const order = await this.loadForCustomer(customerId, id);

    assertStatusIn(
      order.type,
      order.status,
      [OrderStatus.QUOTED],
      'duyệt báo giá',
    );

    if (order.quoteExpiresAt && order.quoteExpiresAt < new Date()) {
      throw new BadRequestException(
        'Báo giá đã hết hạn. Vui lòng liên hệ nhân viên để báo giá lại.',
      );
    }

    const amounts = await this.amounts(order);

    // Consignment only ever owes shipping, and shipping is collected when the
    // parcel lands in Vietnam. Accepting the quote costs nothing today.
    if (!chargesGoodsOnApproval(order.type)) {
      const updated = await this.prisma.order.update({
        where: { id: order.id },
        data: {
          quoteApprovedAt: new Date(),
          events: {
            create: {
              status: order.status,
              note: 'Khách duyệt báo cước',
            },
          },
        },
        include: ORDER_INCLUDE,
      });
      return { order: updated, amounts: await this.amounts(updated) };
    }

    const charge = amounts.goodsCny;
    if (charge <= 0) {
      throw new BadRequestException('Báo giá chưa có tiền hàng để thu');
    }

    const balance = Number(order.customer?.balance ?? 0);
    if (balance < charge) {
      throw new BadRequestException(
        `Số dư ví không đủ. Cần ¥${charge.toFixed(2)}, hiện có ¥${balance.toFixed(2)}`,
      );
    }

    await this.charge(
      order,
      WalletTransactionType.ORDER_DEPOSIT,
      charge,
      `Thanh toán tiền hàng đơn ${order.billOfLadingCode}`,
    );

    const next = statusAfterQuoteApproval(order.type) ?? order.status;
    const updated = await this.advance(
      order,
      next,
      `Khách duyệt báo giá, đã thu ¥${charge.toFixed(2)}`,
      {
        depositAmount: { increment: charge },
        quoteApprovedAt: new Date(),
      },
    );

    return { order: updated, amounts: await this.amounts(updated) };
  }

  async rejectQuote(customerId: string, id: string, dto: RejectQuoteDto) {
    const order = await this.loadForCustomer(customerId, id);

    assertStatusIn(
      order.type,
      order.status,
      [OrderStatus.QUOTED],
      'từ chối báo giá',
    );

    const updated = await this.advance(
      order,
      OrderStatus.CANCELLED,
      `Khách từ chối báo giá${dto.reason ? `: ${dto.reason}` : ''}`,
    );

    await this.notifyStaff(
      updated,
      'Khách từ chối báo giá',
      `Đơn ${updated.billOfLadingCode} bị khách từ chối${
        dto.reason ? `: ${dto.reason}` : ''
      }`,
    );

    return { order: updated, amounts: await this.amounts(updated) };
  }

  /** Khách tự huỷ khi chưa có khoản nào được chi. */
  async cancelByCustomer(
    customerId: string,
    id: string,
    dto: CancelRequestDto,
  ) {
    const order = await this.loadForCustomer(customerId, id);

    const cancellable: OrderStatus[] = [
      OrderStatus.NEW_REQUEST,
      OrderStatus.QUOTED,
      OrderStatus.AWAITING_CN_ARRIVAL,
    ];
    if (!cancellable.includes(order.status)) {
      throw new ForbiddenException(
        'Đơn đã được xử lý, vui lòng liên hệ nhân viên để huỷ',
      );
    }

    const paid = Number(order.depositAmount) + Number(order.walletPaidAmount);
    if (paid > 0) {
      await this.charge(
        order,
        WalletTransactionType.ORDER_REFUND,
        paid,
        `Hoàn tiền huỷ đơn ${order.billOfLadingCode}`,
      );
    }

    const updated = await this.advance(
      order,
      OrderStatus.CANCELLED,
      `Khách huỷ yêu cầu${dto.reason ? `: ${dto.reason}` : ''}`,
      paid > 0
        ? {
            depositAmount: 0,
            walletPaidAmount: 0,
            paymentStatus: PaymentStatus.REFUNDED,
          }
        : {},
    );

    await this.notifyStaff(
      updated,
      'Khách huỷ đơn',
      `Đơn ${updated.billOfLadingCode} bị khách huỷ${
        dto.reason ? `: ${dto.reason}` : ''
      }`,
    );

    return { order: updated, amounts: await this.amounts(updated) };
  }

  async summaryForCustomer(customerId: string, id: string) {
    const order = await this.loadForCustomer(customerId, id);
    return {
      order,
      amounts: await this.amounts(order),
      ...this.flowInfo(order),
    };
  }

  private async notifyStaff(order: OrderRow, title: string, message: string) {
    await this.notificationsService.notifyStaffAboutOrder(
      order,
      title,
      message,
    );
  }
}
