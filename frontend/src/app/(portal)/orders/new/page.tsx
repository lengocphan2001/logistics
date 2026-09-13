'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle, Info, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LoadingState } from '@/components/ui/loading-state';
import { RequiredMark } from '@/components/ui/required-mark';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PortalPageHeader } from '@/components/portal/PortalPageHeader';
import { RequestTypePicker } from '@/components/portal/orders/RequestTypePicker';
import {
  emptyRequestItem,
  RequestItemsField,
} from '@/components/portal/orders/RequestItemsField';
import { useCustomerProfile } from '@/hooks/use-customer-profile';
import { warehousesService } from '@/services/warehouses.service';
import {
  ordersService,
  type CustomerOrderRequestItem,
} from '@/services/orders.service';
import { orderTypeLabels, type CustomerRequestType } from '@/lib/order-type';
import { SHIPPING_METHODS } from '@/config/shop.config';
import { apiErrorMessage } from '@/lib/api-error';
import { icon } from '@/lib/icon';

export default function NewOrderRequestPage() {
  const router = useRouter();
  const { profile, loading: profileLoading } = useCustomerProfile();

  const [type, setType] = useState<CustomerRequestType>('PROXY_ORDER');
  const [items, setItems] = useState<CustomerOrderRequestItem[]>([
    { ...emptyRequestItem },
  ]);
  const [sourceOrderCode, setSourceOrderCode] = useState('');
  const [amountCny, setAmountCny] = useState('');
  const [sourceTrackingCode, setSourceTrackingCode] = useState('');
  const [description, setDescription] = useState('');
  const [note, setNote] = useState('');
  const [shippingMethod, setShippingMethod] = useState<string>(
    SHIPPING_METHODS[0].value,
  );
  const [receiver, setReceiver] = useState({ name: '', phone: '', address: '' });
  const [vnWarehouseId, setVnWarehouseId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [createdCode, setCreatedCode] = useState<string | null>(null);

  const { data: vnWarehouses = [] } = useQuery({
    queryKey: ['warehouses', 'VN'],
    queryFn: () => warehousesService.listForCustomer('VN'),
    staleTime: 5 * 60 * 1000,
  });

  // Untouched fields fall back to the profile, same as checkout.
  const receiverName = receiver.name || profile?.name || '';
  const receiverPhone = receiver.phone || profile?.phone || '';
  const receiverAddress =
    receiver.address || profile?.shippingAddress || profile?.address || '';
  const warehouseId = vnWarehouseId || vnWarehouses[0]?.id || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!receiverName || !receiverPhone || !receiverAddress) {
      toast.error('Vui lòng điền đầy đủ thông tin người nhận');
      return;
    }
    if (type === 'PROXY_ORDER' && items.every((i) => !i.title.trim())) {
      toast.error('Vui lòng nhập ít nhất một sản phẩm');
      return;
    }
    if (type === 'PROXY_PAYMENT' && !sourceOrderCode.trim()) {
      toast.error('Vui lòng nhập mã đơn hàng trên sàn');
      return;
    }
    if (type === 'CONSIGNMENT' && !sourceTrackingCode.trim()) {
      toast.error('Vui lòng nhập mã vận đơn nội địa Trung Quốc');
      return;
    }

    setSubmitting(true);
    try {
      const res = await ordersService.createRequest({
        type,
        receiverName,
        receiverPhone,
        receiverAddress,
        note: note.trim() || undefined,
        vnWarehouseId: warehouseId || undefined,
        shippingMethod:
          SHIPPING_METHODS.find((m) => m.value === shippingMethod)?.label ??
          shippingMethod,
        items:
          type === 'PROXY_ORDER'
            ? items
                .filter((i) => i.title.trim())
                .map((i) => ({
                  ...i,
                  title: i.title.trim(),
                  url: i.url?.trim() || undefined,
                  note: i.note?.trim() || undefined,
                }))
            : undefined,
        sourceOrderCode:
          type === 'PROXY_PAYMENT' ? sourceOrderCode.trim() : undefined,
        amountCny:
          type === 'PROXY_PAYMENT' && amountCny ? Number(amountCny) : undefined,
        sourceTrackingCode:
          type === 'CONSIGNMENT' ? sourceTrackingCode.trim() : undefined,
        description:
          type === 'CONSIGNMENT' ? description.trim() || undefined : undefined,
      });
      setCreatedCode(res.data.billOfLadingCode);
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Không thể gửi yêu cầu'));
    } finally {
      setSubmitting(false);
    }
  };

  if (profileLoading) {
    return <LoadingState label="Đang tải hồ sơ" />;
  }

  if (createdCode) {
    return (
      <div className="mx-auto max-w-xl py-12">
        <div className="panel p-8 text-center">
          <CheckCircle
            {...icon('page')}
            aria-hidden
            className="mx-auto mb-3 size-10 text-[var(--ledger-green)]"
          />
          <h1 className="font-heading text-xl font-bold text-[var(--ink)]">
            Đã gửi yêu cầu
          </h1>
          <p data-prose className="mx-auto mt-2 text-sm">
            Mã yêu cầu <span className="font-mono font-semibold">{createdCode}</span>.
            Nhân viên sẽ báo phí và liên hệ với bạn.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button onClick={() => router.push('/orders')}>Xem đơn hàng</Button>
            <Button
              variant="outline"
              onClick={() => {
                setCreatedCode(null);
                setItems([{ ...emptyRequestItem }]);
                setSourceOrderCode('');
                setAmountCny('');
                setSourceTrackingCode('');
                setDescription('');
                setNote('');
              }}
            >
              Gửi yêu cầu khác
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-8">
      <PortalPageHeader
        title="Tạo yêu cầu"
        description="Đặt hàng hộ, thanh toán hộ hoặc ký gửi. Mua hộ qua danh mục thì dùng giỏ hàng."
      />

      <RequestTypePicker value={type} onChange={setType} />

      <section className="panel p-5">
        <h2 className="font-heading text-base font-semibold text-[var(--ink)]">
          Nội dung {orderTypeLabels[type].toLowerCase()}
        </h2>

        <div className="mt-4">
          {type === 'PROXY_ORDER' && (
            <RequestItemsField items={items} onChange={setItems} />
          )}

          {type === 'PROXY_PAYMENT' && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="source-order-code">
                  Mã đơn trên sàn <RequiredMark />
                </Label>
                <Input
                  id="source-order-code"
                  value={sourceOrderCode}
                  onChange={(e) => setSourceOrderCode(e.target.value)}
                  placeholder="Mã đơn Taobao, 1688"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="amount-cny">Số tiền cần thanh toán (¥)</Label>
                <Input
                  id="amount-cny"
                  type="number"
                  min={0}
                  step="0.01"
                  value={amountCny}
                  onChange={(e) => setAmountCny(e.target.value)}
                />
              </div>
            </div>
          )}

          {type === 'CONSIGNMENT' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="source-tracking">
                  Mã vận đơn nội địa Trung Quốc <RequiredMark />
                </Label>
                <Input
                  id="source-tracking"
                  value={sourceTrackingCode}
                  onChange={(e) => setSourceTrackingCode(e.target.value)}
                  placeholder="Mã do shop Trung Quốc cung cấp"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="description">Mô tả hàng hoá</Label>
                <Textarea
                  id="description"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Loại hàng, số kiện, đặc điểm nhận dạng"
                />
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="panel p-5">
        <h2 className="font-heading text-base font-semibold text-[var(--ink)]">
          Người nhận tại Việt Nam
        </h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="receiver-name">
              Họ tên <RequiredMark />
            </Label>
            <Input
              id="receiver-name"
              value={receiverName}
              onChange={(e) => setReceiver((r) => ({ ...r, name: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="receiver-phone">
              Số điện thoại <RequiredMark />
            </Label>
            <Input
              id="receiver-phone"
              inputMode="tel"
              value={receiverPhone}
              onChange={(e) => setReceiver((r) => ({ ...r, phone: e.target.value }))}
            />
          </div>
        </div>

        <div className="mt-4 space-y-1.5">
          <Label htmlFor="receiver-address">
            Địa chỉ nhận hàng <RequiredMark />
          </Label>
          <Input
            id="receiver-address"
            value={receiverAddress}
            onChange={(e) => setReceiver((r) => ({ ...r, address: e.target.value }))}
          />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="vn-warehouse">Kho Việt Nam</Label>
            <Select
              value={warehouseId}
              onValueChange={setVnWarehouseId}
              disabled={vnWarehouses.length === 0}
            >
              <SelectTrigger id="vn-warehouse">
                <SelectValue
                  placeholder={
                    vnWarehouses.length === 0 ? 'Chưa có kho Việt Nam' : 'Chọn kho'
                  }
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
            <Label htmlFor="shipping-method">Phương thức vận chuyển</Label>
            <Select value={shippingMethod} onValueChange={setShippingMethod}>
              <SelectTrigger id="shipping-method">
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

        <div className="mt-4 space-y-1.5">
          <Label htmlFor="note">Ghi chú cho nhân viên</Label>
          <Textarea
            id="note"
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
      </section>

      <div className="flex gap-3 border-l-2 border-[var(--manifest-navy)] bg-[var(--navy-wash)]/60 px-4 py-3">
        <Info
          {...icon('inline')}
          aria-hidden
          className="mt-0.5 shrink-0 text-[var(--manifest-navy)]"
        />
        <p data-prose className="text-sm text-[var(--ink)]">
          Yêu cầu này chưa trừ tiền trong ví. Nhân viên sẽ báo phí, sau đó bạn xác
          nhận và thanh toán.
        </p>
      </div>

      <Button type="submit" variant="commerce" size="lg" disabled={submitting}>
        {submitting ? (
          <>
            <Loader2 {...icon('inline')} aria-hidden className="animate-spin" />
            Đang gửi
          </>
        ) : (
          'Gửi yêu cầu'
        )}
      </Button>
    </form>
  );
}
