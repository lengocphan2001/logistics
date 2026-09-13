import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { OrderItemStatus } from '@prisma/client';

/** Giao đơn cho một nhân viên phụ trách. Bỏ trống để gỡ người phụ trách. */
export class AssignOrderDto {
  @IsOptional()
  @IsUUID('4', { message: 'Nhân viên không hợp lệ' })
  assignedToId?: string | null;
}

/**
 * Báo giá. Số tiền hàng tính bằng ¥ vì đó là đơn vị khách trả cho sàn; các loại
 * phí tính bằng VND vì đó là đơn vị khách trả cho chúng ta.
 */
export class QuoteOrderDto {
  @IsOptional()
  @IsNumber({}, { message: 'Tiền hàng phải là số' })
  @Min(0)
  @Type(() => Number)
  itemsTotalCny?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Phí vận chuyển phải là số' })
  @Min(0)
  @Type(() => Number)
  feeTransfer?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Phí bảo hiểm phải là số' })
  @Min(0)
  @Type(() => Number)
  feeInsurance?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Phụ phí phải là số' })
  @Min(0)
  @Type(() => Number)
  feeExtra?: number;

  /** Báo giá hết hạn sau bao nhiêu giờ. Mặc định 48. */
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(720)
  @Type(() => Number)
  expiresInHours?: number;

  @IsOptional()
  @IsString()
  note?: string;
}

export class OrderItemPurchaseDto {
  @IsUUID()
  id: string;

  @IsEnum(OrderItemStatus, { message: 'Trạng thái sản phẩm không hợp lệ' })
  status: OrderItemStatus;

  @IsOptional()
  @IsNumber({}, { message: 'Giá mua phải là số' })
  @Min(0)
  @Type(() => Number)
  purchasedPriceCny?: number;

  @IsOptional()
  @IsString()
  statusNote?: string;
}

/** Xác nhận đã mua hàng, hoặc với đơn thanh toán hộ là đã trả tiền cho shop. */
export class PurchaseOrderDto {
  @IsOptional()
  @IsString()
  purchaseOrderCode?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemPurchaseDto)
  items?: OrderItemPurchaseDto[];

  @IsOptional()
  @IsString()
  note?: string;
}

/** Kho Trung Quốc nhận hàng: cân đo để tính cước. */
export class CnReceiveDto {
  @IsOptional()
  @IsUUID()
  cnWarehouseId?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Khối lượng phải là số' })
  @Min(0)
  @Type(() => Number)
  weight?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Chiều dài phải là số' })
  @Min(0)
  @Type(() => Number)
  length?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Chiều rộng phải là số' })
  @Min(0)
  @Type(() => Number)
  width?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Chiều cao phải là số' })
  @Min(0)
  @Type(() => Number)
  height?: number;

  @IsOptional()
  @IsString()
  sourceTrackingCode?: string;

  @IsOptional()
  @IsString()
  note?: string;
}

export class DepartOrderDto {
  @IsOptional()
  @IsDateString({}, { message: 'Ngày dự kiến giao không hợp lệ' })
  estimatedDelivery?: string;

  @IsOptional()
  @IsString()
  note?: string;
}

export class VnReceiveDto {
  @IsOptional()
  @IsUUID()
  warehouseId?: string;

  @IsOptional()
  @IsString()
  note?: string;
}

/** Thu nốt phần còn thiếu từ ví khách. */
export class SettleOrderDto {
  /** Bỏ trống để thu đúng số còn thiếu hệ thống tính ra. */
  @IsOptional()
  @IsNumber({}, { message: 'Số tiền phải là số' })
  @Min(0.01)
  @Type(() => Number)
  amount?: number;

  @IsOptional()
  @IsString()
  note?: string;
}

export class DeliverOrderDto {
  @IsOptional()
  @IsUUID()
  driverId?: string;

  @IsOptional()
  @IsString()
  note?: string;
}

export class CancelOrderDto {
  @IsString()
  @MinLength(1, { message: 'Vui lòng nhập lý do huỷ' })
  reason: string;

  /** Hoàn lại toàn bộ số tiền đã thu từ ví. Mặc định có. */
  @IsOptional()
  refund?: boolean;
}

/** Khách từ chối báo giá. */
export class RejectQuoteDto {
  @IsOptional()
  @IsString()
  reason?: string;
}

/** Khách huỷ yêu cầu khi chưa có gì được chi. */
export class CancelRequestDto {
  @IsOptional()
  @IsString()
  reason?: string;
}

/** Cập nhật trạng thái từng dòng hàng ngoài bước mua. */
export class UpdateOrderItemsDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemPurchaseDto)
  items: OrderItemPurchaseDto[];
}
