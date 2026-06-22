import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RejectWalletTransactionDto {
  @IsString()
  @IsNotEmpty({ message: 'Lý do từ chối không được để trống' })
  rejectReason: string;
}

export class ApproveWalletTransactionDto {
  @IsString()
  @IsOptional()
  note?: string;
}
