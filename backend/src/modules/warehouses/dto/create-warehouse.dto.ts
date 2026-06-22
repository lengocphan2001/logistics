import { IsNotEmpty, IsString } from 'class-validator';

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
}
