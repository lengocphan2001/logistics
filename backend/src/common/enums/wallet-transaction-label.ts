import { WalletTransactionStatus, WalletTransactionType } from '@prisma/client';

/** Vietnamese wording for wallet ledger rows, for server-generated documents. */
export const walletTransactionTypeLabels: Record<
  WalletTransactionType,
  string
> = {
  DEPOSIT: 'Nạp tiền',
  WITHDRAWAL: 'Rút tiền',
  ORDER_DEPOSIT: 'Đặt cọc đơn',
  ORDER_PAYMENT: 'Thanh toán đơn',
  ORDER_REFUND: 'Hoàn tiền đơn',
};

export const walletTransactionStatusLabels: Record<
  WalletTransactionStatus,
  string
> = {
  PENDING: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Từ chối',
};
