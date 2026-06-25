export interface ProductSku {
  id: string;
  name: string;
  priceCny: number;
  stock: number;
  properties: Record<string, string>;
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
  getItemDetail(providerAlias: string, itemId: string): Promise<ProductItem>;
}
