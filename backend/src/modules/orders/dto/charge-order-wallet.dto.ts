import {
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import type { WalletTransactionType } from '@prisma/client';

const ORDER_CHARGE_TYPES = [
  'ORDER_DEPOSIT',
  'ORDER_PAYMENT',
] as const satisfies readonly WalletTransactionType[];

export class ChargeOrderWalletDto {
  @IsIn([...ORDER_CHARGE_TYPES], {
    message: 'Loại giao dịch không hợp lệ',
  })
  type: (typeof ORDER_CHARGE_TYPES)[number];

  @IsNumber({}, { message: 'Số tiền phải là số' })
  @Min(0.01, { message: 'Số tiền phải lớn hơn 0' })
  @Type(() => Number)
  amount: number;

  @IsString()
  @IsOptional()
  note?: string;
}

export class RefundOrderWalletDto {
  @IsNumber({}, { message: 'Số tiền phải là số' })
  @Min(0.01, { message: 'Số tiền phải lớn hơn 0' })
  @Type(() => Number)
  amount: number;

  @IsString()
  @IsOptional()
  note?: string;
}
