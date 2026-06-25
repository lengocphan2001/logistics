import {
  IsString,
  IsInt,
  IsOptional,
  IsNumber,
  Min,
  MaxLength,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CartItemPropertyDto {
  @IsString() name: string;
  @IsString() value: string;
}

export class UpsertCartItemDto {
  @IsString()
  itemId: string;

  @IsString()
  providerAlias: string;

  @IsOptional()
  @IsString()
  skuId?: string;

  @IsString()
  @MaxLength(500)
  title: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsString()
  shopId?: string;

  @IsOptional()
  @IsString()
  shopName?: string;

  @IsOptional()
  @IsString()
  platform?: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  priceCny: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItemPropertyDto)
  properties?: CartItemPropertyDto[];

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
