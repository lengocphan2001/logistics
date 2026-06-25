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
} from '@nestjs/common';
import { CartService } from './cart.service';
import { UpsertCartItemDto } from './dto/upsert-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CustomerAccountGuard } from '../../common/guards/customer-account.guard';
import {
  CurrentUser,
  type AuthUser,
} from '../../common/decorators/current-user.decorator';

@Controller('customer/cart')
@UseGuards(JwtAuthGuard, CustomerAccountGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(
    @CurrentUser() user: AuthUser,
    @Query('enrichProperties') enrichProperties?: string,
  ) {
    return this.cartService.getCart(
      user.id,
      enrichProperties === '1' || enrichProperties === 'true',
    );
  }

  @Post('items')
  upsertItem(@CurrentUser() user: AuthUser, @Body() dto: UpsertCartItemDto) {
    return this.cartService.upsertItem(user.id, dto);
  }

  @Patch('items/:id')
  updateItem(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(user.id, id, dto);
  }

  @Delete('shops/:shopKey')
  removeShop(@CurrentUser() user: AuthUser, @Param('shopKey') shopKey: string) {
    return this.cartService.removeShopItems(
      user.id,
      decodeURIComponent(shopKey),
    );
  }

  @Delete('items/:id')
  removeItem(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.cartService.removeItem(user.id, id);
  }

  @Delete()
  clearCart(@CurrentUser() user: AuthUser) {
    return this.cartService.clearCart(user.id);
  }
}
