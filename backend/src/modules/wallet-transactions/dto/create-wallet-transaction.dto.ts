import { IsBoolean, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';
import type { WalletTransactionType } from '@prisma/client';

const MANUAL_WALLET_TYPES = ['DEPOSIT', 'WITHDRAWAL'] as const satisfies readonly WalletTransactionType[];

export class CreateWalletTransactionDto {
  @IsUUID('4', { message: 'ID khách hàng không hợp lệ' })
  @IsNotEmpty({ message: 'Khách hàng không được để trống' })
  customerId: string;

  @IsIn([...MANUAL_WALLET_TYPES], {
    message: 'Chỉ hỗ trợ nạp/rút thủ công',
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

  @IsNumber()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  exchangeRate?: number;

  @IsString()
  @IsOptional()
  note?: string;

  @IsString()
  @IsOptional()
  referenceCode?: string;

  @IsBoolean()
  @IsOptional()
  approveImmediately?: boolean;
}
