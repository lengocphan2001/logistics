import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../database/prisma.service';

import { UpdateCustomerDto } from './dto/update-customer.dto';
import { UpdateCustomerProfileDto } from './dto/update-customer-profile.dto';

import { RegisterCustomerDto } from './dto/register-customer.dto';

import { sanitizeCustomer } from '../../common/utils/sanitize-customer';

import * as bcrypt from 'bcrypt';



const CUSTOMER_INCLUDE = {

  _count: { select: { orders: true } },

};



@Injectable()

export class CustomersService {

  constructor(private prisma: PrismaService) {}



  async register(dto: RegisterCustomerDto) {

    const { username, phone, email } = dto;



    const existingUsername = await this.prisma.customer.findUnique({

      where: { username },

    });

    if (existingUsername) {

      throw new ConflictException('Tên đăng nhập đã tồn tại trong hệ thống');

    }



    const existingPhone = await this.prisma.customer.findUnique({

      where: { phone },

    });

    if (existingPhone) {

      throw new ConflictException('Số điện thoại đã được sử dụng');

    }



    const existingEmail = await this.prisma.customer.findUnique({

      where: { email },

    });

    if (existingEmail) {

      throw new ConflictException('Email đã được sử dụng');

    }



    const hashedPassword = await bcrypt.hash(dto.password, 10);



    const customer = await this.prisma.customer.create({

      data: {

        username: dto.username,

        password: hashedPassword,

        fullName: dto.fullName,

        phone: dto.phone,

        email: dto.email,

      },

      include: CUSTOMER_INCLUDE,

    });



    return sanitizeCustomer(customer);

  }



  async findAll(params: { page?: number; limit?: number; search?: string; status?: string }) {

    const page = params.page ?? 1;

    const limit = params.limit ?? 20;

    const skip = (page - 1) * limit;



    const where: Record<string, unknown> = {};

    if (params.status) {

      where.status = params.status;

    }

    if (params.search) {

      where.OR = [

        { username: { contains: params.search, mode: 'insensitive' } },

        { fullName: { contains: params.search, mode: 'insensitive' } },

        { phone: { contains: params.search, mode: 'insensitive' } },

        { email: { contains: params.search, mode: 'insensitive' } },

      ];

    }



    const [data, total] = await Promise.all([

      this.prisma.customer.findMany({

        where,

        include: CUSTOMER_INCLUDE,

        orderBy: { createdAt: 'desc' },

        skip,

        take: limit,

      }),

      this.prisma.customer.count({ where }),

    ]);



    return {

      data: data.map(sanitizeCustomer),

      total,

      page,

      limit,

      totalPages: Math.ceil(total / limit),

    };

  }



  async findOne(id: string) {

    const customer = await this.prisma.customer.findUnique({

      where: { id },

      include: {

        ...CUSTOMER_INCLUDE,

        orders: {

          select: {

            id: true,

            billOfLadingCode: true,

            status: true,

            totalFee: true,

            createdAt: true,

          },

          orderBy: { createdAt: 'desc' },

          take: 10,

        },

      },

    });

    if (!customer) {

      throw new NotFoundException('Không tìm thấy khách hàng');

    }

    return sanitizeCustomer(customer);

  }



  private async assertUniqueContact(
    id: string,
    fields: { phone?: string; email?: string },
  ) {
    if (fields.phone) {
      const existing = await this.prisma.customer.findUnique({
        where: { phone: fields.phone },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException('Số điện thoại đã được sử dụng');
      }
    }

    if (fields.email) {
      const existing = await this.prisma.customer.findUnique({
        where: { email: fields.email },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException('Email đã được sử dụng');
      }
    }
  }

  private buildCustomerUpdateData(
    dto: UpdateCustomerDto | UpdateCustomerProfileDto,
  ): Prisma.CustomerUpdateInput {
    const { dateOfBirth, bankInfo, ...rest } = dto;
    const data: Prisma.CustomerUpdateInput = { ...rest };

    if (dateOfBirth !== undefined) {
      data.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;
    }

    if (bankInfo !== undefined) {
      data.bankInfo = {
        bankName: bankInfo.bankName,
        accountNumber: bankInfo.accountNumber,
        accountHolder: bankInfo.accountHolder,
      };
    }

    return data;
  }

  async updateProfile(id: string, dto: UpdateCustomerProfileDto) {
    const customer = await this.prisma.customer.findUnique({ where: { id } });
    if (!customer) {
      throw new NotFoundException('Không tìm thấy khách hàng');
    }

    await this.assertUniqueContact(id, {
      phone: dto.phone,
      email: dto.email,
    });

    const updated = await this.prisma.customer.update({
      where: { id },
      data: this.buildCustomerUpdateData(dto),
      include: CUSTOMER_INCLUDE,
    });

    return sanitizeCustomer(updated);
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto) {
    const customer = await this.prisma.customer.findUnique({ where: { id } });
    if (!customer) {
      throw new NotFoundException('Không tìm thấy khách hàng');
    }

    await this.assertUniqueContact(id, {
      phone: updateCustomerDto.phone,
      email: updateCustomerDto.email,
    });

    const updated = await this.prisma.customer.update({
      where: { id },
      data: this.buildCustomerUpdateData(updateCustomerDto),
      include: CUSTOMER_INCLUDE,
    });

    return sanitizeCustomer(updated);
  }



  async remove(id: string) {

    const customer = await this.prisma.customer.findUnique({ where: { id } });

    if (!customer) {

      throw new NotFoundException('Không tìm thấy khách hàng');

    }



    await this.prisma.customer.delete({ where: { id } });

    return { message: 'Xóa khách hàng thành công' };

  }

}


