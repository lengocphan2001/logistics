import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UpsertShippingRateDto } from './dto/upsert-shipping-rate.dto';

@Injectable()
export class ShippingRatesService {
  constructor(private prisma: PrismaService) {}

  /** Public list: only the lines a customer can actually pick. */
  findActive() {
    return this.prisma.shippingRate.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  }

  findAll() {
    return this.prisma.shippingRate.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  }

  create(dto: UpsertShippingRateDto) {
    return this.prisma.shippingRate.create({ data: dto });
  }

  async update(id: string, dto: Partial<UpsertShippingRateDto>) {
    const rate = await this.prisma.shippingRate.findUnique({ where: { id } });
    if (!rate) throw new NotFoundException('Không tìm thấy tuyến vận chuyển');
    return this.prisma.shippingRate.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    const rate = await this.prisma.shippingRate.findUnique({ where: { id } });
    if (!rate) throw new NotFoundException('Không tìm thấy tuyến vận chuyển');
    await this.prisma.shippingRate.delete({ where: { id } });
    return { message: 'Đã xoá tuyến vận chuyển' };
  }
}
