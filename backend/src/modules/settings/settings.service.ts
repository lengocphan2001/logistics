import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UpdateExchangeRateDto } from './dto/update-exchange-rate.dto';

const SETTINGS_ID = 'default';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  private async getOrCreate() {
    const existing = await this.prisma.appSetting.findUnique({
      where: { id: SETTINGS_ID },
    });

    if (existing) {
      return existing;
    }

    return this.prisma.appSetting.create({
      data: { id: SETTINGS_ID },
    });
  }

  async getExchangeRate() {
    const settings = await this.getOrCreate();
    return {
      vndPerCny: Number(settings.vndPerCny),
      updatedAt: settings.updatedAt,
    };
  }

  async updateExchangeRate(dto: UpdateExchangeRateDto) {
    const settings = await this.prisma.appSetting.upsert({
      where: { id: SETTINGS_ID },
      create: {
        id: SETTINGS_ID,
        vndPerCny: dto.vndPerCny,
      },
      update: {
        vndPerCny: dto.vndPerCny,
      },
    });

    return {
      vndPerCny: Number(settings.vndPerCny),
      updatedAt: settings.updatedAt,
    };
  }
}
