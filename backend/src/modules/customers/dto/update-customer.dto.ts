import {
  IsDateString,
  IsEmail,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Gender } from '@prisma/client';
import { CustomerBankInfoDto } from './customer-bank-info.dto';

const GENDERS = [
  'MALE',
  'FEMALE',
  'OTHER',
] as const satisfies readonly Gender[];

export class UpdateCustomerDto {
  @IsString()
  @IsOptional()
  fullName?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsDateString({}, { message: 'Ngày sinh không hợp lệ' })
  @IsOptional()
  dateOfBirth?: string;

  @IsIn([...GENDERS], { message: 'Giới tính không hợp lệ' })
  @IsOptional()
  gender?: Gender;

  @IsString()
  @IsOptional()
  shippingAddress?: string;

  @ValidateNested()
  @Type(() => CustomerBankInfoDto)
  @IsOptional()
  bankInfo?: CustomerBankInfoDto;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  balance?: number;

  @IsString()
  @IsOptional()
  note?: string;

  @IsString()
  @IsOptional()
  status?: string;
}
