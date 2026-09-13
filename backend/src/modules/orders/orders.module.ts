import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { CustomerOrdersController } from './customer-orders.controller';
import { PrismaModule } from '../../database/prisma.module';
import { WalletTransactionsModule } from '../wallet-transactions/wallet-transactions.module';
import { ProductsModule } from '../products/products.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    PrismaModule,
    WalletTransactionsModule,
    ProductsModule,
    NotificationsModule,
  ],
  controllers: [OrdersController, CustomerOrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
