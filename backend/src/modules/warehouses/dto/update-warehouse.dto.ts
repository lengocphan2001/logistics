import { IsEnum, IsOptional, IsString } from 'class-validator';
import { WarehouseCountry } from '@prisma/client';

export class UpdateWarehouseDto {
  @IsString({ message: 'Tên kho phải là chuỗi' })
  @IsOptional()
  name?: string;

  @IsString({ message: 'Mã kho phải là chuỗi' })
  @IsOptional()
  code?: string;

  @IsString({ message: 'Địa chỉ kho phải là chuỗi' })
  @IsOptional()
  address?: string;

  @IsOptional()
  @IsEnum(WarehouseCountry, { message: 'Quốc gia kho phải là CN hoặc VN' })
  country?: WarehouseCountry;
}
