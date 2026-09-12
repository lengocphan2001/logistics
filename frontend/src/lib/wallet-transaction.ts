export type WalletTransactionType =
  | 'DEPOSIT'
  | 'WITHDRAWAL'
  | 'ORDER_DEPOSIT'
  | 'ORDER_PAYMENT'
  | 'ORDER_REFUND';

export type WalletTransactionStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export const walletTransactionTypeLabels: Record<WalletTransactionType, string> = {
  DEPOSIT: 'Nạp tiền',
  WITHDRAWAL: 'Rút tiền',
  ORDER_DEPOSIT: 'Đặt cọc đơn',
  ORDER_PAYMENT: 'Thanh toán đơn',
  ORDER_REFUND: 'Hoàn tiền đơn',
};

export const walletTransactionStatusLabels: Record<WalletTransactionStatus, string> = {
  PENDING: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Từ chối',
};

export const walletTransactionTypeBadgeColors: Record<WalletTransactionType, string> = {
  DEPOSIT:
    'border-[var(--ledger-green)] bg-[var(--green-wash)] text-[var(--ledger-green)]',
  ORDER_REFUND:
    'border-[var(--ledger-green)] bg-transparent text-[var(--ledger-green)]',
  WITHDRAWAL:
    'border-[var(--rule-strong)] bg-transparent text-[var(--graphite)]',
  ORDER_DEPOSIT:
    'border-[var(--manifest-navy)] bg-transparent text-[var(--manifest-navy)]',
  ORDER_PAYMENT:
    'border-[var(--navy-wash)] bg-[var(--navy-wash)] text-[var(--manifest-navy)]',
};

export const walletTransactionStatusBadgeColors: Record<WalletTransactionStatus, string> = {
  PENDING: 'border-[var(--rule-strong)] bg-[var(--wash)] text-[var(--graphite)]',
  APPROVED:
    'border-[var(--green-wash)] bg-[var(--green-wash)] text-[var(--ledger-green)]',
  REJECTED: 'border-[var(--seal-red)] bg-[var(--red-wash)] text-[var(--seal-red)]',
};

const CREDIT_TYPES: WalletTransactionType[] = ['DEPOSIT', 'ORDER_REFUND'];

export function isWalletCredit(type: WalletTransactionType): boolean {
  return CREDIT_TYPES.includes(type);
}
