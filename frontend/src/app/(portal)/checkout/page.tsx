'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { useCheckout } from '@/hooks/use-checkout';
import { CheckoutShopBlock } from '@/components/shop/CheckoutShopBlock';
import { CheckoutRouteSection } from '@/components/shop/CheckoutRouteSection';
import { CheckoutReceiverSection } from '@/components/shop/CheckoutReceiverSection';
import { CheckoutSummary } from '@/components/shop/CheckoutSummary';
import { CheckoutSuccess } from '@/components/shop/CheckoutSuccess';
import { PurchaseProgress } from '@/components/shop/PurchaseProgress';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingState } from '@/components/ui/loading-state';
import { formatCny, formatVnd } from '@/lib/currency';
import { icon } from '@/lib/icon';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const selectedIdsParam = searchParams.get('items') ?? '';
  const selectedIds = selectedIdsParam ? selectedIdsParam.split(',').filter(Boolean) : [];

  const {
    cart,
    cartLoading,
    vndPerCny,
    selectedItems,
    shopGroups,
    warehouses,
    form,
    setField,
    receiver,
    services,
    toggleService,
    agreed,
    setAgreed,
    totals,
    submitting,
    submit,
    orderIds,
  } = useCheckout(selectedIds);

  if (orderIds) {
    return <CheckoutSuccess orderCount={orderIds.length} />;
  }

  if (cartLoading) {
    return <LoadingState label="Đang tải giỏ hàng và phân loại sản phẩm" />;
  }

  if (!cart || selectedItems.length === 0) {
    return (
      <EmptyState icon={AlertTriangle} title="Không có sản phẩm nào được chọn">
        <Button variant="outline" onClick={() => router.push('/cart')}>
          Quay lại giỏ hàng
        </Button>
      </EmptyState>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <button
        type="button"
        onClick={() => router.push('/cart')}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--manifest-navy)] hover:underline hover:underline-offset-4"
      >
        <ArrowLeft {...icon('inline')} aria-hidden />
        Quay lại giỏ hàng
      </button>

      <div className="space-y-4 border-b border-[var(--rule)] pb-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h1 className="text-xl font-bold text-[var(--ink)] sm:text-2xl">Thanh toán</h1>
          <p className="text-sm text-[var(--graphite)]">
            <span data-numeric className="font-semibold text-[var(--ink)]">
              {selectedItems.length}
            </span>{' '}
            sản phẩm
            <span className="mx-2 inline-block h-3 w-px bg-[var(--rule)] align-middle" />
            <span data-numeric>{formatCny(totals.goodsTotalCny)}</span>
            <span className="mx-2 inline-block h-3 w-px bg-[var(--rule)] align-middle" />
            <span data-numeric>{formatVnd(totals.goodsTotalVnd)}</span>
          </p>
        </div>
        <PurchaseProgress current="Thanh toán" className="max-w-md" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-8 xl:grid-cols-[minmax(0,1fr)_400px]">
        <div className="space-y-6">
          {shopGroups.map((group) => (
            <CheckoutShopBlock key={group.shopKey} group={group} vndPerCny={vndPerCny} />
          ))}

          <CheckoutRouteSection
            cnWarehouses={warehouses.cn}
            vnWarehouses={warehouses.vn}
            cnLoading={warehouses.cnLoading}
            vnLoading={warehouses.vnLoading}
            cnWarehouseId={warehouses.cnWarehouseId}
            vnWarehouseId={warehouses.vnWarehouseId}
            shippingMethod={form.shippingMethod}
            onChange={setField}
          />

          <CheckoutReceiverSection
            name={receiver.receiverName}
            phone={receiver.receiverPhone}
            address={receiver.receiverAddress}
            province={form.receiverProvince}
            district={form.receiverDistrict}
            note={form.note}
            goodsTotalCny={totals.goodsTotalCny}
            onChange={setField}
          />
        </div>

        <CheckoutSummary
          goodsTotalVnd={totals.goodsTotalVnd}
          serviceFeeVnd={totals.serviceFeeVnd}
          grandTotalVnd={totals.grandTotalVnd}
          services={services}
          onServiceToggle={toggleService}
          agreed={agreed}
          onAgreedChange={setAgreed}
          submitting={submitting}
          onSubmit={submit}
        />
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <CheckoutContent />
    </Suspense>
  );
}
