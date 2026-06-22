import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../database/prisma.service';
import { CustomersService } from '../customers/customers.service';
import { LoginDto } from './dto/login.dto';
import { RegisterCustomerDto } from '../customers/dto/register-customer.dto';
import { UpdateCustomerProfileDto } from '../customers/dto/update-customer-profile.dto';
import { sanitizeCustomer, type SafeCustomer } from '../../common/utils/sanitize-customer';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private customersService: CustomersService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        warehouse: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Tài khoản đã bị khóa');
    }

    const payload = { email: user.email, sub: user.id, role: user.role, accountType: 'user' as const };
    const token = this.jwtService.sign(payload);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        accountType: 'user',
        warehouseId: user.warehouseId,
        warehouse: user.warehouse,
      },
      token,
    };
  }

  async registerCustomer(dto: RegisterCustomerDto) {
    const customer = await this.customersService.register(dto);

    const payload = {
      email: customer.email!,
      sub: customer.id,
      role: 'CUSTOMER',
      accountType: 'customer' as const,
    };
    const token = this.jwtService.sign(payload);

    return {
      user: {
        id: customer.id,
        email: customer.email,
        name: customer.fullName,
        username: customer.username,
        role: 'CUSTOMER',
        accountType: 'customer',
      },
      token,
    };
  }

  async loginCustomer(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const customer = await this.prisma.customer.findUnique({
      where: { email },
    });

    if (!customer) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    const isPasswordValid = await bcrypt.compare(password, customer.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    if (customer.status !== 'ACTIVE') {
      throw new UnauthorizedException('Tài khoản đã bị khóa');
    }

    const payload = {
      email: customer.email!,
      sub: customer.id,
      role: 'CUSTOMER',
      accountType: 'customer' as const,
    };
    const token = this.jwtService.sign(payload);

    return {
      user: {
        id: customer.id,
        email: customer.email,
        name: customer.fullName,
        username: customer.username,
        role: 'CUSTOMER',
        accountType: 'customer',
      },
      token,
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        warehouse: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Tài khoản không tồn tại');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      accountType: 'user',
      warehouseId: user.warehouseId,
      warehouse: user.warehouse,
    };
  }

  private mapCustomerProfile(safe: SafeCustomer) {
    return {
      id: safe.id,
      email: safe.email,
      name: safe.fullName,
      username: safe.username,
      phone: safe.phone,
      address: safe.address,
      dateOfBirth: safe.dateOfBirth,
      gender: safe.gender,
      shippingAddress: safe.shippingAddress,
      bankInfo: safe.bankInfo,
      balance: safe.balance,
      role: 'CUSTOMER',
      accountType: 'customer' as const,
    };
  }

  async getCustomerProfile(customerId: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new UnauthorizedException('Tài khoản không tồn tại');
    }

    return this.mapCustomerProfile(sanitizeCustomer(customer));
  }

  async updateCustomerProfile(customerId: string, dto: UpdateCustomerProfileDto) {
    const customer = await this.customersService.updateProfile(customerId, dto);
    return this.mapCustomerProfile(customer);
  }
}
