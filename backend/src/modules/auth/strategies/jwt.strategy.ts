import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../database/prisma.service';

type JwtPayload = {
  sub: string;
  email: string;
  role?: string;
  accountType?: 'user' | 'customer';
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_SECRET') || 'change-me-in-production',
    });
  }

  async validate(payload: JwtPayload) {
    if (payload.accountType === 'customer') {
      const customer = await this.prisma.customer.findUnique({
        where: { id: payload.sub },
      });

      if (!customer || customer.status !== 'ACTIVE') {
        throw new UnauthorizedException(
          'Tài khoản không tồn tại hoặc đã bị khóa',
        );
      }

      return {
        id: customer.id,
        email: customer.email,
        name: customer.fullName,
        username: customer.username,
        role: 'CUSTOMER',
        accountType: 'customer' as const,
      };
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        warehouse: true,
      },
    });

    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException(
        'Tài khoản không tồn tại hoặc đã bị khóa',
      );
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      accountType: 'user' as const,
      warehouseId: user.warehouseId,
      warehouse: user.warehouse,
    };
  }
}
