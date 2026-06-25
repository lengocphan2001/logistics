import { IsString, IsOptional, IsArray, IsUUID } from 'class-validator';

export class CheckoutDto {
  @IsString()
  receiverName: string;

  @IsString()
  receiverPhone: string;

  @IsString()
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

  /**
   * Nếu không truyền cartItemIds thì checkout toàn bộ giỏ hàng.
   * Nếu truyền thì chỉ checkout những item được chọn.
   */
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  cartItemIds?: string[];

  /** Kho Việt Nam nhận hàng (warehouses.country = VN) */
  @IsOptional()
  @IsUUID()
  vnWarehouseId?: string;

  /** Kho Trung Quốc (warehouses.country = CN) */
  @IsOptional()
  @IsUUID()
  cnWarehouseId?: string;

  @IsOptional()
  @IsString()
  shippingMethod?: string;
}
