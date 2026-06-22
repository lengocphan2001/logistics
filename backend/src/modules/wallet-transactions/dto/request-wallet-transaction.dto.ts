import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import type { WalletTransactionType } from '@prisma/client';

const MANUAL_WALLET_TYPES = ['DEPOSIT', 'WITHDRAWAL'] as const satisfies readonly WalletTransactionType[];

export class RequestWalletTransactionDto {
  @IsIn([...MANUAL_WALLET_TYPES], {
    message: 'Chỉ hỗ trợ yêu cầu nạp hoặc rút tiền',
  })
  type: (typeof MANUAL_WALLET_TYPES)[number];

  @IsNumber({}, { message: 'Số tiền phải là số' })
  @Min(0.01, { message: 'Số tiền phải lớn hơn 0' })
  @Type(() => Number)
  amount: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  vndAmount?: number;

  @IsString()
  @IsOptional()
  note?: string;

  @IsString()
  @IsOptional()
  referenceCode?: string;
}
