import { IsOptional, IsString } from 'class-validator';

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
}
