import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

/**
 * Public lookup by bill of lading code.
 *
 * Anyone holding the code can read this, so it returns the journey and
 * nothing else: no phone numbers, no addresses, no fees, no internal notes.
 */
@Injectable()
export class TrackingService {
  constructor(private prisma: PrismaService) {}

  async findByCode(code: string) {
    const order = await this.prisma.order.findUnique({
      where: { billOfLadingCode: code.trim() },
      select: {
        billOfLadingCode: true,
        type: true,
        status: true,
        createdAt: true,
        estimatedDelivery: true,
        deliveredAt: true,
        receiverProvince: true,
        warehouse: { select: { name: true, country: true } },
        events: {
          orderBy: { createdAt: 'asc' },
          select: { status: true, location: true, createdAt: true },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Không tìm thấy vận đơn với mã này');
    }

    return order;
  }
}
