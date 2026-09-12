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
import {
  customersService,
  type Customer,
  type CustomerBankInfo,
} from '@/services/customers.service';
import { useExchangeRate } from '@/hooks/use-exchange-rate';
import { cnyToVnd, formatVnd } from '@/lib/currency';
import { GENDERS, genderLabels } from '@/lib/gender';
import { apiErrorMessage } from '@/lib/api-error';
import { icon } from '@/lib/icon';

const emptyBankInfo = (): CustomerBankInfo => ({
  bankName: '',
  accountNumber: '',
  accountHolder: '',
});

const emptyForm = {
  username: '',
  fullName: '',
  phone: '',
  email: '',
  address: '',
  dateOfBirth: '',
  gender: '' as '' | 'MALE' | 'FEMALE' | 'OTHER',
  shippingAddress: '',
  bankInfo: emptyBankInfo(),
  balance: '0',
  note: '',
  status: 'ACTIVE',
};

type CustomerFormModalProps = {
  open: boolean;
  onClose: () => void;
  /** Customers register themselves, so this form only ever edits. */
  editing: Customer | null;
  onSaved: () => void;
};

export function CustomerFormModal({
  open,
  onClose,
  editing,
  onSaved,
}: CustomerFormModalProps) {
  const { vndPerCny } = useExchangeRate();
  const [formData, setFormData] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open || !editing) return;
    const bank = editing.bankInfo ?? emptyBankInfo();
    setFormData({
      username: editing.username,
      fullName: editing.fullName,
      phone: editing.phone,
      email: editing.email || '',
      address: editing.address || '',
      dateOfBirth: editing.dateOfBirth
        ? new Date(editing.dateOfBirth).toISOString().slice(0, 10)
        : '',
      gender: editing.gender || '',
      shippingAddress: editing.shippingAddress || '',
      bankInfo: {
        bankName: bank.bankName || '',
        accountNumber: bank.accountNumber || '',
        accountHolder: bank.accountHolder || '',
      },
      balance: String(editing.balance),
      note: editing.note || '',
      status: editing.status,
    });
  }, [open, editing]);

  const setField = (field: keyof typeof emptyForm, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const setBankField = (field: keyof CustomerBankInfo, value: string) =>
    setFormData((prev) => ({ ...prev, bankInfo: { ...prev.bankInfo, [field]: value } }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username.trim() || !formData.fullName.trim() || !formData.phone.trim()) {
      toast.error('Vui lòng điền đầy đủ username, họ tên và số điện thoại');
      return;
    }

    const hasBankInfo =
      formData.bankInfo.bankName.trim() ||
      formData.bankInfo.accountNumber.trim() ||
      formData.bankInfo.accountHolder.trim();

    const payload = {
      fullName: formData.fullName.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim() || undefined,
      address: formData.address.trim() || undefined,
      dateOfBirth: formData.dateOfBirth || undefined,
      gender: formData.gender || undefined,
      shippingAddress: formData.shippingAddress.trim() || undefined,
      bankInfo: hasBankInfo
        ? {
            bankName: formData.bankInfo.bankName.trim(),
            accountNumber: formData.bankInfo.accountNumber.trim(),
            accountHolder: formData.bankInfo.accountHolder.trim(),
          }
        : undefined,
      balance: Number(formData.balance) || 0,
      note: formData.note.trim() || undefined,
      status: formData.status,
    };

    try {
      setSubmitting(true);
      if (!editing) return;
      await customersService.update(editing.id, payload);
      toast.success('Cập nhật khách hàng thành công');
      onClose();
      onSaved();
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Không thể lưu khách hàng'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Cập nhật khách hàng"
      size="lg"
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
            Huỷ
          </Button>
          <Button type="submit" form="customer-form" disabled={submitting}>
            {submitting ? (
              <Loader2 {...icon('inline')} aria-hidden className="animate-spin" />
            ) : (
              'Lưu thông tin'
            )}
          </Button>
        </>
      }
    >
      <form id="customer-form" onSubmit={handleSubmit}>
        <ModalSection title="Danh tính">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="username">Tên đăng nhập</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setField('username', e.target.value)}
                disabled
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fullName">
                Họ và tên <RequiredMark />
              </Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setField('fullName', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="dateOfBirth">Ngày sinh</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setField('dateOfBirth', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="gender">Giới tính</Label>
              <Select
                value={formData.gender || 'none'}
                onValueChange={(val) => setField('gender', val === 'none' ? '' : val)}
              >
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Chọn giới tính" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Chưa chọn</SelectItem>
                  {GENDERS.map((g) => (
                    <SelectItem key={g} value={g}>
                      {genderLabels[g]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </ModalSection>

        <ModalSection title="Liên hệ">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="phone">
                Số điện thoại <RequiredMark />
              </Label>
              <Input
                id="phone"
                inputMode="tel"
                value={formData.phone}
                onChange={(e) => setField('phone', e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setField('email', e.target.value)}
              />
            </div>
          </div>

          <div className="mt-4 space-y-1.5">
            <Label htmlFor="address">Địa chỉ liên hệ</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setField('address', e.target.value)}
            />
          </div>

          <div className="mt-4 space-y-1.5">
            <Label htmlFor="shippingAddress">Địa chỉ nhận hàng</Label>
            <Input
              id="shippingAddress"
              value={formData.shippingAddress}
              onChange={(e) => setField('shippingAddress', e.target.value)}
            />
          </div>
        </ModalSection>

        <ModalSection title="Ngân hàng">
          <div className="space-y-1.5">
            <Label htmlFor="bankName">Tên ngân hàng</Label>
            <Input
              id="bankName"
              value={formData.bankInfo.bankName}
              onChange={(e) => setBankField('bankName', e.target.value)}
              placeholder="Ví dụ Vietcombank"
            />
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="accountNumber">Số tài khoản</Label>
              <Input
                id="accountNumber"
                value={formData.bankInfo.accountNumber}
                onChange={(e) => setBankField('accountNumber', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="accountHolder">Chủ tài khoản</Label>
              <Input
                id="accountHolder"
                value={formData.bankInfo.accountHolder}
                onChange={(e) => setBankField('accountHolder', e.target.value)}
              />
            </div>
          </div>
        </ModalSection>

        <ModalSection title="Ví và trạng thái">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="balance">Số dư ví (¥)</Label>
              <Input
                id="balance"
                type="number"
                min="0"
                step="0.01"
                value={formData.balance}
                onChange={(e) => setField('balance', e.target.value)}
              />
              {formData.balance && Number(formData.balance) > 0 && (
                <p data-numeric className="text-xs text-[var(--graphite)]">
                  ≈ {formatVnd(cnyToVnd(formData.balance, vndPerCny))}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="status">Trạng thái</Label>
              <Select value={formData.status} onValueChange={(val) => setField('status', val)}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                  <SelectItem value="INACTIVE">Ngưng hoạt động</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 space-y-1.5">
            <Label htmlFor="note">Ghi chú nội bộ</Label>
            <Textarea
              id="note"
              value={formData.note}
              onChange={(e) => setField('note', e.target.value)}
              rows={3}
            />
          </div>
        </ModalSection>
      </form>
    </Modal>
  );
}
