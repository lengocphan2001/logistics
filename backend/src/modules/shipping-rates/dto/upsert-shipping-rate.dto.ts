import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class UpsertShippingRateDto {
  @IsString()
  @MinLength(1, { message: 'Mã tuyến không được để trống' })
  method: string;

  @IsString()
  @MinLength(1, { message: 'Tên tuyến không được để trống' })
  name: string;

  @IsNumber({}, { message: 'Đơn giá theo kg phải là số' })
  @Min(0)
  pricePerKgVnd: number;

  @IsOptional()
  @IsNumber({}, { message: 'Phí tối thiểu phải là số' })
  @Min(0)
  minChargeVnd?: number;

  @IsOptional()
  @IsString()
  estimatedDays?: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
