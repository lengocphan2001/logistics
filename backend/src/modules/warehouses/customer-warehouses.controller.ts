import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { WarehouseCountry } from '@prisma/client';
import { WarehousesService } from './warehouses.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CustomerAccountGuard } from '../../common/guards/customer-account.guard';

@Controller('customer/warehouses')
@UseGuards(JwtAuthGuard, CustomerAccountGuard)
export class CustomerWarehousesController {
  constructor(private readonly warehousesService: WarehousesService) {}

  @Get()
  findAll(@Query('country') country?: WarehouseCountry) {
    return this.warehousesService.findForCustomer(country);
  }
}
