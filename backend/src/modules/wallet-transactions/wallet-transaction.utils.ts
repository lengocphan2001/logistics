import { WalletTransactionType } from '@prisma/client';

export const WALLET_CREDIT_TYPES: WalletTransactionType[] = [
  WalletTransactionType.DEPOSIT,
  WalletTransactionType.ORDER_REFUND,
];

export const WALLET_DEBIT_TYPES: WalletTransactionType[] = [
  WalletTransactionType.WITHDRAWAL,
  WalletTransactionType.ORDER_DEPOSIT,
  WalletTransactionType.ORDER_PAYMENT,
];

export const MANUAL_WALLET_TYPES: WalletTransactionType[] = [
  WalletTransactionType.DEPOSIT,
  WalletTransactionType.WITHDRAWAL,
];

export const ORDER_WALLET_TYPES: WalletTransactionType[] = [
  WalletTransactionType.ORDER_DEPOSIT,
  WalletTransactionType.ORDER_PAYMENT,
  WalletTransactionType.ORDER_REFUND,
];

export function isWalletCredit(type: WalletTransactionType): boolean {
  return WALLET_CREDIT_TYPES.includes(type);
}
