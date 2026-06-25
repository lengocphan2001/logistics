import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { CustomerOrdersController } from './customer-orders.controller';
import { PrismaModule } from '../../database/prisma.module';
import { WalletTransactionsModule } from '../wallet-transactions/wallet-transactions.module';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [PrismaModule, WalletTransactionsModule, ProductsModule],
  controllers: [OrdersController, CustomerOrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
