import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { OrderType } from '@prisma/client';

/**
 * The three request types a customer can raise by hand. Buying through the
 * catalogue (PROXY_PURCHASE) goes through the cart and its own checkout, so it
 * is deliberately not accepted here.
 */
export const CUSTOMER_REQUEST_TYPES = [
  OrderType.PROXY_ORDER,
  OrderType.PROXY_PAYMENT,
  OrderType.CONSIGNMENT,
] as const;

export class CustomerOrderItemDto {
  @IsString()
  @MinLength(1, { message: 'Tên sản phẩm không được để trống' })
  title: string;

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsInt({ message: 'Số lượng phải là số nguyên' })
  @Min(1, { message: 'Số lượng phải từ 1 trở lên' })
  quantity: number;

  @IsOptional()
  @IsNumber({}, { message: 'Đơn giá phải là số' })
  @Min(0)
  priceCny?: number;
}

export class CreateCustomerOrderDto {
  @IsEnum(CUSTOMER_REQUEST_TYPES, {
    message: 'Loại yêu cầu phải là đặt hàng hộ, thanh toán hộ hoặc ký gửi',
  })
  type: (typeof CUSTOMER_REQUEST_TYPES)[number];

  @IsString()
  @MinLength(1, { message: 'Tên người nhận không được để trống' })
  receiverName: string;

  @IsString()
  @MinLength(1, { message: 'Số điện thoại người nhận không được để trống' })
  receiverPhone: string;

  @IsString()
  @MinLength(1, { message: 'Địa chỉ nhận hàng không được để trống' })
  receiverAddress: string;

  @IsOptional()
  @IsString()
  receiverProvince?: string;

  @IsOptional()
  @IsString()
  receiverDistrict?: string;

  @IsOptional()
  @IsString()
  note?: string;

  /** Kho Trung Quốc tiếp nhận hàng. */
  @IsOptional()
  @IsUUID()
  cnWarehouseId?: string;

  /** Kho Việt Nam giao cho khách. */
  @IsOptional()
  @IsUUID()
  vnWarehouseId?: string;

  @IsOptional()
  @IsString()
  shippingMethod?: string;

  /** PROXY_ORDER: danh sách sản phẩm khách muốn đặt hộ. */
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1, { message: 'Cần ít nhất một sản phẩm' })
  @ValidateNested({ each: true })
  @Type(() => CustomerOrderItemDto)
  items?: CustomerOrderItemDto[];

  /** PROXY_PAYMENT: mã đơn khách đã tạo trên sàn. */
  @IsOptional()
  @IsString()
  sourceOrderCode?: string;

  /** PROXY_PAYMENT: số tiền cần thanh toán hộ (¥). */
  @IsOptional()
  @IsNumber({}, { message: 'Số tiền phải là số' })
  @Min(0)
  amountCny?: number;

  /** CONSIGNMENT: mã vận đơn nội địa Trung Quốc. */
  @IsOptional()
  @IsString()
  sourceTrackingCode?: string;

  /** CONSIGNMENT: mô tả hàng hoá để kho đối chiếu. */
  @IsOptional()
  @IsString()
  description?: string;
}
