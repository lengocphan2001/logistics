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
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { csvFilename, toCsv } from '../../common/utils/csv';
import {
  walletTransactionStatusLabels,
  walletTransactionTypeLabels,
} from '../../common/enums/wallet-transaction-label';
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

  /** CSV for accounting. Declared before ':id' so Nest does not treat it as one. */
  @Get('export')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SALES)
  async exportCsv(
    @Res() res: Response,
    @Query('type') type?: WalletTransactionType,
    @Query('status') status?: WalletTransactionStatus,
    @Query('search') search?: string,
  ) {
    const { data } = await this.walletTransactionsService.findAll({
      page: 1,
      limit: 10_000,
      type,
      status,
      search,
    });

    const csv = toCsv(data, [
      { header: 'Mã giao dịch', value: (t) => t.code },
      { header: 'Loại', value: (t) => walletTransactionTypeLabels[t.type] },
      {
        header: 'Trạng thái',
        value: (t) => walletTransactionStatusLabels[t.status],
      },
      { header: 'Khách hàng', value: (t) => t.customer?.fullName ?? '' },
      { header: 'Điện thoại', value: (t) => t.customer?.phone ?? '' },
      { header: 'Số tiền (CNY)', value: (t) => Number(t.amount) },
      {
        header: 'Số tiền (VND)',
        value: (t) => (t.vndAmount ? Number(t.vndAmount) : ''),
      },
      {
        header: 'Số dư sau (CNY)',
        value: (t) => (t.balanceAfter != null ? Number(t.balanceAfter) : ''),
      },
      { header: 'Mã vận đơn', value: (t) => t.order?.billOfLadingCode ?? '' },
      { header: 'Mã chuyển khoản', value: (t) => t.referenceCode ?? '' },
      { header: 'Lý do từ chối', value: (t) => t.rejectReason ?? '' },
      { header: 'Ngày tạo', value: (t) => t.createdAt.toISOString() },
    ]);

    res
      .status(200)
      .setHeader('Content-Type', 'text/csv; charset=utf-8')
      .setHeader(
        'Content-Disposition',
        `attachment; filename="${csvFilename('giao-dich-vi')}"`,
      )
      .send(csv);
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
