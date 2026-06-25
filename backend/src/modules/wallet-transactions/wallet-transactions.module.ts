import { Module } from '@nestjs/common';
import { WalletTransactionsService } from './wallet-transactions.service';
import { WalletTransactionsController } from './wallet-transactions.controller';
import { PrismaModule } from '../../database/prisma.module';
import { SettingsModule } from '../settings/settings.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PrismaModule, SettingsModule, NotificationsModule],
  controllers: [WalletTransactionsController],
  providers: [WalletTransactionsService],
  exports: [WalletTransactionsService],
})
export class WalletTransactionsModule {}
