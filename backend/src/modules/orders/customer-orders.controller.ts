import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { OrderStatus, OrderType } from '@prisma/client';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CustomerAccountGuard } from '../../common/guards/customer-account.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CheckoutDto } from './dto/checkout.dto';
import { CreateCustomerOrderDto } from './dto/create-customer-order.dto';
import { OrderWorkflowService } from './order-workflow.service';
import { CancelRequestDto, RejectQuoteDto } from './dto/order-actions.dto';

@Controller('customer/orders')
@UseGuards(JwtAuthGuard, CustomerAccountGuard)
export class CustomerOrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly workflow: OrderWorkflowService,
  ) {}

  @Get('stats')
  getStats(@CurrentUser() user: { id: string }) {
    return this.ordersService.getStatsForCustomer(user.id);
  }

  @Get()
  findAll(
    @CurrentUser() user: { id: string },
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('status') status?: OrderStatus,
    @Query('type') type?: OrderType,
    @Query('search') search?: string,
  ) {
    return this.ordersService.findAllForCustomer(user.id, {
      page,
      limit,
      status,
      type,
      search,
    });
  }

  @Post('checkout')
  checkout(@CurrentUser() user: { id: string }, @Body() dto: CheckoutDto) {
    return this.ordersService.checkoutCart(user.id, dto);
  }

  /** Yêu cầu đặt hàng hộ, thanh toán hộ hoặc ký gửi. */
  @Post('request')
  createRequest(
    @CurrentUser() user: { id: string },
    @Body() dto: CreateCustomerOrderDto,
  ) {
    return this.ordersService.createCustomerRequest(user.id, dto);
  }

  /** Duyệt báo giá: tiền hàng được trừ khỏi ví ngay tại đây. */
  @Post(':id/approve-quote')
  approveQuote(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.workflow.approveQuote(user.id, id);
  }

  @Post(':id/reject-quote')
  rejectQuote(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: RejectQuoteDto,
  ) {
    return this.workflow.rejectQuote(user.id, id, dto);
  }

  /** Khách tự huỷ khi đơn chưa được xử lý. */
  @Post(':id/cancel')
  cancel(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: CancelRequestDto,
  ) {
    return this.workflow.cancelByCustomer(user.id, id, dto);
  }

  /** Số tiền đã trả và còn phải trả của đơn. */
  @Get(':id/summary')
  summary(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.workflow.summaryForCustomer(user.id, id);
  }

  @Get(':id')
  findOne(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.ordersService.findOneForCustomer(user.id, id);
  }
}
