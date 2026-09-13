import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { ShippingRatesService } from './shipping-rates.service';
import { UpsertShippingRateDto } from './dto/upsert-shipping-rate.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

/** Public read so the storefront can quote a line before sign-in. */
@Controller('shipping-rates')
export class ShippingRatesController {
  constructor(private readonly shippingRatesService: ShippingRatesService) {}

  @Get()
  findActive() {
    return this.shippingRatesService.findActive();
  }

  @Get('all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SALES)
  findAll() {
    return this.shippingRatesService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  create(@Body() dto: UpsertShippingRateDto) {
    return this.shippingRatesService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpsertShippingRateDto) {
    return this.shippingRatesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.shippingRatesService.remove(id);
  }
}
