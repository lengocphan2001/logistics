import api from '@/lib/api';

export interface ProductSku {
  id: string;
  name: string;
  priceCny: number;
  stock: number;
  properties: Record<string, string>;
}

export interface ProductItem {
  itemId: string;
  platform: string;
  providerAlias: string;
  title: string;
  image: string;
  images: string[];
  priceCny: number;
  originalPriceCny?: number;
  shopId: string;
  shopName: string;
  shopUrl?: string;
  rating?: number;
  reviewCount?: number;
  soldCount?: number;
  url?: string;
  skus: ProductSku[];
  properties?: { name: string; values: { id: string; name: string; image?: string }[] }[];
  description?: string;
}

export interface CategoryInfo {
  id: string;
  name: string;
  parentId?: string;
  image?: string;
  hasChildren: boolean;
}

export interface CategoryFlyoutSection {
  id: string;
  name: string;
  items: CategoryInfo[];
}

export interface SearchResult {
  items: ProductItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface SearchParams {
  keyword?: string;
  categoryId?: string;
  provider?: string;
  page?: number;
  pageSize?: number;
  sortField?: string;
  sortOrder?: string;
  priceMin?: number;
  priceMax?: number;
}

export const productsService = {
  getCategories: (
    parentId?: string,
    provider?: string,
    limit = 30,
  ): Promise<CategoryInfo[]> =>
    api
      .get('/products/categories', { params: { parentId, provider, limit } })
      .then((r) => r.data),

  getCategoryFlyout: (
    parentId: string,
    provider?: string,
  ): Promise<CategoryFlyoutSection[]> =>
    api
      .get('/products/categories/flyout', { params: { parentId, provider } })
      .then((r) => r.data),

  search: (params: SearchParams): Promise<SearchResult> =>
    api.get('/products/search', { params }).then((r) => r.data),

  getItemDetail: (providerAlias: string, itemId: string): Promise<ProductItem> =>
    api.get(`/products/${providerAlias}/${itemId}`).then((r) => r.data),

  /**
   * For public CDN domains (alicdn, taobaocdn) use direct URL.
   * For others, route through image proxy to avoid CORS/hotlink issues.
   */
  imageProxyUrl: (url: string): string => {
    if (!url) return '';
    try {
      const { hostname } = new URL(url);
      const publicDomains = ['alicdn.com', 'taobaocdn.com', 'tmall.com'];
      if (publicDomains.some((d) => hostname === d || hostname.endsWith(`.${d}`))) {
        return url; // direct — no proxy needed
      }
    } catch {
      // invalid URL — fall through to proxy
    }
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    return `${base}/products/image-proxy?url=${encodeURIComponent(url)}`;
  },
};
