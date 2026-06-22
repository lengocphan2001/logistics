'use client';

import { useEffect, useState } from 'react';
import { Loader2, User } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  profileService,
  type CustomerProfile,
  type CustomerBankInfo,
} from '@/services/profile.service';
import { useAuthStore } from '@/stores/auth.store';
import { GENDERS, genderLabels } from '@/lib/gender';

const emptyBank = (): CustomerBankInfo => ({
  bankName: '',
  accountNumber: '',
  accountHolder: '',
});

export default function ProfilePage() {
  const updateUser = useAuthStore((s) => s.updateUser);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    dateOfBirth: '',
    gender: '' as '' | 'MALE' | 'FEMALE' | 'OTHER',
    shippingAddress: '',
    bankInfo: emptyBank(),
  });

  useEffect(() => {
    profileService
      .get()
      .then((res) => {
        const p = res.data;
        const bank = (p.bankInfo as CustomerBankInfo | null) ?? emptyBank();
        setForm({
          fullName: p.name || '',
          phone: p.phone || '',
          email: p.email || '',
          address: p.address || '',
          dateOfBirth: p.dateOfBirth
            ? new Date(p.dateOfBirth).toISOString().slice(0, 10)
            : '',
          gender: p.gender || '',
          shippingAddress: p.shippingAddress || '',
          bankInfo: {
            bankName: bank.bankName || '',
            accountNumber: bank.accountNumber || '',
            accountHolder: bank.accountHolder || '',
          },
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const hasBank =
      form.bankInfo.bankName.trim() ||
      form.bankInfo.accountNumber.trim() ||
      form.bankInfo.accountHolder.trim();

    try {
      setSubmitting(true);
      const res = await profileService.update({
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
        address: form.address.trim() || undefined,
        dateOfBirth: form.dateOfBirth || undefined,
        gender: form.gender || undefined,
        shippingAddress: form.shippingAddress.trim() || undefined,
        bankInfo: hasBank
          ? {
              bankName: form.bankInfo.bankName.trim(),
              accountNumber: form.bankInfo.accountNumber.trim(),
              accountHolder: form.bankInfo.accountHolder.trim(),
            }
          : undefined,
      });
      const p = res.data as CustomerProfile;
      updateUser({ name: p.name, email: p.email || undefined });
      toast.success('Đã cập nhật hồ sơ');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Cập nhật thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <User className="w-6 h-6 text-primary" />
          Hồ sơ cá nhân
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Cập nhật thông tin nhận hàng và tài khoản ngân hàng
        </p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Họ và tên</Label>
            <Input
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>Số điện thoại</Label>
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Email</Label>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Ngày sinh</Label>
            <Input
              type="date"
              value={form.dateOfBirth}
              onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Giới tính</Label>
            <Select
              value={form.gender || 'none'}
              onValueChange={(v) =>
                setForm({
                  ...form,
                  gender: v === 'none' ? '' : (v as typeof form.gender),
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn" />
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

        <div className="space-y-1.5">
          <Label>Địa chỉ liên hệ</Label>
          <Input
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Địa chỉ nhận hàng</Label>
          <Input
            value={form.shippingAddress}
            onChange={(e) => setForm({ ...form, shippingAddress: e.target.value })}
            placeholder="Địa chỉ giao hàng tại Việt Nam"
          />
        </div>

        <div className="rounded-lg border border-border p-4 space-y-3">
          <p className="text-sm font-semibold">Thông tin ngân hàng (rút tiền)</p>
          <div className="space-y-1.5">
            <Label>Tên ngân hàng</Label>
            <Input
              value={form.bankInfo.bankName}
              onChange={(e) =>
                setForm({ ...form, bankInfo: { ...form.bankInfo, bankName: e.target.value } })
              }
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Số tài khoản</Label>
              <Input
                value={form.bankInfo.accountNumber}
                onChange={(e) =>
                  setForm({
                    ...form,
                    bankInfo: { ...form.bankInfo, accountNumber: e.target.value },
                  })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Chủ tài khoản</Label>
              <Input
                value={form.bankInfo.accountHolder}
                onChange={(e) =>
                  setForm({
                    ...form,
                    bankInfo: { ...form.bankInfo, accountHolder: e.target.value },
                  })
                }
              />
            </div>
          </div>
        </div>

        <Button type="submit" size="lg" disabled={submitting}>
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Lưu thay đổi'}
        </Button>
      </form>
    </div>
  );
}
