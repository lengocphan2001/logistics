import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { UpsertCartItemDto } from './dto/upsert-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CustomerAccountGuard } from '../../common/guards/customer-account.guard';

@Controller('customer/cart')
@UseGuards(JwtAuthGuard, CustomerAccountGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(
    @Request() req: any,
    @Query('enrichProperties') enrichProperties?: string,
  ) {
    return this.cartService.getCart(req.user.id, enrichProperties === '1' || enrichProperties === 'true');
  }

  @Post('items')
  upsertItem(@Request() req: any, @Body() dto: UpsertCartItemDto) {
    return this.cartService.upsertItem(req.user.id, dto);
  }

  @Patch('items/:id')
  updateItem(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(req.user.id, id, dto);
  }

  @Delete('shops/:shopKey')
  removeShop(@Request() req: any, @Param('shopKey') shopKey: string) {
    return this.cartService.removeShopItems(req.user.id, decodeURIComponent(shopKey));
  }

  @Delete('items/:id')
  removeItem(@Request() req: any, @Param('id') id: string) {
    return this.cartService.removeItem(req.user.id, id);
  }

  @Delete()
  clearCart(@Request() req: any) {
    return this.cartService.clearCart(req.user.id);
  }
}
