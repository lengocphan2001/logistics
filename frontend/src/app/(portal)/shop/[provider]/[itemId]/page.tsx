'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ImageOff } from 'lucide-react';
import { productsService } from '@/services/products.service';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingState } from '@/components/ui/loading-state';
import { ProductDescription } from '@/components/shop/ProductDescription';
import { ProductGallery } from '@/components/shop/ProductGallery';
import { ProductBuyPanel } from '@/components/shop/ProductBuyPanel';
import { useExchangeRate } from '@/hooks/use-exchange-rate';
import { icon } from '@/lib/icon';

/** Status the OTAPI upstream returns while it is still fetching from Taobao. */
const NOT_AVAILABLE_YET = 503;
const NOT_FOUND = 404;

function statusOf(err: unknown): number | undefined {
  return (err as { response?: { status?: number } })?.response?.status;
}

export default function ProductDetailPage() {
  const params = useParams() as { provider: string; itemId: string };
  const router = useRouter();
  const { vndPerCny } = useExchangeRate();

  const { data: product, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['product', params.provider, params.itemId],
    queryFn: () => productsService.getItemDetail(params.provider, params.itemId),
    staleTime: 10 * 60 * 1000,
    retry: (failCount, err) => {
      // Retry up to 3x for NotAvailable (503), never retry for NotFound (404)
      const status = statusOf(err);
      if (status === NOT_FOUND) return false;
      if (status === NOT_AVAILABLE_YET) return failCount < 3;
      return false;
    },
    retryDelay: 15_000, // wait 15s between retries for NotAvailable
  });

  if (isLoading) {
    return <LoadingState label="Đang tải thông tin sản phẩm" />;
  }

  if (isError || !product) {
    const status = statusOf(error);
    const notFound = status === NOT_FOUND;
    const notReady = status === NOT_AVAILABLE_YET;
    return (
      <EmptyState
        icon={ImageOff}
        title={
          notFound
            ? 'Sản phẩm không còn tồn tại'
            : notReady
            ? 'Thông tin chưa sẵn sàng, vui lòng thử lại'
            : 'Không thể tải sản phẩm'
        }
        hint={
          notReady
            ? 'OTAPI đang lấy dữ liệu từ Taobao, thường mất 10 đến 30 giây.'
            : 'Sản phẩm có thể đã bị xóa hoặc hết hàng.'
        }
      >
        {notReady && <Button onClick={() => refetch()}>Thử lại</Button>}
        <Button variant="outline" onClick={() => router.back()}>
          Quay lại
        </Button>
      </EmptyState>
    );
  }

  const images = [product.image, ...product.images].filter(Boolean) as string[];

  return (
    <div className="space-y-10">
      <button
        type="button"
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--manifest-navy)] hover:underline hover:underline-offset-4"
      >
        <ChevronLeft {...icon('inline')} aria-hidden />
        Quay lại
      </button>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-12 xl:grid-cols-[minmax(0,1fr)_440px]">
        <ProductGallery images={images} title={product.title} />
        <ProductBuyPanel product={product} vndPerCny={vndPerCny} />
      </div>

      <ProductDescription html={product.description} />
    </div>
  );
}
