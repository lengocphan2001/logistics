import { BadRequestException } from '@nestjs/common';
import { OrderStatus, OrderType } from '@prisma/client';

/**
 * The four order types are four different jobs, so they are four different
 * paths through the status list. Buying on behalf has a purchase step;
 * paying on behalf pays the shop but never buys; consignment does neither and
 * only starts once the parcel reaches the Chinese warehouse.
 *
 * Everything staff may do to an order is derived from these arrays: which
 * buttons the admin shows, which transitions the API accepts, and which steps
 * the customer sees on the timeline.
 */
export const ORDER_FLOW: Record<OrderType, OrderStatus[]> = {
  // Paid in full at checkout, so the order opens already deposited.
  PROXY_PURCHASE: [
    OrderStatus.DEPOSIT_PAID,
    OrderStatus.PURCHASED,
    OrderStatus.SHOP_SHIPPED,
    OrderStatus.AT_CN_WAREHOUSE,
    OrderStatus.IN_TRANSIT_TO_VN,
    OrderStatus.AT_VN_WAREHOUSE,
    OrderStatus.PAID,
    OrderStatus.DELIVERY_REQUESTED,
    OrderStatus.COMPLETED,
  ],

  // The customer only supplies links, so staff price it before anything is
  // charged. From DEPOSIT_PAID onwards it is identical to buying on behalf.
  PROXY_ORDER: [
    OrderStatus.NEW_REQUEST,
    OrderStatus.QUOTED,
    OrderStatus.DEPOSIT_PAID,
    OrderStatus.PURCHASED,
    OrderStatus.SHOP_SHIPPED,
    OrderStatus.AT_CN_WAREHOUSE,
    OrderStatus.IN_TRANSIT_TO_VN,
    OrderStatus.AT_VN_WAREHOUSE,
    OrderStatus.PAID,
    OrderStatus.DELIVERY_REQUESTED,
    OrderStatus.COMPLETED,
  ],

  // The customer already placed the order on the marketplace. There is nothing
  // to buy; PURCHASED here means the shop has been paid.
  PROXY_PAYMENT: [
    OrderStatus.NEW_REQUEST,
    OrderStatus.QUOTED,
    OrderStatus.DEPOSIT_PAID,
    OrderStatus.PURCHASED,
    OrderStatus.SHOP_SHIPPED,
    OrderStatus.AT_CN_WAREHOUSE,
    OrderStatus.IN_TRANSIT_TO_VN,
    OrderStatus.AT_VN_WAREHOUSE,
    OrderStatus.PAID,
    OrderStatus.DELIVERY_REQUESTED,
    OrderStatus.COMPLETED,
  ],

  // Nothing is bought and nothing is paid to a shop. The quote comes after the
  // parcel is weighed, because until then there is no shipping cost to quote.
  CONSIGNMENT: [
    OrderStatus.NEW_REQUEST,
    OrderStatus.AWAITING_CN_ARRIVAL,
    OrderStatus.AT_CN_WAREHOUSE,
    OrderStatus.QUOTED,
    OrderStatus.IN_TRANSIT_TO_VN,
    OrderStatus.AT_VN_WAREHOUSE,
    OrderStatus.PAID,
    OrderStatus.DELIVERY_REQUESTED,
    OrderStatus.COMPLETED,
  ],
};

/** Reachable from anywhere, and not part of any type's forward path. */
export const SIDE_STATUSES: OrderStatus[] = [
  OrderStatus.CANCELLED,
  OrderStatus.COMPLAINT,
];

/**
 * PURCHASED means "bought it" for the two buying flows and "paid the shop" for
 * pay-on-behalf. Same state, different sentence, so the wording is resolved per
 * type instead of adding an enum value that only differs in its label.
 */
const LABEL_OVERRIDES: Partial<
  Record<OrderType, Partial<Record<OrderStatus, string>>>
> = {
  PROXY_PAYMENT: {
    PURCHASED: 'Đã thanh toán cho shop',
    DEPOSIT_PAID: 'Đã thu tiền của khách',
  },
  CONSIGNMENT: {
    QUOTED: 'Đã báo cước, chờ khách duyệt',
  },
};

const BASE_LABELS: Record<OrderStatus, string> = {
  NEW_REQUEST: 'Yêu cầu mới',
  QUOTED: 'Đã báo giá, chờ khách duyệt',
  CANCELLED: 'Đã hủy',
  DEPOSIT_PAID: 'Đã thu tiền hàng',
  AWAITING_CN_ARRIVAL: 'Chờ hàng về kho Trung Quốc',
  PURCHASED: 'Đã mua hàng',
  SHOP_SHIPPED: 'Shop phát hàng',
  AT_CN_WAREHOUSE: 'Đã về kho Trung Quốc',
  IN_TRANSIT_TO_VN: 'Đang về Việt Nam',
  AT_VN_WAREHOUSE: 'Về kho Việt Nam',
  PAID: 'Đã thanh toán',
  COMPLETED: 'Hoàn thành',
  COMPLAINT: 'Khiếu nại',
  DELIVERY_REQUESTED: 'Yêu cầu giao',
};

export function statusLabelFor(type: OrderType, status: OrderStatus): string {
  return LABEL_OVERRIDES[type]?.[status] ?? BASE_LABELS[status];
}

export function isSideStatus(status: OrderStatus): boolean {
  return SIDE_STATUSES.includes(status);
}

export function flowFor(type: OrderType): OrderStatus[] {
  return ORDER_FLOW[type];
}

/**
 * Forward moves within the type's own path, plus the two side states. Skipping
 * ahead is allowed — a shop that ships the same hour should not force staff to
 * click through an intermediate step — but going backwards is not, because a
 * status that has already been announced to the customer should not silently
 * un-happen. Recovering from a side state is the one exception.
 */
export function allowedNextStatuses(
  type: OrderType,
  current: OrderStatus,
): OrderStatus[] {
  const flow = flowFor(type);

  if (isSideStatus(current)) {
    return [...flow, ...SIDE_STATUSES.filter((s) => s !== current)];
  }

  const index = flow.indexOf(current);
  const forward = index === -1 ? flow : flow.slice(index + 1);
  return [...forward, ...SIDE_STATUSES];
}

export function canTransition(
  type: OrderType,
  from: OrderStatus,
  to: OrderStatus,
): boolean {
  if (from === to) return true;
  return allowedNextStatuses(type, from).includes(to);
}

/** Throws with wording staff can act on, naming both the type and the step. */
export function assertTransition(
  type: OrderType,
  from: OrderStatus,
  to: OrderStatus,
  typeLabel: string,
): void {
  if (canTransition(type, from, to)) return;

  const flow = flowFor(type);
  if (!flow.includes(to) && !isSideStatus(to)) {
    throw new BadRequestException(
      `Đơn ${typeLabel} không có bước "${statusLabelFor(type, to)}"`,
    );
  }

  throw new BadRequestException(
    `Không thể chuyển từ "${statusLabelFor(type, from)}" sang "${statusLabelFor(
      type,
      to,
    )}". Các bước hợp lệ: ${allowedNextStatuses(type, from)
      .map((s) => `"${statusLabelFor(type, s)}"`)
      .join(', ')}`,
  );
}

/**
 * The step an action expects the order to be in. An action endpoint checks this
 * rather than trusting the caller, so a double click cannot buy twice.
 */
export function assertStatusIn(
  type: OrderType,
  current: OrderStatus,
  expected: OrderStatus[],
  action: string,
): void {
  if (expected.includes(current)) return;
  throw new BadRequestException(
    `Không thể ${action} khi đơn đang ở trạng thái "${statusLabelFor(
      type,
      current,
    )}"`,
  );
}

/** Types where staff quote the price before any money moves. */
export const QUOTABLE_TYPES: OrderType[] = [
  OrderType.PROXY_ORDER,
  OrderType.PROXY_PAYMENT,
  OrderType.CONSIGNMENT,
];

/** Types with a real purchase or a payment made to the shop. */
export const PURCHASING_TYPES: OrderType[] = [
  OrderType.PROXY_PURCHASE,
  OrderType.PROXY_ORDER,
  OrderType.PROXY_PAYMENT,
];

/**
 * What the customer pays up front once they approve a quote. Pay-on-behalf and
 * order-on-behalf settle the goods in full; consignment has no goods of ours to
 * pay for, only shipping, which is collected when the parcel reaches Vietnam.
 */
export function chargesGoodsOnApproval(type: OrderType): boolean {
  return type === OrderType.PROXY_ORDER || type === OrderType.PROXY_PAYMENT;
}

/**
 * Where an order lands right after the customer approves the quote. A
 * consignment quote is only about shipping, so approving it does not move the
 * parcel; it stays at QUOTED until the warehouse actually sends it.
 */
export function statusAfterQuoteApproval(type: OrderType): OrderStatus | null {
  return chargesGoodsOnApproval(type) ? OrderStatus.DEPOSIT_PAID : null;
}
