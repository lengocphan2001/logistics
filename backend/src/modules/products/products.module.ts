import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ProductsController } from './products.controller';
import { ImageProxyController } from './image-proxy.controller';
import { ProductsService } from './products.service';
import { OtapiProvider } from './providers/otapi.provider';

@Module({
  imports: [HttpModule],
  controllers: [ProductsController, ImageProxyController],
  providers: [ProductsService, OtapiProvider],
  exports: [ProductsService],
})
export class ProductsModule {}
