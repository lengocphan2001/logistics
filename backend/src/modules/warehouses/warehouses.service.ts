import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';

@Injectable()
export class WarehousesService {
  constructor(private prisma: PrismaService) {}

  async create(createWarehouseDto: CreateWarehouseDto) {
    const { name, code, address } = createWarehouseDto;

    const existing = await this.prisma.warehouse.findUnique({
      where: { code },
    });
    if (existing) {
      throw new ConflictException('Mã kho đã tồn tại trong hệ thống');
    }

    return this.prisma.warehouse.create({
      data: {
        name,
        code,
        address,
        country: createWarehouseDto.country ?? 'VN',
      },
    });
  }

  async findAll() {
    return this.prisma.warehouse.findMany({
      include: {
        _count: {
          select: { users: true },
        },
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /** Danh sách kho công khai cho khách hàng (checkout) */
  async findForCustomer(country?: 'CN' | 'VN') {
    return this.prisma.warehouse.findMany({
      where: country ? { country } : undefined,
      select: {
        id: true,
        name: true,
        code: true,
        address: true,
        country: true,
      },
      orderBy: [{ country: 'asc' }, { name: 'asc' }],
    });
  }

  async findOne(id: string) {
    const warehouse = await this.prisma.warehouse.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });
    if (!warehouse) {
      throw new NotFoundException('Không tìm thấy thông tin kho');
    }
    return warehouse;
  }

  async update(id: string, updateWarehouseDto: UpdateWarehouseDto) {
    const warehouse = await this.prisma.warehouse.findUnique({
      where: { id },
    });
    if (!warehouse) {
      throw new NotFoundException('Không tìm thấy thông tin kho');
    }

    if (updateWarehouseDto.code && updateWarehouseDto.code !== warehouse.code) {
      const existing = await this.prisma.warehouse.findUnique({
        where: { code: updateWarehouseDto.code },
      });
      if (existing) {
        throw new ConflictException('Mã kho đã tồn tại trong hệ thống');
      }
    }

    return this.prisma.warehouse.update({
      where: { id },
      data: updateWarehouseDto,
    });
  }

  async remove(id: string) {
    const warehouse = await this.prisma.warehouse.findUnique({
      where: { id },
    });
    if (!warehouse) {
      throw new NotFoundException('Không tìm thấy thông tin kho');
    }

    await this.prisma.user.updateMany({
      where: { warehouseId: id },
      data: { warehouseId: null },
    });

    await this.prisma.warehouse.delete({
      where: { id },
    });

    return { message: 'Xóa kho thành công' };
  }
}
