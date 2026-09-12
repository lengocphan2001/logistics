'use client';

import { Info } from 'lucide-react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RequiredMark } from '@/components/ui/required-mark';
import { SHIPPING_METHODS } from '@/config/shop.config';
import { icon } from '@/lib/icon';

type Warehouse = { id: string; name: string };

type CheckoutRouteSectionProps = {
  cnWarehouses: Warehouse[];
  vnWarehouses: Warehouse[];
  cnLoading: boolean;
  vnLoading: boolean;
  cnWarehouseId: string;
  vnWarehouseId: string;
  shippingMethod: string;
  onChange: (
    field: 'cnWarehouseId' | 'vnWarehouseId' | 'shippingMethod',
    value: string,
  ) => void;
};

/** Where the goods are collected, where they land, and how they travel. */
export function CheckoutRouteSection({
  cnWarehouses,
  vnWarehouses,
  cnLoading,
  vnLoading,
  cnWarehouseId,
  vnWarehouseId,
  shippingMethod,
  onChange,
}: CheckoutRouteSectionProps) {
  return (
    <section className="panel p-5">
      <h2 className="font-heading text-base font-semibold text-[var(--ink)]">
        Tuyến vận chuyển
      </h2>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="cn-warehouse">
            Kho Trung Quốc <RequiredMark />
          </Label>
          <Select
            value={cnWarehouseId}
            onValueChange={(v) => onChange('cnWarehouseId', v)}
            disabled={cnLoading || cnWarehouses.length === 0}
          >
            <SelectTrigger id="cn-warehouse">
              <SelectValue placeholder={cnLoading ? 'Đang tải' : 'Chọn kho Trung Quốc'} />
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
          <Label htmlFor="vn-warehouse">
            Kho Việt Nam <RequiredMark />
          </Label>
          <Select
            value={vnWarehouseId}
            onValueChange={(v) => onChange('vnWarehouseId', v)}
            disabled={vnLoading || vnWarehouses.length === 0}
          >
            <SelectTrigger id="vn-warehouse">
              <SelectValue placeholder={vnLoading ? 'Đang tải' : 'Chọn kho Việt Nam'} />
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
          <Label htmlFor="shipping-method">
            Phương thức vận chuyển <RequiredMark />
          </Label>
          <Select value={shippingMethod} onValueChange={(v) => onChange('shippingMethod', v)}>
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

      <div className="mt-4 flex gap-3 border-l-2 border-[var(--manifest-navy)] bg-[var(--navy-wash)]/60 px-4 py-3">
        <Info
          {...icon('inline')}
          aria-hidden
          className="mt-0.5 shrink-0 text-[var(--manifest-navy)]"
        />
        <p data-prose className="text-sm text-[var(--ink)]">
          Sau khi hàng về kho Việt Nam, bạn thanh toán chi phí vận chuyển và dịch vụ,
          rồi tạo yêu cầu giao hàng.
        </p>
      </div>
    </section>
  );
}
