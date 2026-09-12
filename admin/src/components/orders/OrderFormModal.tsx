'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Modal, ModalSection } from '@/components/ui/modal';
import { RequiredMark } from '@/components/ui/required-mark';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ordersService, type Order, type OrderStatus, type OrderType } from '@/services/orders.service';
import type { Customer } from '@/services/customers.service';
import { ORDER_STATUSES, orderStatusLabels } from '@/lib/order-status';
import { ORDER_TYPES, orderTypeLabels } from '@/lib/order-type';
import { formatVnd } from '@/lib/currency';
import { apiErrorMessage } from '@/lib/api-error';
import { icon } from '@/lib/icon';

export interface WarehouseOption {
  id: string;
  name: string;
  code: string;
}

const emptyForm = {
  type: 'PROXY_PURCHASE' as OrderType,
  customerId: '',
  warehouseId: '',
  senderName: '',
  senderPhone: '',
  senderAddress: '',
  receiverName: '',
  receiverPhone: '',
  receiverAddress: '',
  receiverProvince: '',
  receiverDistrict: '',
  weight: '',
  description: '',
  quantity: '1',
  declaredValue: '0',
  codAmount: '0',
  feeTransfer: '0',
  feeInsurance: '0',
  feeExtra: '0',
  paymentMethod: 'COD',
  paymentStatus: 'UNPAID',
  note: '',
  status: 'DEPOSIT_PAID' as OrderStatus,
};

type OrderFormModalProps = {
  open: boolean;
  onClose: () => void;
  /** null means "create"; an order means "edit that order". */
  editing: Order | null;
  customers: Customer[];
  warehouses: WarehouseOption[];
  onSaved: () => void;
};

export function OrderFormModal({
  open,
  onClose,
  editing,
  customers,
  warehouses,
  onSaved,
}: OrderFormModalProps) {
  const [formData, setFormData] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  // Reload the form whenever the modal is opened for a different order.
  useEffect(() => {
    if (!open) return;
    if (!editing) {
      setFormData(emptyForm);
      return;
    }
    setFormData({
      type: editing.type,
      customerId: editing.customerId || '',
      warehouseId: editing.warehouseId || '',
      senderName: editing.senderName,
      senderPhone: editing.senderPhone,
      senderAddress: editing.senderAddress,
      receiverName: editing.receiverName,
      receiverPhone: editing.receiverPhone,
      receiverAddress: editing.receiverAddress,
      receiverProvince: editing.receiverProvince || '',
      receiverDistrict: editing.receiverDistrict || '',
      weight: editing.weight ? String(editing.weight) : '',
      description: editing.description || '',
      quantity: String(editing.quantity),
      declaredValue: String(editing.declaredValue),
      codAmount: String(editing.codAmount),
      feeTransfer: String(editing.feeTransfer),
      feeInsurance: String(editing.feeInsurance),
      feeExtra: String(editing.feeExtra),
      paymentMethod: editing.paymentMethod,
      paymentStatus: editing.paymentStatus,
      note: editing.note || '',
      status: editing.status,
    });
  }, [open, editing]);

  const setField = (field: keyof typeof emptyForm, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  /** Picking a customer prefills the sender block with their own details. */
  const handleCustomerChange = (customerId: string) => {
    const customer = customers.find((c) => c.id === customerId);
    setFormData((prev) => ({
      ...prev,
      customerId,
      senderName: customer?.fullName || prev.senderName,
      senderPhone: customer?.phone || prev.senderPhone,
      senderAddress: customer?.address || prev.senderAddress,
    }));
  };

  const buildPayload = () => ({
    type: formData.type,
    customerId: formData.customerId || undefined,
    warehouseId: formData.warehouseId || undefined,
    senderName: formData.senderName.trim(),
    senderPhone: formData.senderPhone.trim(),
    senderAddress: formData.senderAddress.trim(),
    receiverName: formData.receiverName.trim(),
    receiverPhone: formData.receiverPhone.trim(),
    receiverAddress: formData.receiverAddress.trim(),
    receiverProvince: formData.receiverProvince.trim() || undefined,
    receiverDistrict: formData.receiverDistrict.trim() || undefined,
    weight: formData.weight ? Number(formData.weight) : undefined,
    description: formData.description.trim() || undefined,
    quantity: Number(formData.quantity) || 1,
    declaredValue: Number(formData.declaredValue) || 0,
    codAmount: Number(formData.codAmount) || 0,
    feeTransfer: Number(formData.feeTransfer) || 0,
    feeInsurance: Number(formData.feeInsurance) || 0,
    feeExtra: Number(formData.feeExtra) || 0,
    paymentMethod: formData.paymentMethod as 'COD' | 'BANK_TRANSFER' | 'BALANCE',
    paymentStatus: formData.paymentStatus as 'UNPAID' | 'PAID' | 'REFUNDED',
    note: formData.note.trim() || undefined,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.senderName.trim() ||
      !formData.senderPhone.trim() ||
      !formData.receiverName.trim() ||
      !formData.receiverPhone.trim()
    ) {
      toast.error('Vui lòng điền đầy đủ thông tin người gửi và người nhận');
      return;
    }

    try {
      setSubmitting(true);
      if (editing) {
        await ordersService.update(editing.id, {
          ...buildPayload(),
          status: formData.status,
        });
        toast.success('Cập nhật đơn hàng thành công');
      } else {
        await ordersService.create(buildPayload());
        toast.success('Tạo đơn hàng mới thành công');
      }
      onClose();
      onSaved();
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Không thể lưu đơn hàng'));
    } finally {
      setSubmitting(false);
    }
  };

  const totalFeePreview =
    (Number(formData.feeTransfer) || 0) +
    (Number(formData.feeInsurance) || 0) +
    (Number(formData.feeExtra) || 0);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? `Sửa đơn ${editing.billOfLadingCode}` : 'Tạo đơn hàng mới'}
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
            Huỷ
          </Button>
          <Button type="submit" form="order-form" disabled={submitting}>
            {submitting ? (
              <Loader2 {...icon('inline')} aria-hidden className="animate-spin" />
            ) : editing ? (
              'Cập nhật đơn'
            ) : (
              'Tạo đơn hàng'
            )}
          </Button>
        </>
      }
    >
      <form id="order-form" onSubmit={handleSubmit}>
        <ModalSection title="Loại đơn và liên kết">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="order-type">Loại đơn hàng</Label>
              <Select
                value={formData.type}
                onValueChange={(val) => setField('type', val)}
              >
                <SelectTrigger id="order-type">
                  <SelectValue placeholder="Chọn loại đơn" />
                </SelectTrigger>
                <SelectContent>
                  {ORDER_TYPES.map((key) => (
                    <SelectItem key={key} value={key}>
                      {orderTypeLabels[key]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="order-customer">Khách hàng</Label>
              <Select
                value={formData.customerId || 'none'}
                onValueChange={(val) => handleCustomerChange(val === 'none' ? '' : val)}
              >
                <SelectTrigger id="order-customer">
                  <SelectValue placeholder="Chọn khách hàng" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Khách lẻ</SelectItem>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.fullName} ({c.username})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="order-warehouse">Kho xử lý</Label>
              <Select
                value={formData.warehouseId || 'none'}
                onValueChange={(val) => setField('warehouseId', val === 'none' ? '' : val)}
              >
                <SelectTrigger id="order-warehouse">
                  <SelectValue placeholder="Chọn kho" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Không chọn</SelectItem>
                  {warehouses.map((wh) => (
                    <SelectItem key={wh.id} value={wh.id}>
                      {wh.name} ({wh.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </ModalSection>

        <ModalSection title="Người gửi">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="sender-name">
                Họ tên <RequiredMark />
              </Label>
              <Input
                id="sender-name"
                value={formData.senderName}
                onChange={(e) => setField('senderName', e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sender-phone">
                Số điện thoại <RequiredMark />
              </Label>
              <Input
                id="sender-phone"
                inputMode="tel"
                value={formData.senderPhone}
                onChange={(e) => setField('senderPhone', e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sender-address">
                Địa chỉ <RequiredMark />
              </Label>
              <Input
                id="sender-address"
                value={formData.senderAddress}
                onChange={(e) => setField('senderAddress', e.target.value)}
                required
              />
            </div>
          </div>
        </ModalSection>

        <ModalSection title="Người nhận">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="receiver-name">
                Họ tên <RequiredMark />
              </Label>
              <Input
                id="receiver-name"
                value={formData.receiverName}
                onChange={(e) => setField('receiverName', e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="receiver-phone">
                Số điện thoại <RequiredMark />
              </Label>
              <Input
                id="receiver-phone"
                inputMode="tel"
                value={formData.receiverPhone}
                onChange={(e) => setField('receiverPhone', e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="receiver-address">
                Địa chỉ <RequiredMark />
              </Label>
              <Input
                id="receiver-address"
                value={formData.receiverAddress}
                onChange={(e) => setField('receiverAddress', e.target.value)}
                required
              />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="receiver-province">Tỉnh hoặc thành phố</Label>
              <Input
                id="receiver-province"
                value={formData.receiverProvince}
                onChange={(e) => setField('receiverProvince', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="receiver-district">Quận hoặc huyện</Label>
              <Input
                id="receiver-district"
                value={formData.receiverDistrict}
                onChange={(e) => setField('receiverDistrict', e.target.value)}
              />
            </div>
          </div>
        </ModalSection>

        <ModalSection title="Hàng hoá và phí">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="space-y-1.5">
              <Label htmlFor="order-weight">Khối lượng (kg)</Label>
              <Input
                id="order-weight"
                type="number"
                min="0"
                step="0.01"
                value={formData.weight}
                onChange={(e) => setField('weight', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="order-quantity">Số lượng</Label>
              <Input
                id="order-quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setField('quantity', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="order-declared">Giá trị khai báo</Label>
              <Input
                id="order-declared"
                type="number"
                min="0"
                value={formData.declaredValue}
                onChange={(e) => setField('declaredValue', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="order-cod">Tiền thu hộ</Label>
              <Input
                id="order-cod"
                type="number"
                min="0"
                value={formData.codAmount}
                onChange={(e) => setField('codAmount', e.target.value)}
              />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="fee-transfer">Phí vận chuyển</Label>
              <Input
                id="fee-transfer"
                type="number"
                min="0"
                value={formData.feeTransfer}
                onChange={(e) => setField('feeTransfer', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fee-insurance">Phí bảo hiểm</Label>
              <Input
                id="fee-insurance"
                type="number"
                min="0"
                value={formData.feeInsurance}
                onChange={(e) => setField('feeInsurance', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fee-extra">Phụ phí</Label>
              <Input
                id="fee-extra"
                type="number"
                min="0"
                value={formData.feeExtra}
                onChange={(e) => setField('feeExtra', e.target.value)}
              />
            </div>
          </div>

          <p className="mt-4 flex items-baseline justify-between border-t border-[var(--rule)] pt-3 text-sm">
            <span className="text-[var(--graphite)]">Tổng phí dự kiến</span>
            <span data-numeric className="font-bold text-[var(--ink)]">
              {formatVnd(totalFeePreview)}
            </span>
          </p>

          <div className="mt-4 space-y-1.5">
            <Label htmlFor="order-description">Mô tả hàng hoá</Label>
            <Textarea
              id="order-description"
              value={formData.description}
              onChange={(e) => setField('description', e.target.value)}
              rows={2}
            />
          </div>
        </ModalSection>

        <ModalSection title="Thanh toán và trạng thái">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="payment-method">Hình thức thanh toán</Label>
              <Select
                value={formData.paymentMethod}
                onValueChange={(val) => setField('paymentMethod', val)}
              >
                <SelectTrigger id="payment-method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="COD">Thu hộ khi giao</SelectItem>
                  <SelectItem value="BANK_TRANSFER">Chuyển khoản</SelectItem>
                  <SelectItem value="BALANCE">Ví nội bộ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="payment-status">Trạng thái thanh toán</Label>
              <Select
                value={formData.paymentStatus}
                onValueChange={(val) => setField('paymentStatus', val)}
              >
                <SelectTrigger id="payment-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UNPAID">Chưa thanh toán</SelectItem>
                  <SelectItem value="PAID">Đã thanh toán</SelectItem>
                  <SelectItem value="REFUNDED">Đã hoàn tiền</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {editing && (
              <div className="space-y-1.5">
                <Label htmlFor="order-status">Trạng thái đơn</Label>
                <Select
                  value={formData.status}
                  onValueChange={(val) => setField('status', val)}
                >
                  <SelectTrigger id="order-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ORDER_STATUSES.map((key) => (
                      <SelectItem key={key} value={key}>
                        {orderStatusLabels[key]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="mt-4 space-y-1.5">
            <Label htmlFor="order-note">Ghi chú đơn hàng</Label>
            <Textarea
              id="order-note"
              value={formData.note}
              onChange={(e) => setField('note', e.target.value)}
              rows={2}
            />
          </div>
        </ModalSection>
      </form>
    </Modal>
  );
}
