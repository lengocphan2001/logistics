import {
  Controller,
  Get,
  Query,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import type { Response } from 'express';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

const ALLOWED_DOMAINS = [
  'alicdn.com',
  'taobaocdn.com',
  'tmall.com',
  'otcommerce.com',
  'img.alicdn.com',
  'gw.alicdn.com',
];

/** Public image proxy — no JWT required (Taobao CDN images for browser <img> tags) */
@Controller('products/image-proxy')
@SkipThrottle()
export class ImageProxyController {
  constructor(private readonly http: HttpService) {}

  @Get()
  async proxy(@Query('url') url: string, @Res() res: Response) {
    if (!url) throw new BadRequestException('url is required');

    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      throw new BadRequestException('Invalid URL');
    }

    if (
      !ALLOWED_DOMAINS.some(
        (d) => parsed.hostname === d || parsed.hostname.endsWith(`.${d}`),
      )
    ) {
      throw new BadRequestException('Domain not allowed');
    }

    try {
      const resp = await firstValueFrom(
        this.http.get(url, { responseType: 'arraybuffer', timeout: 12_000 }),
      );
      const rawCt = resp.headers['content-type'];
      const ct = Array.isArray(rawCt)
        ? rawCt[0]
        : typeof rawCt === 'string'
          ? rawCt
          : 'image/jpeg';
      res.setHeader('Content-Type', ct);
      res.setHeader('Cache-Control', 'public, max-age=604800'); // 7 days
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.send(Buffer.from(resp.data));
    } catch {
      res.status(502).json({ message: 'Cannot fetch image' });
    }
  }
}
