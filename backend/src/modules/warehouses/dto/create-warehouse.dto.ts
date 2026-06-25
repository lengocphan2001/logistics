import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { WarehouseCountry } from '@prisma/client';

export class CreateWarehouseDto {
  @IsString({ message: 'Tên kho phải là chuỗi' })
  @IsNotEmpty({ message: 'Tên kho không được để trống' })
  name: string;

  @IsString({ message: 'Mã kho phải là chuỗi' })
  @IsNotEmpty({ message: 'Mã kho không được để trống' })
  code: string;

  @IsString({ message: 'Địa chỉ kho phải là chuỗi' })
  @IsNotEmpty({ message: 'Địa chỉ kho không được để trống' })
  address: string;

  @IsOptional()
  @IsEnum(WarehouseCountry, { message: 'Quốc gia kho phải là CN hoặc VN' })
  country?: WarehouseCountry;
}
