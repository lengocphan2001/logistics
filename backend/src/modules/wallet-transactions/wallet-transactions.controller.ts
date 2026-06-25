import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { WalletTransactionsService } from './wallet-transactions.service';
import {
  ApproveWalletTransactionDto,
  RejectWalletTransactionDto,
} from './dto/process-wallet-transaction.dto';
import { RequestWalletTransactionDto } from './dto/request-wallet-transaction.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CustomerAccountGuard } from '../../common/guards/customer-account.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import {
  Role,
  WalletTransactionStatus,
  WalletTransactionType,
} from '@prisma/client';

@Controller('wallet-transactions')
export class WalletTransactionsController {
  constructor(
    private readonly walletTransactionsService: WalletTransactionsService,
  ) {}

  @Post('request')
  @UseGuards(JwtAuthGuard, CustomerAccountGuard)
  customerRequest(
    @CurrentUser() user: { id: string },
    @Body() dto: RequestWalletTransactionDto,
  ) {
    return this.walletTransactionsService.createCustomerRequest(user.id, dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, CustomerAccountGuard)
  findMine(
    @CurrentUser() user: { id: string },
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('type') type?: WalletTransactionType,
    @Query('status') status?: WalletTransactionStatus,
  ) {
    return this.walletTransactionsService.findAll({
      page,
      limit,
      type,
      status,
      customerId: user.id,
    });
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SALES)
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('type') type?: WalletTransactionType,
    @Query('status') status?: WalletTransactionStatus,
    @Query('customerId') customerId?: string,
    @Query('orderId') orderId?: string,
    @Query('search') search?: string,
  ) {
    return this.walletTransactionsService.findAll({
      page,
      limit,
      type,
      status,
      customerId,
      orderId,
      search,
    });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SALES)
  findOne(@Param('id') id: string) {
    return this.walletTransactionsService.findOne(id);
  }

  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SALES)
  approve(
    @Param('id') id: string,
    @Body() dto: ApproveWalletTransactionDto,
    @Request() req: { user: { id: string } },
  ) {
    return this.walletTransactionsService.approve(id, req.user.id, dto.note);
  }

  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SALES)
  reject(
    @Param('id') id: string,
    @Body() dto: RejectWalletTransactionDto,
    @Request() req: { user: { id: string } },
  ) {
    return this.walletTransactionsService.reject(
      id,
      req.user.id,
      dto.rejectReason,
    );
  }
}
