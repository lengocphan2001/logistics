import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;

  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @MinLength(6, { message: 'Mật khẩu phải tối thiểu 6 ký tự' })
  password: string;

  @IsString({ message: 'Tên phải là một chuỗi ký tự' })
  @IsNotEmpty({ message: 'Tên không được để trống' })
  name: string;

  @IsEnum(Role, { message: 'Role không hợp lệ' })
  @IsNotEmpty({ message: 'Quyền (Role) không được để trống' })
  role: Role;

  @IsString({ message: 'ID kho phải là một chuỗi ký tự' })
  @IsOptional()
  warehouseId?: string;
}
