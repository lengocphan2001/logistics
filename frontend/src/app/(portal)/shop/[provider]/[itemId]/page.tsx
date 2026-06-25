'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ShoppingCart, Loader2, ImageOff } from 'lucide-react';
import { toast } from 'sonner';
import { productsService, type ProductSku } from '@/services/products.service';
import { cartService } from '@/services/cart.service';
import { useCartStore } from '@/stores/cart.store';
import { Button } from '@/components/ui/button';
import { ProductDescription } from '@/components/shop/ProductDescription';
import { cn } from '@/lib/utils';

export default function ProductDetailPage() {
  const params = useParams() as { provider: string; itemId: string };
  const router = useRouter();
  const invalidate = useCartStore((s) => s.invalidate);

  const [selectedSku, setSelectedSku] = useState<ProductSku | null>(null);
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);

  const { data: product, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['product', params.provider, params.itemId],
    queryFn: () => productsService.getItemDetail(params.provider, params.itemId),
    staleTime: 10 * 60 * 1000,
    retry: (failCount, err: any) => {
      // Retry up to 3x for NotAvailable (503), never retry for NotFound (404)
      if (err?.response?.status === 404) return false;
      if (err?.response?.status === 503) return failCount < 3;
      return false;
    },
    retryDelay: 15_000, // wait 15s between retries for NotAvailable
  });

  const displayImage = mainImage
    ? productsService.imageProxyUrl(mainImage)
    : product?.image
    ? productsService.imageProxyUrl(product.image)
    : null;

  const effectivePrice = selectedSku?.priceCny ?? product?.priceCny ?? 0;

  const handleAddToCart = async () => {
    if (!product) return;
    setAdding(true);
    try {
      await cartService.upsertItem({
        itemId: product.itemId,
        providerAlias: product.providerAlias,
        skuId: selectedSku?.id,
        title: product.title,
        image: product.image,
        url: product.url,
        shopId: product.shopId,
        shopName: product.shopName,
        platform: product.platform,
        priceCny: Number(effectivePrice) || 0,
        quantity: qty,
        properties: selectedSku
          ? Object.entries(selectedSku.properties).map(([name, value]) => ({ name, value }))
          : undefined,
      });
      invalidate();
      toast.success('Đã thêm vào giỏ hàng');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : msg || 'Không thể thêm vào giỏ hàng');
    } finally {
      setAdding(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24">
        <Loader2 className="h-10 w-10 animate-spin text-amber-600" />
        <p className="text-sm text-gray-400">Đang tải thông tin sản phẩm...</p>
      </div>
    );
  }

  if (isError || !product) {
    const errStatus = (error as any)?.response?.status;
    const is404 = errStatus === 404;
    const is503 = errStatus === 503;
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-400">
        <ImageOff className="mb-4 h-14 w-14 opacity-25" />
        <p className="text-base font-medium text-gray-600">
          {is404
            ? 'Sản phẩm không còn tồn tại'
            : is503
            ? 'Thông tin chưa sẵn sàng, vui lòng thử lại'
            : 'Không thể tải sản phẩm'}
        </p>
        <p className="mt-1 text-sm">
          {is503
            ? 'OTAPI đang lấy dữ liệu từ Taobao, thường mất 10–30 giây'
            : 'Sản phẩm có thể đã bị xóa hoặc hết hàng'}
        </p>
        <div className="mt-5 flex gap-3">
          {is503 && (
            <Button
              size="sm"
              className="bg-amber-600 hover:bg-amber-700 text-white"
              onClick={() => refetch()}
            >
              Thử lại
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  const allImages = [product.image, ...product.images].filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-amber-700 hover:text-amber-900"
      >
        <ChevronLeft className="h-4 w-4" /> Quay lại
      </button>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Images */}
        <div className="space-y-3">
          <div className="aspect-square overflow-hidden rounded-xl border border-amber-100 bg-amber-50/30">
            {displayImage ? (
              <img
                src={displayImage}
                alt={product.title}
                className="h-full w-full object-contain"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-300">
                <ImageOff className="h-16 w-16" />
              </div>
            )}
          </div>
          {allImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setMainImage(img!)}
                  className={cn(
                    'h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition',
                    mainImage === img || (!mainImage && i === 0)
                      ? 'border-amber-500'
                      : 'border-transparent hover:border-amber-300',
                  )}
                >
                  <img
                    src={productsService.imageProxyUrl(img!)}
                    alt=""
                    className="h-full w-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-amber-600">
              {product.platform} · {product.shopName}
            </p>
            <h1 className="mt-1 text-lg font-bold leading-snug text-gray-900">{product.title}</h1>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-amber-700">¥{effectivePrice.toFixed(2)}</span>
            {product.soldCount && (
              <span className="text-sm text-gray-400">Đã bán: {product.soldCount.toLocaleString()}</span>
            )}
          </div>

          {/* SKU selection */}
          {product.properties && product.properties.length > 0 && (
            <div className="space-y-3">
              {product.properties.map((prop) => (
                <div key={prop.name}>
                  <p className="mb-2 text-sm font-medium text-gray-700">{prop.name}</p>
                  <div className="flex flex-wrap gap-2">
                    {prop.values.map((v) => {
                      const sku = product.skus.find((s) =>
                        Object.values(s.properties).includes(v.name),
                      );
                      const isSelected = selectedSku?.id === sku?.id;
                      return (
                        <button
                          key={v.id}
                          onClick={() => sku && setSelectedSku(isSelected ? null : sku)}
                          className={cn(
                            'flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition',
                            isSelected
                              ? 'border-amber-500 bg-amber-50 font-medium text-amber-800'
                              : 'border-gray-200 text-gray-700 hover:border-amber-300 hover:bg-amber-50',
                          )}
                        >
                          {v.image && (
                            <img
                              src={productsService.imageProxyUrl(v.image)}
                              alt={v.name}
                              className="h-5 w-5 rounded object-cover"
                            />
                          )}
                          {v.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quantity */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-700">Số lượng:</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                −
              </button>
              <span className="w-10 text-center text-sm font-medium">{qty}</span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                +
              </button>
            </div>
          </div>

          {/* Total */}
          <div className="rounded-xl bg-amber-50 px-4 py-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Tổng cộng:</span>
              <span className="text-xl font-bold text-amber-700">
                ¥{(effectivePrice * qty).toFixed(2)}
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-400">
              * Chưa bao gồm phí vận chuyển và dịch vụ
            </p>
          </div>

          <Button
            size="lg"
            className="w-full bg-amber-600 hover:bg-amber-700 text-white"
            onClick={handleAddToCart}
            disabled={adding}
          >
            {adding ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Thêm vào giỏ hàng
              </>
            )}
          </Button>
        </div>
      </div>

      <ProductDescription html={product.description} />
    </div>
  );
}
