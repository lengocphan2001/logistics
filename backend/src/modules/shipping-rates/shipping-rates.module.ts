import { Module } from '@nestjs/common';
import { ShippingRatesController } from './shipping-rates.controller';
import { ShippingRatesService } from './shipping-rates.service';
import { PrismaModule } from '../../database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ShippingRatesController],
  providers: [ShippingRatesService],
  exports: [ShippingRatesService],
})
export class ShippingRatesModule {}
