import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';
import { OtapiProvider } from './providers/otapi.provider';
import type {
  CategoryFlyoutSection,
  CategoryInfo,
  ProductItem,
  SearchResult,
  SkuPropertyPair,
} from './interfaces/product-provider.interface';

const HOT_ROOT_CATEGORY_LIMIT = 30;
/** Categories change rarely — default 7 days (seconds). */
const DEFAULT_CATEGORY_CACHE_TTL_SEC = 7 * 24 * 60 * 60;
/** Stale fallback when OTAPI is down — default 30 days (seconds). */
const DEFAULT_CATEGORY_STALE_TTL_SEC = 30 * 24 * 60 * 60;
/**
 * Language of the original listing. Staff buy on the marketplace itself, where
 * the variant picker is in Chinese, so the untranslated text has to travel
 * with the order.
 */
const SOURCE_LANGUAGE = 'zh-chs';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);
  private readonly cacheTtl: number;
  private readonly categoryCacheTtl: number;
  private readonly categoryStaleTtl: number;

  constructor(
    private readonly provider: OtapiProvider,
    private readonly config: ConfigService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {
    this.cacheTtl = (Number(config.get('PRODUCT_CACHE_TTL')) || 300) * 1000;
    this.categoryCacheTtl =
      (Number(config.get('PRODUCT_CATEGORY_CACHE_TTL')) ||
        DEFAULT_CATEGORY_CACHE_TTL_SEC) * 1000;
    this.categoryStaleTtl =
      (Number(config.get('PRODUCT_CATEGORY_STALE_TTL')) ||
        DEFAULT_CATEGORY_STALE_TTL_SEC) * 1000;
  }

  private async cached<T>(
    key: string,
    fn: () => Promise<T>,
    ttl?: number,
  ): Promise<T> {
    const hit = await this.cache.get<T>(key);
    if (hit !== undefined && hit !== null) return hit;
    const value = await fn();
    await this.cache.set(key, value, ttl ?? this.cacheTtl);
    return value;
  }

  private async cachedWithStaleFallback<T>(
    key: string,
    fn: () => Promise<T>,
    ttl: number,
    staleTtl = this.categoryStaleTtl,
  ): Promise<T> {
    const staleKey = `stale:${key}`;
    try {
      const value = await this.cached(key, fn, ttl);
      await this.cache.set(staleKey, value, staleTtl);
      return value;
    } catch (err) {
      const stale = await this.cache.get<T>(staleKey);
      if (stale != null) {
        this.logger.warn(`OTAPI unavailable — serving stale cache for ${key}`);
        return stale;
      }
      throw err;
    }
  }

  getCategories(
    parentId?: string,
    providerAlias?: string,
    limit?: number,
  ): Promise<CategoryInfo[]> {
    const id = parentId || '0';
    const provider = providerAlias || 'p1';
    const effectiveLimit =
      id === '0' ? (limit ?? HOT_ROOT_CATEGORY_LIMIT) : undefined;
    const cacheKey = `cat:${provider}:${id}:${effectiveLimit ?? 'all'}`;
    return this.cachedWithStaleFallback(
      cacheKey,
      () => this.provider.getCategories(id, provider, effectiveLimit),
      this.categoryCacheTtl,
    );
  }

  getCategoryFlyout(
    parentId: string,
    providerAlias?: string,
  ): Promise<CategoryFlyoutSection[]> {
    const provider = providerAlias || 'p1';
    const cacheKey = `cat-flyout:${provider}:${parentId}`;
    return this.cachedWithStaleFallback(
      cacheKey,
      async () => {
        const level2 = await this.getCategories(parentId, provider);
        return Promise.all(
          level2.map(async (cat) => {
            if (cat.hasChildren) {
              const items = await this.getCategories(cat.id, provider);
              return { id: cat.id, name: cat.name, items };
            }
            return { id: cat.id, name: cat.name, items: [] };
          }),
        );
      },
      this.categoryCacheTtl,
    );
  }

  search(params: {
    keyword?: string;
    categoryId?: string;
    providerAlias?: string;
    page?: number;
    pageSize?: number;
    sortField?: string;
    sortOrder?: string;
    priceMin?: number;
    priceMax?: number;
  }): Promise<SearchResult> {
    const p = { page: 1, pageSize: 48, ...params };
    const key = `search:${JSON.stringify(p)}`;
    // Search results — cache for configured TTL (default 5 min)
    return this.cached(key, () => this.provider.search(p));
  }

  getItemDetail(
    providerAlias: string,
    itemId: string,
    language?: string,
  ): Promise<ProductItem> {
    const suffix = language ? `:${language}` : '';
    return this.cached(`item:${providerAlias}:${itemId}${suffix}`, () =>
      this.provider.getItemDetail(providerAlias, itemId, language),
    );
  }

  /**
   * Resolve the properties of one SKU, in Vietnamese for the customer and in
   * the marketplace's own language for the staff member who has to find the
   * same variant on the shop page.
   *
   * The two languages are joined on the marketplace property and value ids, so
   * a translated label never has to be matched by text.
   */
  async resolveSkuProperties(
    providerAlias: string,
    itemId: string,
    skuId?: string | null,
  ): Promise<SkuPropertyPair[]> {
    if (!skuId) return [];

    const detail = await this.getItemDetail(providerAlias, itemId);
    const sku = detail.skus.find((s) => s.id === skuId);
    if (!sku) return [];

    const original = await this.sourceLanguageAttributes(
      providerAlias,
      itemId,
      skuId,
    );

    if (sku.attributes?.length) {
      return sku.attributes.map((attr) => {
        const source = original.get(`${attr.pid}:${attr.vid}`);
        return {
          name: attr.name,
          value: attr.value,
          nameOriginal: source?.name,
          valueOriginal: source?.value,
        };
      });
    }

    // Older cache entries have no attribute ids; fall back to display text.
    return Object.entries(sku.properties ?? {}).map(([name, value]) => ({
      name,
      value,
    }));
  }

  /**
   * The same SKU read in the source language, keyed by `pid:vid`. Returns an
   * empty map when the provider cannot serve that language, so a failure here
   * degrades the label rather than the order.
   */
  private async sourceLanguageAttributes(
    providerAlias: string,
    itemId: string,
    skuId: string,
  ): Promise<Map<string, { name: string; value: string }>> {
    const map = new Map<string, { name: string; value: string }>();
    try {
      const detail = await this.getItemDetail(
        providerAlias,
        itemId,
        SOURCE_LANGUAGE,
      );
      const sku = detail.skus.find((s) => s.id === skuId);
      for (const attr of sku?.attributes ?? []) {
        map.set(`${attr.pid}:${attr.vid}`, {
          name: attr.name,
          value: attr.value,
        });
      }
    } catch (err) {
      this.logger.warn(
        `Không lấy được thuộc tính gốc (${SOURCE_LANGUAGE}) cho ${itemId}: ${
          (err as Error)?.message
        }`,
      );
    }
    return map;
  }
}
