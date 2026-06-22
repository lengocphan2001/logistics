export type WalletTransactionType =
  | 'DEPOSIT'
  | 'WITHDRAWAL'
  | 'ORDER_DEPOSIT'
  | 'ORDER_PAYMENT'
  | 'ORDER_REFUND';

export type WalletTransactionStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export const WALLET_TRANSACTION_TYPES: WalletTransactionType[] = [
  'DEPOSIT',
  'WITHDRAWAL',
  'ORDER_DEPOSIT',
  'ORDER_PAYMENT',
  'ORDER_REFUND',
];

export const MANUAL_WALLET_TYPES: WalletTransactionType[] = ['DEPOSIT', 'WITHDRAWAL'];

export const WALLET_TRANSACTION_STATUSES: WalletTransactionStatus[] = [
  'PENDING',
  'APPROVED',
  'REJECTED',
];

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
    'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300',
  WITHDRAWAL:
    'border-orange-300 bg-orange-50 text-orange-800 dark:border-orange-800 dark:bg-orange-950/50 dark:text-orange-300',
  ORDER_DEPOSIT:
    'border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-300',
  ORDER_PAYMENT:
    'border-violet-300 bg-violet-50 text-violet-800 dark:border-violet-800 dark:bg-violet-950/50 dark:text-violet-300',
  ORDER_REFUND:
    'border-cyan-300 bg-cyan-50 text-cyan-800 dark:border-cyan-800 dark:bg-cyan-950/50 dark:text-cyan-300',
};

export const walletTransactionStatusBadgeColors: Record<WalletTransactionStatus, string> = {
  PENDING:
    'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300',
  APPROVED:
    'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300',
  REJECTED:
    'border-red-300 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300',
};

const CREDIT_TYPES: WalletTransactionType[] = ['DEPOSIT', 'ORDER_REFUND'];

export function isWalletCredit(type: WalletTransactionType): boolean {
  return CREDIT_TYPES.includes(type);
}
