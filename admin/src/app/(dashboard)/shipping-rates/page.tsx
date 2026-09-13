'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, Plus, Truck } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import { RequiredMark } from '@/components/ui/required-mark';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingState } from '@/components/ui/loading-state';
import { RowActions } from '@/components/ui/row-actions';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PageHeader } from '@/components/layout/PageHeader';
import { useDeleteConfirm } from '@/hooks/use-delete-confirm';
import api from '@/lib/api';
import { apiErrorMessage } from '@/lib/api-error';
import { formatVnd } from '@/lib/currency';
import { icon } from '@/lib/icon';

interface ShippingRate {
  id: string;
  method: string;
  name: string;
  pricePerKgVnd: number | string;
  minChargeVnd: number | string;
  estimatedDays?: string | null;
  note?: string | null;
  isActive: boolean;
  sortOrder: number;
}

const emptyForm = {
  method: '',
  name: '',
  pricePerKgVnd: '',
  minChargeVnd: '0',
  estimatedDays: '',
  note: '',
  isActive: 'true',
  sortOrder: '0',
};

export default function ShippingRatesPage() {
  const [rates, setRates] = useState<ShippingRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<ShippingRate | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchRates = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/shipping-rates/all');
      setRates(res.data);
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Không thể tải bảng giá vận chuyển'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchRates();
  }, [fetchRates]);

  const deletion = useDeleteConfirm((id) => api.delete(`/shipping-rates/${id}`), {
    successMessage: 'Đã xoá tuyến vận chuyển',
    errorMessage: 'Không thể xoá tuyến vận chuyển',
    onDone: () => void fetchRates(),
  });

  const openCreate = () => {
    setEditing(null);
    setFormData(emptyForm);
    setIsOpen(true);
  };

  const openEdit = (rate: ShippingRate) => {
    setEditing(rate);
    setFormData({
      method: rate.method,
      name: rate.name,
      pricePerKgVnd: String(rate.pricePerKgVnd),
      minChargeVnd: String(rate.minChargeVnd),
      estimatedDays: rate.estimatedDays ?? '',
      note: rate.note ?? '',
      isActive: rate.isActive ? 'true' : 'false',
      sortOrder: String(rate.sortOrder),
    });
    setIsOpen(true);
  };

  const setField = (field: keyof typeof emptyForm, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.method.trim() || !formData.name.trim() || !formData.pricePerKgVnd) {
      toast.error('Vui lòng điền mã tuyến, tên tuyến và đơn giá');
      return;
    }

    const payload = {
      method: formData.method.trim(),
      name: formData.name.trim(),
      pricePerKgVnd: Number(formData.pricePerKgVnd),
      minChargeVnd: Number(formData.minChargeVnd) || 0,
      estimatedDays: formData.estimatedDays.trim() || undefined,
      note: formData.note.trim() || undefined,
      isActive: formData.isActive === 'true',
      sortOrder: Number(formData.sortOrder) || 0,
    };

    try {
      setSubmitting(true);
      if (editing) {
        await api.patch(`/shipping-rates/${editing.id}`, payload);
        toast.success('Cập nhật tuyến vận chuyển thành công');
      } else {
        await api.post('/shipping-rates', payload);
        toast.success('Tạo tuyến vận chuyển thành công');
      }
      setIsOpen(false);
      void fetchRates();
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Không thể lưu tuyến vận chuyển'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Bảng giá vận chuyển"
        description="Đơn giá theo kilogram cho từng tuyến. Khách dùng bảng này để ước tính phí trước khi đặt."
        action={
          <Button onClick={openCreate}>
            <Plus {...icon('inline')} aria-hidden />
            Thêm tuyến
          </Button>
        }
      />

      {loading ? (
        <LoadingState label="Đang tải bảng giá" className="py-20" />
      ) : rates.length === 0 ? (
        <EmptyState
          icon={Truck}
          title="Chưa có tuyến vận chuyển nào"
          hint="Thêm tuyến để khách thấy đơn giá khi đặt hàng."
        />
      ) : (
        <div className="panel overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="min-w-[760px]">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Mã tuyến</TableHead>
                  <TableHead>Tên tuyến</TableHead>
                  <TableHead className="text-right">Đơn giá mỗi kg</TableHead>
                  <TableHead className="text-right">Phí tối thiểu</TableHead>
                  <TableHead>Thời gian</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rates.map((rate) => (
                  <TableRow key={rate.id}>
                    <TableCell className="font-mono text-xs font-semibold text-[var(--ink)]">
                      {rate.method}
                    </TableCell>
                    <TableCell className="text-sm font-medium text-[var(--ink)]">
                      {rate.name}
                    </TableCell>
                    <TableCell data-numeric className="text-right text-sm font-semibold">
                      {formatVnd(rate.pricePerKgVnd)}
                    </TableCell>
                    <TableCell data-numeric className="text-right text-sm text-[var(--graphite)]">
                      {formatVnd(rate.minChargeVnd)}
                    </TableCell>
                    <TableCell className="text-sm text-[var(--graphite)]">
                      {rate.estimatedDays ?? '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={rate.isActive ? 'success' : 'secondary'}>
                        {rate.isActive ? 'Đang bán' : 'Tạm ẩn'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <RowActions
                        label={`tuyến ${rate.name}`}
                        onEdit={() => openEdit(rate)}
                        onDelete={() => deletion.arm(rate.id)}
                        confirming={deletion.confirmingId === rate.id}
                        deleting={deletion.deletingId === rate.id}
                        onConfirmDelete={() => deletion.confirm(rate.id)}
                        onCancelDelete={deletion.cancel}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      <Modal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title={editing ? `Sửa tuyến ${editing.name}` : 'Thêm tuyến vận chuyển'}
        size="md"
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={submitting}
            >
              Huỷ
            </Button>
            <Button type="submit" form="rate-form" disabled={submitting}>
              {submitting ? (
                <Loader2 {...icon('inline')} aria-hidden className="animate-spin" />
              ) : (
                'Lưu tuyến'
              )}
            </Button>
          </>
        }
      >
        <form id="rate-form" onSubmit={handleSubmit} className="space-y-4 px-5 py-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="rate-method">
                Mã tuyến <RequiredMark />
              </Label>
              <Input
                id="rate-method"
                value={formData.method}
                onChange={(e) => setField('method', e.target.value)}
                placeholder="standard"
                disabled={!!editing}
                required
              />
              <p className="text-xs text-[var(--graphite)]">
                Phải khớp giá trị gửi lên khi khách đặt hàng.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rate-name">
                Tên hiển thị <RequiredMark />
              </Label>
              <Input
                id="rate-name"
                value={formData.name}
                onChange={(e) => setField('name', e.target.value)}
                placeholder="Line Thường"
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="rate-price">
                Đơn giá mỗi kg (đồng) <RequiredMark />
              </Label>
              <Input
                id="rate-price"
                type="number"
                min={0}
                value={formData.pricePerKgVnd}
                onChange={(e) => setField('pricePerKgVnd', e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rate-min">Phí tối thiểu (đồng)</Label>
              <Input
                id="rate-min"
                type="number"
                min={0}
                value={formData.minChargeVnd}
                onChange={(e) => setField('minChargeVnd', e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="rate-days">Thời gian dự kiến</Label>
              <Input
                id="rate-days"
                value={formData.estimatedDays}
                onChange={(e) => setField('estimatedDays', e.target.value)}
                placeholder="5 đến 7 ngày"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rate-active">Trạng thái</Label>
              <Select
                value={formData.isActive}
                onValueChange={(v) => setField('isActive', v)}
              >
                <SelectTrigger id="rate-active">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Đang bán</SelectItem>
                  <SelectItem value="false">Tạm ẩn</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="rate-note">Ghi chú</Label>
            <Input
              id="rate-note"
              value={formData.note}
              onChange={(e) => setField('note', e.target.value)}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
