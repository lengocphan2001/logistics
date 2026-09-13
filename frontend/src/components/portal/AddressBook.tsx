'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Plus, Star, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EmptyState } from '@/components/ui/empty-state';
import { RequiredMark } from '@/components/ui/required-mark';
import { savedAddressesKey } from '@/components/shop/SavedAddressPicker';
import {
  addressesService,
  type CustomerAddress,
  type UpsertAddressPayload,
} from '@/services/addresses.service';
import { apiErrorMessage } from '@/lib/api-error';
import { icon } from '@/lib/icon';
import { cn } from '@/lib/utils';

const emptyForm: UpsertAddressPayload = {
  label: '',
  receiverName: '',
  receiverPhone: '',
  receiverAddress: '',
  receiverProvince: '',
  receiverDistrict: '',
};

/** Saved delivery addresses, so checkout is not a retyping exercise. */
export function AddressBook() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<UpsertAddressPayload>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const { data: addresses = [], isLoading } = useQuery({
    queryKey: savedAddressesKey,
    queryFn: async () => (await addressesService.list()).data,
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: savedAddressesKey });

  const save = useMutation({
    mutationFn: (payload: UpsertAddressPayload) =>
      editingId
        ? addressesService.update(editingId, payload)
        : addressesService.create(payload),
    onSuccess: () => {
      toast.success(editingId ? 'Đã cập nhật địa chỉ' : 'Đã lưu địa chỉ');
      setForm(emptyForm);
      setEditingId(null);
      setOpen(false);
      void refresh();
    },
    onError: (err) => toast.error(apiErrorMessage(err, 'Không thể lưu địa chỉ')),
  });

  const remove = useMutation({
    mutationFn: (id: string) => addressesService.remove(id),
    onSuccess: () => {
      toast.success('Đã xoá địa chỉ');
      void refresh();
    },
    onError: (err) => toast.error(apiErrorMessage(err, 'Không thể xoá địa chỉ')),
  });

  const setDefault = useMutation({
    mutationFn: (address: CustomerAddress) =>
      addressesService.update(address.id, {
        label: address.label ?? '',
        receiverName: address.receiverName,
        receiverPhone: address.receiverPhone,
        receiverAddress: address.receiverAddress,
        receiverProvince: address.receiverProvince ?? '',
        receiverDistrict: address.receiverDistrict ?? '',
        isDefault: true,
      }),
    onSuccess: () => {
      toast.success('Đã đặt làm địa chỉ mặc định');
      void refresh();
    },
    onError: (err) => toast.error(apiErrorMessage(err, 'Không thể đặt mặc định')),
  });

  const startEdit = (address: CustomerAddress) => {
    setEditingId(address.id);
    setForm({
      label: address.label ?? '',
      receiverName: address.receiverName,
      receiverPhone: address.receiverPhone,
      receiverAddress: address.receiverAddress,
      receiverProvince: address.receiverProvince ?? '',
      receiverDistrict: address.receiverDistrict ?? '',
    });
    setOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.receiverName.trim() || !form.receiverPhone.trim() || !form.receiverAddress.trim()) {
      toast.error('Vui lòng điền họ tên, số điện thoại và địa chỉ');
      return;
    }
    save.mutate(form);
  };

  const setField = (field: keyof UpsertAddressPayload, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <section className="panel p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-heading text-base font-semibold text-[var(--ink)]">
          Sổ địa chỉ nhận hàng
        </h2>
        {!open && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setEditingId(null);
              setForm(emptyForm);
              setOpen(true);
            }}
          >
            <Plus {...icon('inline')} aria-hidden />
            Thêm địa chỉ
          </Button>
        )}
      </div>

      {isLoading ? (
        <p className="mt-4 text-sm text-[var(--graphite)]">Đang tải</p>
      ) : addresses.length === 0 && !open ? (
        <EmptyState
          title="Chưa có địa chỉ nào"
          hint="Lưu địa chỉ để lần đặt hàng sau không phải nhập lại."
          className="mt-4 border-0 py-10"
        />
      ) : (
        <ul className="mt-4 space-y-3">
          {addresses.map((address) => (
            <li
              key={address.id}
              className={cn(
                'border p-4',
                address.isDefault
                  ? 'border-[var(--manifest-navy)]'
                  : 'border-[var(--rule)]',
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--ink)]">
                    {address.label || address.receiverName}
                    {address.isDefault && (
                      <span className="ml-2 text-xs font-medium text-[var(--manifest-navy)]">
                        Mặc định
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-[var(--graphite)]">
                    {address.receiverName} — {address.receiverPhone}
                  </p>
                  <p data-prose className="text-sm">
                    {[address.receiverAddress, address.receiverDistrict, address.receiverProvince]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  {!address.isDefault && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Đặt làm mặc định"
                      onClick={() => setDefault.mutate(address)}
                    >
                      <Star {...icon('inline')} aria-hidden />
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => startEdit(address)}
                  >
                    Sửa
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Xoá địa chỉ"
                    onClick={() => remove.mutate(address.id)}
                    className="hover:bg-[var(--red-wash)] hover:text-[var(--seal-red)]"
                  >
                    <Trash2 {...icon('inline')} aria-hidden />
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {open && (
        <form onSubmit={handleSubmit} className="mt-4 border-t border-[var(--rule)] pt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="address-label">Tên gợi nhớ</Label>
              <Input
                id="address-label"
                value={form.label ?? ''}
                onChange={(e) => setField('label', e.target.value)}
                placeholder="Nhà riêng, văn phòng"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="address-name">
                Họ tên người nhận <RequiredMark />
              </Label>
              <Input
                id="address-name"
                value={form.receiverName}
                onChange={(e) => setField('receiverName', e.target.value)}
              />
            </div>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="address-phone">
                Số điện thoại <RequiredMark />
              </Label>
              <Input
                id="address-phone"
                inputMode="tel"
                value={form.receiverPhone}
                onChange={(e) => setField('receiverPhone', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="address-province">Tỉnh hoặc thành phố</Label>
              <Input
                id="address-province"
                value={form.receiverProvince ?? ''}
                onChange={(e) => setField('receiverProvince', e.target.value)}
              />
            </div>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="address-district">Quận hoặc huyện</Label>
              <Input
                id="address-district"
                value={form.receiverDistrict ?? ''}
                onChange={(e) => setField('receiverDistrict', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="address-street">
                Địa chỉ chi tiết <RequiredMark />
              </Label>
              <Input
                id="address-street"
                value={form.receiverAddress}
                onChange={(e) => setField('receiverAddress', e.target.value)}
              />
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? (
                <Loader2 {...icon('inline')} aria-hidden className="animate-spin" />
              ) : editingId ? (
                'Cập nhật'
              ) : (
                'Lưu địa chỉ'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false);
                setEditingId(null);
                setForm(emptyForm);
              }}
            >
              Huỷ
            </Button>
          </div>
        </form>
      )}
    </section>
  );
}
