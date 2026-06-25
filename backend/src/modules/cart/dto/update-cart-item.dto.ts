import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateCartItemDto {
  /** Số lượng — parse/validate trong service để tránh lỗi transform */
  @IsOptional()
  quantity?: number | string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
