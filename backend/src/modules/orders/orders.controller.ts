import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  Request,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import {
  ChargeOrderWalletDto,
  RefundOrderWalletDto,
} from './dto/charge-order-wallet.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { OrderStatus, OrderType, Role } from '@prisma/client';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Roles(Role.ADMIN, Role.SALES)
  create(@Body() dto: CreateOrderDto, @Request() req: { user: { id: string } }) {
    return this.ordersService.create(dto, req.user.id);
  }

  @Get()
  @Roles(Role.ADMIN, Role.SALES, Role.WAREHOUSE_MANAGER)
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('status') status?: OrderStatus,
    @Query('type') type?: OrderType,
    @Query('search') search?: string,
    @Query('driverId') driverId?: string,
    @Query('warehouseId') warehouseId?: string,
    @Query('customerId') customerId?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    return this.ordersService.findAll({
      page,
      limit,
      status,
      type,
      search,
      driverId,
      warehouseId,
      customerId,
      fromDate,
      toDate,
    });
  }

  @Get('stats')
  @Roles(Role.ADMIN, Role.SALES)
  getStats() {
    return this.ordersService.getStats();
  }

  @Post(':id/wallet/charge')
  @Roles(Role.ADMIN, Role.SALES)
  chargeWallet(
    @Param('id') id: string,
    @Body() dto: ChargeOrderWalletDto,
    @Request() req: { user: { id: string } },
  ) {
    return this.ordersService.chargeWallet(id, dto, req.user.id);
  }

  @Post(':id/wallet/refund')
  @Roles(Role.ADMIN, Role.SALES)
  refundWallet(
    @Param('id') id: string,
    @Body() dto: RefundOrderWalletDto,
    @Request() req: { user: { id: string } },
  ) {
    return this.ordersService.refundWallet(id, dto, req.user.id);
  }

  @Get('bill/:code')
  @Roles(Role.ADMIN, Role.SALES, Role.WAREHOUSE_MANAGER, Role.DRIVER)
  findByBillCode(@Param('code') code: string) {
    return this.ordersService.findByBillCode(code);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.SALES, Role.WAREHOUSE_MANAGER)
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.SALES)
  update(@Param('id') id: string, @Body() dto: UpdateOrderDto) {
    return this.ordersService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.ordersService.remove(id);
  }
}
