import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod, PaymentStatus, OrderType } from '@prisma/client';

export class CreateOrderDto {
  @IsEnum(OrderType, { message: 'Loại đơn hàng không hợp lệ' })
  @IsNotEmpty({ message: 'Loại đơn hàng không được để trống' })
  type: OrderType;

  @IsString()
  @IsNotEmpty()
  senderName: string;

  @IsString()
  @IsNotEmpty()
  senderPhone: string;

  @IsString()
  @IsNotEmpty()
  senderAddress: string;

  @IsString()
  @IsNotEmpty()
  receiverName: string;

  @IsString()
  @IsNotEmpty()
  receiverPhone: string;

  @IsString()
  @IsNotEmpty()
  receiverAddress: string;

  @IsString()
  @IsOptional()
  receiverProvince?: string;

  @IsString()
  @IsOptional()
  receiverDistrict?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  weight?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  length?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  width?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  height?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  quantity?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  declaredValue?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  codAmount?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  feeTransfer?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  feeInsurance?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  feeExtra?: number;

  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod;

  @IsEnum(PaymentStatus)
  @IsOptional()
  paymentStatus?: PaymentStatus;

  @IsString()
  @IsOptional()
  note?: string;

  @IsDateString()
  @IsOptional()
  estimatedDelivery?: string;

  @IsUUID()
  @IsOptional()
  customerId?: string;

  @IsUUID()
  @IsOptional()
  driverId?: string;

  @IsUUID()
  @IsOptional()
  warehouseId?: string;
}
