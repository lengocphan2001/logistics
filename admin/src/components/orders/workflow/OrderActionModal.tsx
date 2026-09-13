'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Modal, ModalSection } from '@/components/ui/modal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { apiErrorMessage } from '@/lib/api-error';
import { formatCny, formatVnd } from '@/lib/currency';
import { icon } from '@/lib/icon';
import { actionLabel, type OrderActionKey } from '@/lib/order-workflow';
import { ordersService, type OrderSummary } from '@/services/orders.service';

export type WarehouseOption = {
  id: string;
  name: string;
  code: string;
  country?: 'CN' | 'VN';
};

type OrderActionModalProps = {
  action: OrderActionKey | null;
  summary: OrderSummary;
  warehouses: WarehouseOption[];
  onClose: () => void;
  onDone: (summary: OrderSummary) => void;
};

type FormState = {
  itemsTotalCny: string;
  feeTransfer: string;
  feeInsurance: string;
  feeExtra: string;
  expiresInHours: string;
  purchaseOrderCode: string;
  cnWarehouseId: string;
  warehouseId: string;
  weight: string;
  length: string;
  width: string;
  height: string;
  sourceTrackingCode: string;
  estimatedDelivery: string;
  amount: string;
  reason: string;
  refund: 'yes' | 'no';
  note: string;
};

const EMPTY: FormState = {
  itemsTotalCny: '',
  feeTransfer: '',
  feeInsurance: '',
  feeExtra: '',
  expiresInHours: '48',
  purchaseOrderCode: '',
  cnWarehouseId: '',
  warehouseId: '',
  weight: '',
  length: '',
  width: '',
  height: '',
  sourceTrackingCode: '',
  estimatedDelivery: '',
  amount: '',
  reason: '',
  refund: 'yes',
  note: '',
};

const num = (value: string) => (value.trim() === '' ? undefined : Number(value));

/**
 * One sheet, one step. Each step asks only for what that step needs: a quote
 * asks for money, a warehouse receipt asks for weight, a cancellation asks for
 * a reason. The resulting status is decided by the server.
 */
export function OrderActionModal({
  action,
  summary,
  warehouses,
  onClose,
  onDone,
}: OrderActionModalProps) {
  const { order, amounts } = summary;
  const [form, setForm] = useState<FormState>(EMPTY);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!action) return;
    setForm({
      ...EMPTY,
      itemsTotalCny: order.itemsTotalCny ? String(Number(order.itemsTotalCny)) : '',
      feeTransfer: String(Number(order.feeTransfer ?? 0)),
      feeInsurance: String(Number(order.feeInsurance ?? 0)),
      feeExtra: String(Number(order.feeExtra ?? 0)),
      purchaseOrderCode: order.purchaseOrderCode ?? order.sourceOrderCode ?? '',
      cnWarehouseId: order.cnWarehouseId ?? '',
      warehouseId: order.warehouseId ?? '',
      weight: order.weight ? String(Number(order.weight)) : '',
      sourceTrackingCode: order.sourceTrackingCode ?? '',
      amount: action === 'settle' ? String(amounts.dueCny) : '',
    });
  }, [action, order, amounts.dueCny]);

  if (!action) return null;

  const setField = (key: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const cnWarehouses = warehouses.filter((w) => w.country !== 'VN');
  const vnWarehouses = warehouses.filter((w) => w.country !== 'CN');

  const submit = async () => {
    setSubmitting(true);
    try {
      let res;
      switch (action) {
        case 'quote':
          res = await ordersService.quote(order.id, {
            itemsTotalCny: num(form.itemsTotalCny),
            feeTransfer: num(form.feeTransfer),
            feeInsurance: num(form.feeInsurance),
            feeExtra: num(form.feeExtra),
            expiresInHours: num(form.expiresInHours),
            note: form.note || undefined,
          });
          break;
        case 'purchase':
          res = await ordersService.purchase(order.id, {
            purchaseOrderCode: form.purchaseOrderCode || undefined,
            note: form.note || undefined,
          });
          break;
        case 'cnReceive':
          res = await ordersService.cnReceive(order.id, {
            cnWarehouseId: form.cnWarehouseId || undefined,
            weight: num(form.weight),
            length: num(form.length),
            width: num(form.width),
            height: num(form.height),
            sourceTrackingCode: form.sourceTrackingCode || undefined,
            note: form.note || undefined,
          });
          break;
        case 'depart':
          res = await ordersService.depart(order.id, {
            estimatedDelivery: form.estimatedDelivery || undefined,
            note: form.note || undefined,
          });
          break;
        case 'vnReceive':
          res = await ordersService.vnReceive(order.id, {
            warehouseId: form.warehouseId || undefined,
            note: form.note || undefined,
          });
          break;
        case 'settle':
          res = await ordersService.settle(order.id, {
            amount: num(form.amount),
            note: form.note || undefined,
          });
          break;
        case 'requestDelivery':
          res = await ordersService.requestDelivery(order.id, {
            note: form.note || undefined,
          });
          break;
        case 'deliver':
          res = await ordersService.deliver(order.id, {
            note: form.note || undefined,
          });
          break;
        case 'cancel':
          if (!form.reason.trim()) {
            toast.error('Vui lòng nhập lý do huỷ');
            setSubmitting(false);
            return;
          }
          res = await ordersService.cancel(order.id, {
            reason: form.reason.trim(),
            refund: form.refund === 'yes',
          });
          break;
      }

      toast.success('Đã cập nhật đơn hàng');
      onDone(res.data);
      onClose();
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Không thực hiện được bước này'));
    } finally {
      setSubmitting(false);
    }
  };

  const title = actionLabel(action, summary);

  return (
    <Modal
      open
      onClose={onClose}
      title={`${title} — ${order.billOfLadingCode}`}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Huỷ
          </Button>
          <Button
            variant={action === 'cancel' ? 'destructive' : 'default'}
            onClick={submit}
            disabled={submitting}
          >
            {submitting ? (
              <Loader2 {...icon('inline')} aria-hidden className="animate-spin" />
            ) : (
              title
            )}
          </Button>
        </>
      }
    >
      {action === 'quote' && (
        <ModalSection title="Số tiền báo cho khách">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {order.type !== 'CONSIGNMENT' && (
              <div className="space-y-1.5">
                <Label htmlFor="quote-goods">Tiền hàng (¥)</Label>
                <Input
                  id="quote-goods"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.itemsTotalCny}
                  onChange={(e) => setField('itemsTotalCny', e.target.value)}
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="quote-transfer">Phí vận chuyển (VND)</Label>
              <Input
                id="quote-transfer"
                type="number"
                min="0"
                value={form.feeTransfer}
                onChange={(e) => setField('feeTransfer', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="quote-insurance">Phí bảo hiểm (VND)</Label>
              <Input
                id="quote-insurance"
                type="number"
                min="0"
                value={form.feeInsurance}
                onChange={(e) => setField('feeInsurance', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="quote-extra">Phụ phí (VND)</Label>
              <Input
                id="quote-extra"
                type="number"
                min="0"
                value={form.feeExtra}
                onChange={(e) => setField('feeExtra', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="quote-expiry">Hiệu lực báo giá (giờ)</Label>
              <Input
                id="quote-expiry"
                type="number"
                min="1"
                value={form.expiresInHours}
                onChange={(e) => setField('expiresInHours', e.target.value)}
              />
            </div>
          </div>
          <p data-prose className="mt-3 text-sm">
            {order.type === 'CONSIGNMENT'
              ? 'Khách duyệt cước xong hàng mới được xuất khỏi Trung Quốc. Cước thu khi hàng về kho Việt Nam.'
              : 'Khách duyệt báo giá thì tiền hàng được trừ khỏi ví ngay. Quá hạn trên, báo giá không duyệt được nữa.'}
          </p>
        </ModalSection>
      )}

      {action === 'purchase' && (
        <ModalSection
          title={
            order.type === 'PROXY_PAYMENT'
              ? 'Xác nhận đã trả tiền cho shop'
              : 'Xác nhận đã đặt mua trên sàn'
          }
        >
          <div className="space-y-1.5">
            <Label htmlFor="purchase-code">Mã đơn trên sàn</Label>
            <Input
              id="purchase-code"
              value={form.purchaseOrderCode}
              onChange={(e) => setField('purchaseOrderCode', e.target.value)}
              placeholder="Mã đơn nhận được sau khi thanh toán"
            />
          </div>
          <p data-prose className="mt-3 text-sm">
            Nếu có dòng hàng hết hoặc đổi giá, sửa ở bảng sản phẩm trước khi xác
            nhận. Phần tiền thừa sẽ tự hoàn về ví khách.
          </p>
        </ModalSection>
      )}

      {action === 'cnReceive' && (
        <ModalSection title="Kho Trung Quốc nhận hàng">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="cn-warehouse">Kho tiếp nhận</Label>
              <Select
                value={form.cnWarehouseId}
                onValueChange={(v) => setField('cnWarehouseId', v)}
              >
                <SelectTrigger id="cn-warehouse">
                  <SelectValue placeholder="Chọn kho Trung Quốc" />
                </SelectTrigger>
                <SelectContent>
                  {cnWarehouses.map((w) => (
                    <SelectItem key={w.id} value={w.id}>
                      {w.name} ({w.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cn-weight">Khối lượng (kg)</Label>
              <Input
                id="cn-weight"
                type="number"
                min="0"
                step="0.01"
                value={form.weight}
                onChange={(e) => setField('weight', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cn-tracking">Mã vận đơn nội địa</Label>
              <Input
                id="cn-tracking"
                value={form.sourceTrackingCode}
                onChange={(e) => setField('sourceTrackingCode', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cn-length">Dài (cm)</Label>
              <Input
                id="cn-length"
                type="number"
                min="0"
                value={form.length}
                onChange={(e) => setField('length', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cn-width">Rộng (cm)</Label>
              <Input
                id="cn-width"
                type="number"
                min="0"
                value={form.width}
                onChange={(e) => setField('width', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cn-height">Cao (cm)</Label>
              <Input
                id="cn-height"
                type="number"
                min="0"
                value={form.height}
                onChange={(e) => setField('height', e.target.value)}
              />
            </div>
          </div>
        </ModalSection>
      )}

      {action === 'depart' && (
        <ModalSection title="Xuất hàng về Việt Nam">
          <div className="space-y-1.5 sm:max-w-xs">
            <Label htmlFor="depart-eta">Dự kiến giao</Label>
            <Input
              id="depart-eta"
              type="date"
              value={form.estimatedDelivery}
              onChange={(e) => setField('estimatedDelivery', e.target.value)}
            />
          </div>
        </ModalSection>
      )}

      {action === 'vnReceive' && (
        <ModalSection title="Kho Việt Nam nhận hàng">
          <div className="space-y-1.5 sm:max-w-sm">
            <Label htmlFor="vn-warehouse">Kho nhận</Label>
            <Select
              value={form.warehouseId}
              onValueChange={(v) => setField('warehouseId', v)}
            >
              <SelectTrigger id="vn-warehouse">
                <SelectValue placeholder="Chọn kho Việt Nam" />
              </SelectTrigger>
              <SelectContent>
                {vnWarehouses.map((w) => (
                  <SelectItem key={w.id} value={w.id}>
                    {w.name} ({w.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </ModalSection>
      )}

      {action === 'settle' && (
        <ModalSection title="Thu tiền từ ví khách">
          <div className="space-y-1.5 sm:max-w-xs">
            <Label htmlFor="settle-amount">Số tiền (¥)</Label>
            <Input
              id="settle-amount"
              type="number"
              min="0.01"
              step="0.01"
              value={form.amount}
              onChange={(e) => setField('amount', e.target.value)}
            />
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:max-w-sm">
            <dt className="text-[var(--graphite)]">Còn phải thu</dt>
            <dd data-numeric className="text-right font-semibold text-[var(--ink)]">
              {formatCny(amounts.dueCny)}
            </dd>
            <dt className="text-[var(--graphite)]">Số dư ví khách</dt>
            <dd data-numeric className="text-right">
              {formatCny(Number(order.customer?.balance ?? 0))}
            </dd>
          </dl>
        </ModalSection>
      )}

      {action === 'cancel' && (
        <ModalSection title="Huỷ đơn hàng">
          <div className="space-y-1.5">
            <Label htmlFor="cancel-reason">Lý do huỷ</Label>
            <Textarea
              id="cancel-reason"
              rows={3}
              value={form.reason}
              onChange={(e) => setField('reason', e.target.value)}
              autoFocus
            />
          </div>
          <div className="mt-4 space-y-1.5 sm:max-w-xs">
            <Label htmlFor="cancel-refund">Hoàn tiền đã thu</Label>
            <Select
              value={form.refund}
              onValueChange={(v) => setField('refund', v)}
            >
              <SelectTrigger id="cancel-refund">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">
                  Hoàn {formatCny(amounts.paidCny)} về ví khách
                </SelectItem>
                <SelectItem value="no">Không hoàn</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </ModalSection>
      )}

      {(action === 'requestDelivery' || action === 'deliver') && (
        <ModalSection title="Giao hàng">
          <p data-prose className="text-sm">
            {action === 'deliver'
              ? `Đơn đã thu đủ tiền. Tổng phí ${formatVnd(amounts.feesVnd)}.`
              : 'Tạo yêu cầu giao để bộ phận giao nhận nhận đơn.'}
          </p>
        </ModalSection>
      )}

      <ModalSection title="Ghi chú nội bộ">
        <Textarea
          rows={2}
          value={form.note}
          onChange={(e) => setField('note', e.target.value)}
          placeholder="Ghi vào lịch sử đơn hàng"
        />
      </ModalSection>
    </Modal>
  );
}
