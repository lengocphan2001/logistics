import { IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateExchangeRateDto {
  @IsNumber({}, { message: 'Tỉ giá phải là số' })
  @Min(1, { message: 'Tỉ giá phải lớn hơn 0' })
  @Type(() => Number)
  vndPerCny: number;
}
