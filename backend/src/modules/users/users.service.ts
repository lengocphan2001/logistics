import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const { email, password, name, role, warehouseId } = createUserDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('Email đã được sử dụng bởi một tài khoản khác');
    }

    if (role === Role.WAREHOUSE_MANAGER && warehouseId) {
      const warehouse = await this.prisma.warehouse.findUnique({
        where: { id: warehouseId },
      });
      if (!warehouse) {
        throw new NotFoundException('Kho không tồn tại');
      }
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await this.prisma.user.create({
      data: {
        email,
        password: passwordHash,
        name,
        role,
        warehouseId: role === Role.WAREHOUSE_MANAGER ? warehouseId : null,
      },
      include: {
        warehouse: true,
      },
    });

    return this.sanitizeUser(user);
  }

  async findAll(role?: Role) {
    const where = role ? { role } : {};
    const users = await this.prisma.user.findMany({
      where,
      include: {
        warehouse: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return users.map((user) => this.sanitizeUser(user));
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        warehouse: true,
      },
    });
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }
    return this.sanitizeUser(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    const data: any = { ...updateUserDto };

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });
      if (existingUser) {
        throw new ConflictException('Email đã được sử dụng bởi một tài khoản khác');
      }
    }

    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt(10);
      data.password = await bcrypt.hash(updateUserDto.password, salt);
    }

    const targetRole = updateUserDto.role || user.role;
    if (targetRole !== Role.WAREHOUSE_MANAGER) {
      data.warehouseId = null;
    } else if (updateUserDto.warehouseId) {
      const warehouse = await this.prisma.warehouse.findUnique({
        where: { id: updateUserDto.warehouseId },
      });
      if (!warehouse) {
        throw new NotFoundException('Kho không tồn tại');
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data,
      include: {
        warehouse: true,
      },
    });

    return this.sanitizeUser(updatedUser);
  }

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    await this.prisma.user.delete({
      where: { id },
    });

    return { message: 'Xóa người dùng thành công' };
  }

  private sanitizeUser(user: any) {
    const sanitized = { ...user };
    delete sanitized.password;
    return sanitized;
  }
}
