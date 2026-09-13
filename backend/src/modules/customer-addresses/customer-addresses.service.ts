import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UpsertAddressDto } from './dto/upsert-address.dto';

@Injectable()
export class CustomerAddressesService {
  constructor(private prisma: PrismaService) {}

  findAll(customerId: string) {
    return this.prisma.customerAddress.findMany({
      where: { customerId },
      orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }],
    });
  }

  async create(customerId: string, dto: UpsertAddressDto) {
    const count = await this.prisma.customerAddress.count({
      where: { customerId },
    });
    // The first address a customer saves is their default, otherwise checkout
    // would start with nothing selected.
    const isDefault = dto.isDefault ?? count === 0;

    return this.prisma.$transaction(async (tx) => {
      if (isDefault) {
        await tx.customerAddress.updateMany({
          where: { customerId, isDefault: true },
          data: { isDefault: false },
        });
      }
      return tx.customerAddress.create({
        data: { ...dto, isDefault, customerId },
      });
    });
  }

  async update(customerId: string, id: string, dto: UpsertAddressDto) {
    await this.ensureOwned(customerId, id);

    return this.prisma.$transaction(async (tx) => {
      if (dto.isDefault) {
        await tx.customerAddress.updateMany({
          where: { customerId, isDefault: true },
          data: { isDefault: false },
        });
      }
      return tx.customerAddress.update({ where: { id }, data: dto });
    });
  }

  async remove(customerId: string, id: string) {
    const address = await this.ensureOwned(customerId, id);
    await this.prisma.customerAddress.delete({ where: { id } });

    // Never leave the book without a default while it still has entries.
    if (address.isDefault) {
      const next = await this.prisma.customerAddress.findFirst({
        where: { customerId },
        orderBy: { updatedAt: 'desc' },
      });
      if (next) {
        await this.prisma.customerAddress.update({
          where: { id: next.id },
          data: { isDefault: true },
        });
      }
    }

    return { message: 'Đã xoá địa chỉ' };
  }

  private async ensureOwned(customerId: string, id: string) {
    const address = await this.prisma.customerAddress.findUnique({
      where: { id },
    });
    if (!address) throw new NotFoundException('Không tìm thấy địa chỉ');
    if (address.customerId !== customerId) {
      throw new ForbiddenException('Không có quyền với địa chỉ này');
    }
    return address;
  }
}
