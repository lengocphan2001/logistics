import { Module } from '@nestjs/common';
import { CustomerAddressesController } from './customer-addresses.controller';
import { CustomerAddressesService } from './customer-addresses.service';
import { PrismaModule } from '../../database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CustomerAddressesController],
  providers: [CustomerAddressesService],
})
export class CustomerAddressesModule {}
