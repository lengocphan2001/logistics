import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { Role } from '@prisma/client';

export class UpdateUserDto {
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsOptional()
  email?: string;

  @MinLength(6, { message: 'Mật khẩu phải tối thiểu 6 ký tự' })
  @IsOptional()
  password?: string;

  @IsString({ message: 'Tên phải là một chuỗi ký tự' })
  @IsOptional()
  name?: string;

  @IsEnum(Role, { message: 'Role không hợp lệ' })
  @IsOptional()
  role?: Role;

  @IsString({ message: 'Trạng thái phải là một chuỗi ký tự' })
  @IsOptional()
  status?: string;

  @IsString({ message: 'ID kho phải là một chuỗi ký tự' })
  @IsOptional()
  warehouseId?: string;
}
