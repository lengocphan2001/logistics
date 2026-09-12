import {
  Injectable,
  Logger,
  InternalServerErrorException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { createHash } from 'crypto';
import { firstValueFrom } from 'rxjs';
import type {
  IProductProvider,
  CategoryFlyoutSection,
  CategoryInfo,
  ProductItem,
  ProductSku,
  SearchResult,
  SkuAttribute,
} from '../interfaces/product-provider.interface';

type OtapiCategoryResponse = {
  CategoryInfoList?: { Content?: unknown[] };
};

@Injectable()
export class OtapiProvider implements IProductProvider {
  private readonly logger = new Logger(OtapiProvider.name);
  private readonly baseUrl: string;
  private readonly instanceKey: string;
  private readonly secret: string;
  private readonly language: string;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    this.baseUrl =
      config.get('OTAPI_BASE_URL') || 'https://otapi.net/service-json';
    this.instanceKey = config.get('OTAPI_INSTANCE_KEY') || '';
    this.secret = config.get('OTAPI_SECRET') || '';
    this.language = config.get('OTAPI_LANGUAGE') || 'vi';
  }

  // ─── Signature ────────────────────────────────────────────────────────────
  private buildSignature(methodName: string, params: Record<string, string>) {
    if (!this.secret) return { signature: '', timestamp: '' };
    const d = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const timestamp =
      `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}` +
      `${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
    const allParams = { ...params, timestamp };
    const sorted = Object.keys(allParams).sort();
    const values = sorted.map((k) => allParams[k]).join('');
    const plaintext = `${methodName}${values}${this.secret}`;
    const signature = createHash('sha256').update(plaintext).digest('hex');
    return { signature, timestamp };
  }

  private isTransientOtapiError(code: string, description?: string): boolean {
    if (code === 'NotAvailable') return true;
    const msg = (description ?? '').toLowerCase();
    if (
      code === 'AccessDenied' &&
      /temporarily|technical|try again|unavailable/.test(msg)
    ) {
      return true;
    }
    return false;
  }

  private mapOtapiError(
    methodName: string,
    code: string,
    description?: string,
  ): never {
    this.logger.warn(
      `OTAPI ${methodName} error: ${code} — ${description ?? ''}`,
    );
    switch (code) {
      case 'NotFound':
        throw new NotFoundException(description ?? 'Sản phẩm không tồn tại');
      case 'NotAvailable':
        throw new ServiceUnavailableException(
          'Thông tin sản phẩm chưa sẵn sàng, vui lòng thử lại sau',
        );
      case 'ContractViolation':
        throw new InternalServerErrorException(
          `Tham số không hợp lệ: ${description ?? ''}`,
        );
      case 'AccessDenied':
        if (this.isTransientOtapiError(code, description)) {
          throw new ServiceUnavailableException(
            'Nguồn danh mục OTAPI đang bảo trì, vui lòng thử lại sau',
          );
        }
        throw new InternalServerErrorException(description ?? `OTAPI: ${code}`);
      default:
        throw new InternalServerErrorException(`OTAPI: ${code}`);
    }
  }

  private async delay(ms: number) {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async callRawWithRetry<T>(
    methodName: string,
    params: Record<string, string>,
    maxAttempts = 3,
  ): Promise<T> {
    let lastErr: unknown;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await this.callRaw<T>(methodName, params);
      } catch (err) {
        lastErr = err;
        const retryable =
          err instanceof ServiceUnavailableException && attempt < maxAttempts;
        if (retryable) {
          this.logger.debug(
            `OTAPI ${methodName} retry ${attempt}/${maxAttempts - 1} after transient error`,
          );
          await this.delay(1000 * attempt);
          continue;
        }
        throw err;
      }
    }
    throw lastErr;
  }

  /**
   * Low-level HTTP call — returns the entire response body.
   * Callers are responsible for extracting the right field (Result, CategoryInfoList, etc.)
   */
  private async callRaw<T = any>(
    methodName: string,
    params: Record<string, string>,
  ): Promise<T> {
    const baseParams: Record<string, string> = {
      instanceKey: this.instanceKey,
      language: this.language,
      ...params,
    };
    const { signature, timestamp } = this.buildSignature(
      methodName,
      baseParams,
    );
    if (signature) {
      baseParams.signature = signature;
      baseParams.timestamp = timestamp;
    }

    const url = `${this.baseUrl}/${methodName}`;
    try {
      const response = await firstValueFrom(
        this.http.get<any>(url, { params: baseParams, timeout: 20_000 }),
      );
      const data = response.data;
      if (data?.ErrorCode && data.ErrorCode !== 'Ok') {
        this.mapOtapiError(methodName, data.ErrorCode, data.ErrorDescription);
      }
      return data as T;
    } catch (err: any) {
      if (
        err instanceof InternalServerErrorException ||
        err instanceof ServiceUnavailableException ||
        err instanceof NotFoundException
      ) {
        throw err;
      }
      this.logger.error(`OTAPI ${methodName} network error: ${err?.message}`);
      throw new InternalServerErrorException(
        'Không thể kết nối đến nguồn sản phẩm',
      );
    }
  }

  // ─── Categories ───────────────────────────────────────────────────────────
  private mapCategoryList(list: any[]): CategoryInfo[] {
    return list
      .filter((c: any) => !c.IsHidden && !c.IsVirtual)
      .map((c: any) => ({
        id: String(c.Id ?? ''),
        name: String(c.Name ?? ''),
        parentId: c.ParentId ? String(c.ParentId) : undefined,
        image: c.PictureUrl ?? undefined,
        hasChildren: c.IsParent ?? false,
      }));
  }

  async getCategories(
    parentId = '0',
    providerAlias = 'p1',
    limit?: number,
  ): Promise<CategoryInfo[]> {
    const data = await this.callRawWithRetry<OtapiCategoryResponse>(
      'GetProviderCategorySubcategories',
      {
        providerAlias,
        categoryId: parentId,
      },
    );

    const list: any[] = data?.CategoryInfoList?.Content ?? [];
    let mapped = this.mapCategoryList(list);

    if (parentId === '0' && limit && limit > 0) {
      mapped = mapped
        .sort((a, b) => Number(!!b.image) - Number(!!a.image))
        .slice(0, limit);
    }

    this.logger.debug(
      `getCategories(${parentId}, ${providerAlias}) → ${mapped.length} items`,
    );
    return mapped;
  }

  async getCategoryFlyout(
    parentId: string,
    providerAlias = 'p1',
  ): Promise<CategoryFlyoutSection[]> {
    const level2 = await this.getCategories(parentId, providerAlias);
    const sections = await Promise.all(
      level2.map(async (cat) => {
        if (cat.hasChildren) {
          const items = await this.getCategories(cat.id, providerAlias);
          return { id: cat.id, name: cat.name, items };
        }
        return { id: cat.id, name: cat.name, items: [] };
      }),
    );
    return sections;
  }

  // ─── Search ───────────────────────────────────────────────────────────────
  async search(params: {
    keyword?: string;
    categoryId?: string;
    providerAlias?: string;
    page: number;
    pageSize: number;
    sortField?: string;
    sortOrder?: string;
    priceMin?: number;
    priceMax?: number;
  }): Promise<SearchResult> {
    if (!params.keyword && !params.categoryId) {
      return {
        items: [],
        total: 0,
        page: params.page,
        pageSize: params.pageSize,
      };
    }

    const alias = params.providerAlias || 'p1';
    const framePos = ((params.page - 1) * params.pageSize).toString();
    const frameSize = params.pageSize.toString();

    // Build XML parameters — OTAPI SearchItemsFrame requires xmlParameters
    const xmlParts: string[] = [];
    if (params.keyword)
      xmlParts.push(`<ItemTitle>${this.escapeXml(params.keyword)}</ItemTitle>`);
    if (params.categoryId)
      xmlParts.push(`<CategoryId>${params.categoryId}</CategoryId>`);
    if (params.sortField)
      xmlParts.push(`<SortField>${params.sortField}</SortField>`);
    if (params.sortOrder)
      xmlParts.push(`<SortOrder>${params.sortOrder}</SortOrder>`);
    if (params.priceMin != null)
      xmlParts.push(`<PriceFrom>${params.priceMin}</PriceFrom>`);
    if (params.priceMax != null)
      xmlParts.push(`<PriceTo>${params.priceMax}</PriceTo>`);
    const xmlParameters = `<SearchItemsParameters>${xmlParts.join('')}</SearchItemsParameters>`;

    const data = await this.callRaw('SearchItemsFrame', {
      providerAlias: alias,
      framePosition: framePos,
      frameSize,
      xmlParameters,
    });

    // Response: { Result: { Items: { Content: [...], TotalCount: N } } }
    const result = data?.Result;
    const items: any[] = result?.Items?.Content ?? [];
    const total: number = result?.Items?.TotalCount ?? items.length;

    this.logger.debug(
      `search "${params.keyword ?? params.categoryId}" → ${items.length}/${total} items`,
    );

    return {
      items: items.map((item) => this.mapItem(item, alias)),
      total,
      page: params.page,
      pageSize: params.pageSize,
    };
  }

  // ─── Item detail ──────────────────────────────────────────────────────────
  async getItemDetail(
    providerAlias: string,
    itemId: string,
    language?: string,
  ): Promise<ProductItem> {
    const data = await this.callRaw('GetItemFullInfo', {
      providerAlias,
      itemId,
      ...(language ? { language } : {}),
    });
    // Response field: OtapiItemFullInfo (not Result)
    const item = data?.OtapiItemFullInfo ?? data?.Result ?? data;
    this.logger.debug(
      `getItemDetail ${itemId} → title="${item?.Title?.slice(0, 40)}"`,
    );
    return this.mapItemFull(item, providerAlias);
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────
  private escapeXml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  private platformFromAlias(alias: string): string {
    const map: Record<string, string> = {
      p1: 'taobao',
      p6: '1688',
      p7: 'jd',
      p10: 'alibaba',
      p11: 'aliexpress',
    };
    return map[alias] || alias;
  }

  private mapItem(raw: any, alias: string): ProductItem {
    // Price: OTAPI nests price as Price.OriginalPrice (CNY)
    const originalRaw = raw.Price?.OriginalPrice ?? raw.OriginalPrice ?? null;
    const marginRaw = raw.Price?.MarginPrice ?? null;
    const priceCny = Number(marginRaw ?? originalRaw ?? 0);
    const originalPriceCny =
      originalRaw != null && Number(originalRaw) > priceCny
        ? Number(originalRaw)
        : undefined;

    // Image: prefer medium thumbnail for list view
    const mainPic =
      raw.Pictures?.find((p: any) => p.IsMain) ?? raw.Pictures?.[0];
    const image =
      mainPic?.Medium?.Url ??
      mainPic?.Url ??
      raw.MainPictureUrl ??
      raw.PictureUrl ??
      '';

    // Sold count from FeaturedValues array
    const featuredValues: { Name: string; Value: string }[] =
      raw.FeaturedValues ?? [];
    const soldStr =
      featuredValues.find((f) => f.Name === 'SalesInLast30Days')?.Value ??
      featuredValues.find((f) => f.Name === 'TotalSales')?.Value ??
      raw.SalesCount ??
      raw.SoldCount;

    return {
      itemId: String(raw.Id ?? raw.ItemId ?? ''),
      platform: this.platformFromAlias(alias),
      providerAlias: alias,
      title: raw.Title ?? raw.RussianTitle ?? raw.Name ?? '',
      image,
      images: (raw.Pictures ?? [])
        .map((p: any) => p.Large?.Url ?? p.Url ?? '')
        .filter(Boolean),
      priceCny,
      originalPriceCny,
      shopId: String(raw.VendorId ?? raw.ShopId ?? ''),
      shopName: raw.VendorDisplayName ?? raw.VendorName ?? raw.ShopName ?? '',
      rating: raw.VendorScore ? Number(raw.VendorScore) / 5 : undefined,
      reviewCount: raw.TradeCount ? Number(raw.TradeCount) : undefined,
      soldCount: soldStr ? Number(soldStr) : undefined,
      url: raw.TaobaoItemUrl ?? raw.ExternalItemUrl ?? raw.Url ?? undefined,
      skus: [],
    };
  }

  private mapItemFull(raw: any, alias: string): ProductItem {
    const base = this.mapItem(raw, alias);

    // ── Build attribute lookup: {Pid+Vid → {PropertyName, Value}} ────────────
    const attrMap = new Map<string, { name: string; value: string }>();
    const confAttrs: any[] = (raw.Attributes ?? []).filter(
      (a: any) => a.IsConfigurator,
    );
    for (const a of confAttrs) {
      attrMap.set(`${a.Pid}:${a.Vid}`, {
        name: a.PropertyName ?? '',
        value: a.Value ?? '',
      });
    }

    // ── Group configurator attributes by PropertyName → variant groups ────────
    const propGroups = new Map<string, Map<string, string>>(); // PropertyName → Map<Vid, Value>
    for (const a of confAttrs) {
      if (!propGroups.has(a.PropertyName))
        propGroups.set(a.PropertyName, new Map());
      propGroups.get(a.PropertyName)!.set(a.Vid, a.Value ?? '');
    }

    const properties = Array.from(propGroups.entries()).map(
      ([propName, vidMap]) => ({
        name: propName,
        values: Array.from(vidMap.entries()).map(([vid, val]) => ({
          id: vid,
          name: val,
          image: undefined as string | undefined,
        })),
      }),
    );

    // ── Map ConfiguredItems to SKUs ────────────────────────────────────────────
    const configurations: any[] = raw.ConfiguredItems ?? [];
    const skus: ProductSku[] = configurations.map((cfg: any) => {
      const props: Record<string, string> = {};
      const attributes: SkuAttribute[] = [];
      for (const conf of cfg.Configurators ?? []) {
        const attr = attrMap.get(`${conf.Pid}:${conf.Vid}`);
        if (!attr) continue;
        props[attr.name] = attr.value;
        // Keep the marketplace ids so the same SKU can be matched in another
        // language, where the property and value text differs.
        attributes.push({
          pid: String(conf.Pid),
          vid: String(conf.Vid),
          name: attr.name,
          value: attr.value,
        });
      }
      return {
        id: String(cfg.Id ?? ''),
        name: Object.values(props).join(' / ') || String(cfg.Id),
        priceCny: Number(
          cfg.Price?.OriginalPrice ?? cfg.Price?.MarginPrice ?? base.priceCny,
        ),
        stock: Number(cfg.Quantity ?? 0),
        properties: props,
        attributes,
      };
    });

    // ── Images ────────────────────────────────────────────────────────────────
    const images = (raw.Pictures ?? [])
      .map((p: any) => p.Large?.Url ?? p.Medium?.Url ?? p.Url)
      .filter(Boolean);

    return {
      ...base,
      images,
      description: raw.Description || undefined,
      skus,
      properties,
      url: raw.TaobaoItemUrl ?? raw.ExternalItemUrl ?? base.url,
    };
  }
}
