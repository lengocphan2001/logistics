import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrderWorkflowService } from './order-workflow.service';
import { OrderSlaService } from './order-sla.service';
import { OrdersController } from './orders.controller';
import { OrderWorkflowController } from './order-workflow.controller';
import { CustomerOrdersController } from './customer-orders.controller';
import { PrismaModule } from '../../database/prisma.module';
import { WalletTransactionsModule } from '../wallet-transactions/wallet-transactions.module';
import { ProductsModule } from '../products/products.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [
    PrismaModule,
    WalletTransactionsModule,
    ProductsModule,
    NotificationsModule,
    SettingsModule,
  ],
  controllers: [
    OrdersController,
    OrderWorkflowController,
    CustomerOrdersController,
  ],
  providers: [OrdersService, OrderWorkflowService, OrderSlaService],
  exports: [OrdersService, OrderWorkflowService],
})
export class OrdersModule {}
