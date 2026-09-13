import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './database/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { WarehousesModule } from './modules/warehouses/warehouses.module';
import { CustomersModule } from './modules/customers/customers.module';
import { OrdersModule } from './modules/orders/orders.module';
import { TrackingModule } from './modules/tracking/tracking.module';
import { ShippingRatesModule } from './modules/shipping-rates/shipping-rates.module';
import { CustomerAddressesModule } from './modules/customer-addresses/customer-addresses.module';
import { SettingsModule } from './modules/settings/settings.module';
import { WalletTransactionsModule } from './modules/wallet-transactions/wallet-transactions.module';
import { ProductsModule } from './modules/products/products.module';
import { CartModule } from './modules/cart/cart.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    ThrottlerModule.forRoot([
      { name: 'short', ttl: 60_000, limit: 30 }, // 30 req/min default
      { name: 'medium', ttl: 60_000, limit: 100 }, // 100 req/min general
    ]),

    CacheModule.register({ isGlobal: true, ttl: 300_000 }), // 5 min default

    PrismaModule,
    AuthModule,
    UsersModule,
    WarehousesModule,
    CustomersModule,
    OrdersModule,
    TrackingModule,
    ShippingRatesModule,
    CustomerAddressesModule,
    SettingsModule,
    WalletTransactionsModule,
    ProductsModule,
    CartModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Apply throttler globally; individual controllers can override via @Throttle()
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
