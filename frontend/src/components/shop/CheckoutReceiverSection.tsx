'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RequiredMark } from '@/components/ui/required-mark';
import { formatCny } from '@/lib/currency';

type ReceiverField =
  | 'receiverName'
  | 'receiverPhone'
  | 'receiverAddress'
  | 'receiverProvince'
  | 'receiverDistrict'
  | 'note';

type CheckoutReceiverSectionProps = {
  name: string;
  phone: string;
  address: string;
  province: string;
  district: string;
  note: string;
  goodsTotalCny: number;
  onChange: (field: ReceiverField, value: string) => void;
};

/** Who receives the parcel in Vietnam. */
export function CheckoutReceiverSection({
  name,
  phone,
  address,
  province,
  district,
  note,
  goodsTotalCny,
  onChange,
}: CheckoutReceiverSectionProps) {
  return (
    <section className="panel p-5">
      <h2 className="font-heading text-base font-semibold text-[var(--ink)]">Người nhận</h2>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="receiver-name">
            Họ tên <RequiredMark />
          </Label>
          <Input
            id="receiver-name"
            value={name}
            onChange={(e) => onChange('receiverName', e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="receiver-phone">
            Số điện thoại <RequiredMark />
          </Label>
          <Input
            id="receiver-phone"
            inputMode="tel"
            value={phone}
            onChange={(e) => onChange('receiverPhone', e.target.value)}
          />
        </div>
      </div>

      <div className="mt-4 space-y-1.5">
        <Label htmlFor="receiver-address">
          Địa chỉ nhận hàng tại Việt Nam <RequiredMark />
        </Label>
        <Input
          id="receiver-address"
          value={address}
          onChange={(e) => onChange('receiverAddress', e.target.value)}
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="receiver-province">Tỉnh hoặc thành phố</Label>
          <Input
            id="receiver-province"
            value={province}
            onChange={(e) => onChange('receiverProvince', e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="receiver-district">Quận hoặc huyện</Label>
          <Input
            id="receiver-district"
            value={district}
            onChange={(e) => onChange('receiverDistrict', e.target.value)}
          />
        </div>
      </div>

      <div className="mt-4 space-y-1.5">
        <Label htmlFor="order-note">Ghi chú đơn hàng</Label>
        <Input
          id="order-note"
          value={note}
          onChange={(e) => onChange('note', e.target.value)}
          placeholder="Yêu cầu đặc biệt cho nhân viên"
        />
      </div>

      <p data-prose className="mt-3 text-xs">
        Tiền hàng <span data-numeric>{formatCny(goodsTotalCny)}</span> được trừ từ ví Taman
        khi hoàn tất. Phí mua hộ và vận chuyển thanh toán sau.
      </p>
    </section>
  );
}
