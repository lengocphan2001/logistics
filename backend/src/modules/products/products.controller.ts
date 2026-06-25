import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

const HOT_ROOT_CATEGORY_LIMIT = 30;

@Controller('products')
@UseGuards(JwtAuthGuard)
@Throttle({ short: { limit: 20, ttl: 60_000 } })
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('categories/flyout')
  getCategoryFlyout(
    @Query('parentId') parentId: string,
    @Query('provider') provider?: string,
  ) {
    return this.productsService.getCategoryFlyout(parentId, provider);
  }

  @Get('categories')
  getCategories(
    @Query('parentId') parentId?: string,
    @Query('provider') provider?: string,
    @Query('limit') limitStr?: string,
  ) {
    const id = parentId || '0';
    const parsed = limitStr ? parseInt(limitStr, 10) : HOT_ROOT_CATEGORY_LIMIT;
    const limit =
      id === '0'
        ? Math.min(
            Math.max(
              Number.isNaN(parsed) ? HOT_ROOT_CATEGORY_LIMIT : parsed,
              1,
            ),
            30,
          )
        : undefined;
    return this.productsService.getCategories(parentId, provider, limit);
  }

  @Get('search')
  search(
    @Query('keyword') keyword?: string,
    @Query('categoryId') categoryId?: string,
    @Query('provider') provider?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('pageSize', new DefaultValuePipe(20), ParseIntPipe) pageSize = 20,
    @Query('sortField') sortField?: string,
    @Query('sortOrder') sortOrder?: string,
    @Query('priceMin') priceMinStr?: string,
    @Query('priceMax') priceMaxStr?: string,
  ) {
    const priceMin = priceMinStr ? parseFloat(priceMinStr) : undefined;
    const priceMax = priceMaxStr ? parseFloat(priceMaxStr) : undefined;
    const size = Math.min(pageSize, 100); // cap at 100
    return this.productsService.search({
      keyword,
      categoryId,
      providerAlias: provider,
      page,
      pageSize: size,
      sortField,
      sortOrder,
      priceMin,
      priceMax,
    });
  }

  @Get(':providerAlias/:itemId')
  getItemDetail(
    @Param('providerAlias') providerAlias: string,
    @Param('itemId') itemId: string,
  ) {
    return this.productsService.getItemDetail(providerAlias, itemId);
  }
}
