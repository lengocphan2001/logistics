/**
 * One configurator attribute of a SKU, kept with the marketplace's own
 * property and value ids so the same SKU can be matched across languages.
 */
export interface SkuAttribute {
  pid: string;
  vid: string;
  name: string;
  value: string;
}

export interface ProductSku {
  id: string;
  name: string;
  priceCny: number;
  stock: number;
  /** Translated name to translated value, for display. */
  properties: Record<string, string>;
  /** Same data keyed by marketplace ids; used to join languages. */
  attributes?: SkuAttribute[];
}

/**
 * A SKU attribute shown to the customer in Vietnamese and repeated in the
 * marketplace's own language, which is what staff must match on the shop page.
 */
export interface SkuPropertyPair {
  name: string;
  value: string;
  /** Original property name, usually Chinese. Absent if the lookup failed. */
  nameOriginal?: string;
  /** Original value, usually Chinese. */
  valueOriginal?: string;
}

export interface ProductItem {
  itemId: string;
  platform: string; // 'taobao' | '1688' | ...
  providerAlias: string; // 'p1' | 'p6' | ...
  title: string;
  image: string;
  images: string[];
  priceCny: number; // min price
  originalPriceCny?: number;
  shopId: string;
  shopName: string;
  shopUrl?: string;
  rating?: number;
  reviewCount?: number;
  soldCount?: number;
  url?: string;
  skus: ProductSku[];
  properties?: {
    name: string;
    values: { id: string; name: string; image?: string }[];
  }[];
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

export interface IProductProvider {
  getCategories(
    parentId?: string,
    providerAlias?: string,
    limit?: number,
  ): Promise<CategoryInfo[]>;
  getCategoryFlyout(
    parentId: string,
    providerAlias?: string,
  ): Promise<CategoryFlyoutSection[]>;
  search(params: {
    keyword?: string;
    categoryId?: string;
    providerAlias?: string;
    page: number;
    pageSize: number;
    sortField?: string;
    sortOrder?: string;
    priceMin?: number;
    priceMax?: number;
  }): Promise<SearchResult>;
  /** `language` overrides the configured one, e.g. 'zh-chs' for the raw listing. */
  getItemDetail(
    providerAlias: string,
    itemId: string,
    language?: string,
  ): Promise<ProductItem>;
}
