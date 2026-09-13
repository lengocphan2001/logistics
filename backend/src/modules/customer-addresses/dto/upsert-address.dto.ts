import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class UpsertAddressDto {
  @IsOptional()
  @IsString()
  label?: string;

  @IsString()
  @MinLength(1, { message: 'Tên người nhận không được để trống' })
  receiverName: string;

  @IsString()
  @MinLength(1, { message: 'Số điện thoại không được để trống' })
  receiverPhone: string;

  @IsString()
  @MinLength(1, { message: 'Địa chỉ không được để trống' })
  receiverAddress: string;

  @IsOptional()
  @IsString()
  receiverProvince?: string;

  @IsOptional()
  @IsString()
  receiverDistrict?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
