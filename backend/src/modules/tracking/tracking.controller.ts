import { Controller, Get, Param } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { TrackingService } from './tracking.service';

/** Public: customers check a parcel without signing in. */
@Controller('tracking')
@Throttle({ short: { limit: 20, ttl: 60_000 } })
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  @Get(':code')
  findByCode(@Param('code') code: string) {
    return this.trackingService.findByCode(code);
  }
}
