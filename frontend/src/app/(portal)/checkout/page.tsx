'use client';

import { useMemo, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Loader2, CheckCircle, AlertTriangle, ArrowLeft, Info } from 'lucide-react';
import { toast } from 'sonner';
import { cartService } from '@/services/cart.service';
import { warehousesService } from '@/services/warehouses.service';
import { useCartStore } from '@/stores/cart.store';
import { useCustomerProfile } from '@/hooks/use-customer-profile';
import { useExchangeRate } from '@/hooks/use-exchange-rate';
import { groupCartByShop } from '@/components/shop/CartShopGroup';
import { CheckoutShopBlock } from '@/components/shop/CheckoutShopBlock';
import { CheckoutSummary } from '@/components/shop/CheckoutSummary';
import { PURCHASE_FEE_RATE, SHIPPING_METHODS } from '@/components/shop/checkout.constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cnyToVnd, formatCny, formatVnd } from '@/lib/currency';

type CheckoutForm = {
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  receiverProvince: string;
  receiverDistrict: string;
  note: string;
  cnWarehouseId: string;
  vnWarehouseId: string;
  shippingMethod: string;
};

const EMPTY_FORM: CheckoutForm = {
  receiverName: '',
  receiverPhone: '',
  receiverAddress: '',
  receiverProvince: '',
  receiverDistrict: '',
  note: '',
  cnWarehouseId: '',
  vnWarehouseId: '',
  shippingMethod: SHIPPING_METHODS[0].value,
};

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const selectedIdsParam = searchParams.get('items') ?? '';
  const selectedIds = selectedIdsParam ? selectedIdsParam.split(',').filter(Boolean) : [];

  const invalidate = useCartStore((s) => s.invalidate);
  const { profile } = useCustomerProfile();
  const { vndPerCny } = useExchangeRate();

  const { data: cart, isLoading: cartLoading } = useQuery({
    queryKey: ['cart', 'checkout', { enrich: true }],
    queryFn: () => cartService.getCart({ enrichProperties: true }),
    staleTime: 0,
  });

  const { data: cnWarehouses = [], isLoading: cnLoading } = useQuery({
    queryKey: ['warehouses', 'CN'],
    queryFn: () => warehousesService.listForCustomer('CN'),
    staleTime: 5 * 60 * 1000,
  });

  const { data: vnWarehouses = [], isLoading: vnLoading } = useQuery({
    queryKey: ['warehouses', 'VN'],
    queryFn: () => warehousesService.listForCustomer('VN'),
    staleTime: 5 * 60 * 1000,
  });

  const [form, setForm] = useState<CheckoutForm>(EMPTY_FORM);
  const [services, setServices] = useState<Record<string, boolean>>({});
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string[] | null>(null);

  const cnWarehouseId = form.cnWarehouseId || cnWarehouses[0]?.id || '';
  const vnWarehouseId = form.vnWarehouseId || vnWarehouses[0]?.id || '';
  const receiverName = form.receiverName || profile?.name || '';
  const receiverPhone = form.receiverPhone || profile?.phone || '';
  const receiverAddress =
    form.receiverAddress || profile?.shippingAddress || profile?.address || '';

  const selectedItems =
    cart?.items.filter((i) => selectedIds.length === 0 || selectedIds.includes(i.id)) ?? [];

  const shopGroups = useMemo(() => groupCartByShop(selectedItems), [selectedItems]);

  const goodsTotalCny = selectedItems.reduce(
    (sum, i) => sum + Number(i.priceCny) * i.quantity,
    0,
  );
  const goodsTotalVnd = cnyToVnd(goodsTotalCny, vndPerCny);
  const serviceFeeVnd = Math.round(goodsTotalVnd * PURCHASE_FEE_RATE);
  const grandTotalVnd = goodsTotalVnd + serviceFeeVnd;

  const handleSubmit = async () => {
    if (!receiverName || !receiverPhone || !receiverAddress) {
      toast.error('Vui lòng điền đầy đủ thông tin người nhận');
      return;
    }
    if (!cnWarehouseId || !vnWarehouseId) {
      toast.error('Vui lòng chọn kho Trung Quốc và kho Việt Nam');
      return;
    }
    if (!agreed) {
      toast.error('Vui lòng đồng ý với điều khoản');
      return;
    }

    setSubmitting(true);
    try {
      const result = await cartService.checkout({
        receiverName,
        receiverPhone,
        receiverAddress,
        receiverProvince: form.receiverProvince || undefined,
        receiverDistrict: form.receiverDistrict || undefined,
        note: form.note || undefined,
        cartItemIds: selectedIds.length > 0 ? selectedIds : undefined,
        cnWarehouseId,
        vnWarehouseId,
        shippingMethod:
          SHIPPING_METHODS.find((m) => m.value === form.shippingMethod)?.label ??
          form.shippingMethod,
      });
      invalidate();
      setSuccess(result.orderIds);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data
        ?.message;
      toast.error(msg || 'Đặt hàng thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <CheckCircle className="mb-4 h-16 w-16 text-green-500" />
        <h2 className="text-xl font-bold text-gray-900">Đặt hàng thành công!</h2>
        <p className="mt-2 max-w-md text-gray-500">
          Đã tạo {success.length} đơn hàng. Nhân viên sẽ xử lý và thông báo khi hàng về kho VN.
        </p>
        <div className="mt-6 flex w-full max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
          <Button variant="outline" className="w-full sm:w-auto" onClick={() => router.push('/orders')}>
            Xem đơn hàng
          </Button>
          <Button
            className="w-full bg-amber-600 text-white hover:bg-amber-700 sm:w-auto"
            onClick={() => router.push('/shop')}
          >
            Tiếp tục mua hàng
          </Button>
        </div>
      </div>
    );
  }

  if (cartLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-24">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
        <p className="text-sm text-gray-500">Đang tải giỏ hàng &amp; thuộc tính sản phẩm...</p>
      </div>
    );
  }

  if (!cart || selectedItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-400">
        <AlertTriangle className="mb-3 h-12 w-12 opacity-30" />
        <p>Không có sản phẩm nào được chọn</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/cart')}>
          Quay lại giỏ hàng
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <button
        type="button"
        onClick={() => router.push('/cart')}
        className="flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-gray-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại giỏ hàng
      </button>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Thanh toán</h1>
        <p className="text-sm text-gray-500">
          {selectedItems.length} sản phẩm · {formatCny(goodsTotalCny)} ≈ {formatVnd(goodsTotalVnd)}
        </p>
      </div>

      <div className="grid gap-8 pb-8 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          {shopGroups.map((group) => (
            <CheckoutShopBlock key={group.shopKey} group={group} vndPerCny={vndPerCny} />
          ))}

          <section className="rounded-xl border border-gray-200/80 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-sky-700">Thông tin nhận hàng</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-1.5">
                <Label className="text-gray-600">
                  Kho Trung Quốc <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={cnWarehouseId}
                  onValueChange={(v) => setForm((f) => ({ ...f, cnWarehouseId: v }))}
                  disabled={cnLoading || cnWarehouses.length === 0}
                >
                  <SelectTrigger className="border-gray-200 bg-gray-50/50">
                    <SelectValue
                      placeholder={cnLoading ? 'Đang tải...' : 'Chọn kho TQ'}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {cnWarehouses.map((w) => (
                      <SelectItem key={w.id} value={w.id}>
                        {w.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-gray-600">
                  Kho Việt Nam <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={vnWarehouseId}
                  onValueChange={(v) => setForm((f) => ({ ...f, vnWarehouseId: v }))}
                  disabled={vnLoading || vnWarehouses.length === 0}
                >
                  <SelectTrigger className="border-gray-200 bg-gray-50/50">
                    <SelectValue
                      placeholder={vnLoading ? 'Đang tải...' : 'Chọn kho VN'}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {vnWarehouses.map((w) => (
                      <SelectItem key={w.id} value={w.id}>
                        {w.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-gray-600">
                  Phương thức vận chuyển <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={form.shippingMethod}
                  onValueChange={(v) => setForm((f) => ({ ...f, shippingMethod: v }))}
                >
                  <SelectTrigger className="border-gray-200 bg-gray-50/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SHIPPING_METHODS.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-4 flex gap-3 rounded-lg border border-sky-100 bg-sky-50/80 px-4 py-3">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
              <p className="text-sm leading-relaxed text-sky-900/80">
                <span className="font-medium">Quy trình sau khi đặt hàng:</span> Sau khi hàng về kho
                VN, quý khách vui lòng thanh toán chi phí vận chuyển &amp; dịch vụ và tạo yêu cầu
                giao hàng.
              </p>
            </div>
          </section>

          <section className="rounded-xl border border-gray-200/80 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900">Thông tin người nhận</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>
                  Họ tên <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={receiverName}
                  onChange={(e) => setForm((f) => ({ ...f, receiverName: e.target.value }))}
                  className="border-gray-200"
                />
              </div>
              <div className="space-y-1.5">
                <Label>
                  Số điện thoại <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={receiverPhone}
                  onChange={(e) => setForm((f) => ({ ...f, receiverPhone: e.target.value }))}
                  className="border-gray-200"
                />
              </div>
            </div>
            <div className="mt-4 space-y-1.5">
              <Label>
                Địa chỉ nhận hàng tại Việt Nam <span className="text-red-500">*</span>
              </Label>
              <Input
                value={receiverAddress}
                onChange={(e) => setForm((f) => ({ ...f, receiverAddress: e.target.value }))}
                className="border-gray-200"
              />
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Tỉnh / Thành phố</Label>
                <Input
                  value={form.receiverProvince}
                  onChange={(e) => setForm((f) => ({ ...f, receiverProvince: e.target.value }))}
                  className="border-gray-200"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Quận / Huyện</Label>
                <Input
                  value={form.receiverDistrict}
                  onChange={(e) => setForm((f) => ({ ...f, receiverDistrict: e.target.value }))}
                  className="border-gray-200"
                />
              </div>
            </div>
            <div className="mt-4 space-y-1.5">
              <Label>Ghi chú đơn hàng</Label>
              <Input
                value={form.note}
                onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                placeholder="Yêu cầu đặc biệt cho nhân viên..."
                className="border-gray-200"
              />
            </div>
            <p className="mt-3 text-xs text-gray-400">
              * Đặt cọc tiền hàng ({formatCny(goodsTotalCny)}) sẽ trừ từ ví Taman khi hoàn tất.
              Phí mua hộ &amp; vận chuyển thanh toán sau.
            </p>
          </section>
        </div>

        <CheckoutSummary
          goodsTotalVnd={goodsTotalVnd}
          serviceFeeVnd={serviceFeeVnd}
          grandTotalVnd={grandTotalVnd}
          services={services}
          onServiceToggle={(id, checked) =>
            setServices((prev) => ({ ...prev, [id]: checked }))
          }
          agreed={agreed}
          onAgreedChange={setAgreed}
          submitting={submitting}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
