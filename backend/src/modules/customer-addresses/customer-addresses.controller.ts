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
import { CustomerAddressesService } from './customer-addresses.service';
import { UpsertAddressDto } from './dto/upsert-address.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CustomerAccountGuard } from '../../common/guards/customer-account.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('customer/addresses')
@UseGuards(JwtAuthGuard, CustomerAccountGuard)
export class CustomerAddressesController {
  constructor(private readonly service: CustomerAddressesService) {}

  @Get()
  findAll(@CurrentUser() user: { id: string }) {
    return this.service.findAll(user.id);
  }

  @Post()
  create(@CurrentUser() user: { id: string }, @Body() dto: UpsertAddressDto) {
    return this.service.create(user.id, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: UpsertAddressDto,
  ) {
    return this.service.update(user.id, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.service.remove(user.id, id);
  }
}
