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

@Controller('customer/orders')
@UseGuards(JwtAuthGuard, CustomerAccountGuard)
export class CustomerOrdersController {
  constructor(private readonly ordersService: OrdersService) {}

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

  @Get(':id')
  findOne(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.ordersService.findOneForCustomer(user.id, id);
  }
}
