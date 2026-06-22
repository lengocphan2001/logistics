'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  User,
  Mail,
  Phone,
  Wallet,
  Edit2,
  Trash2,
  Loader2,
  X,
  AtSign,
  MapPin,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { SearchInput } from '@/components/ui/input-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { customersService, type Customer, type CustomerBankInfo } from '@/services/customers.service';
import { useExchangeRate } from '@/hooks/use-exchange-rate';
import { formatCny, formatVnd, cnyToVnd } from '@/lib/currency';
import { GENDERS, genderLabels } from '@/lib/gender';

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

export default function CustomersPage() {
  const { vndPerCny } = useExchangeRate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [isOpen, setIsOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await customersService.getAll({
        limit: 100,
        search: searchQuery || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
      });
      setCustomers(res.data.data ?? res.data);
    } catch (err: any) {
      toast.error('Không thể tải danh sách khách hàng: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchCustomers, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, statusFilter]);

  const handleOpenEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    const bank = customer.bankInfo ?? emptyBankInfo();
    setFormData({
      username: customer.username,
      fullName: customer.fullName,
      phone: customer.phone,
      email: customer.email || '',
      address: customer.address || '',
      dateOfBirth: customer.dateOfBirth
        ? new Date(customer.dateOfBirth).toISOString().slice(0, 10)
        : '',
      gender: customer.gender || '',
      shippingAddress: customer.shippingAddress || '',
      bankInfo: {
        bankName: bank.bankName || '',
        accountNumber: bank.accountNumber || '',
        accountHolder: bank.accountHolder || '',
      },
      balance: String(customer.balance),
      note: customer.note || '',
      status: customer.status,
    });
    setIsOpen(true);
  };

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
      if (!editingCustomer) return;
      await customersService.update(editingCustomer.id, payload);
      toast.success('Cập nhật khách hàng thành công');
      setIsOpen(false);
      fetchCustomers();
    } catch (err: any) {
      toast.error('Lỗi: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await customersService.remove(id);
      toast.success('Xóa khách hàng thành công');
      setDeleteConfirmId(null);
      fetchCustomers();
    } catch (err: any) {
      toast.error('Lỗi khi xóa: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Users className="w-8 h-8 text-primary" />
            Quản lý Khách hàng
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Khách hàng đăng ký từ website. Admin chỉ được cập nhật thông tin, không thêm mới.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 bg-card/80 p-4 rounded-2xl border border-border/70 shadow-sm backdrop-blur-sm">
        <div className="flex-1 max-w-sm">
          <SearchInput
            placeholder="Tìm username, tên, SĐT, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-48 shrink-0">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả</SelectItem>
              <SelectItem value="ACTIVE">Hoạt động</SelectItem>
              <SelectItem value="INACTIVE">Ngưng hoạt động</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col justify-center items-center h-64 gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Đang tải dữ liệu khách hàng...</p>
        </div>
      ) : customers.length === 0 ? (
        <div className="flex flex-col justify-center items-center h-64 border border-dashed rounded-xl bg-card gap-3">
          <Users className="w-12 h-12 text-muted-foreground" />
          <p className="text-muted-foreground text-sm">Không tìm thấy khách hàng nào. Khách hàng sẽ xuất hiện sau khi đăng ký từ website.</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/40 border-b border-border text-foreground/65 text-xs font-semibold uppercase tracking-wider">
                  <th className="px-6 py-4">Khách hàng</th>
                  <th className="px-6 py-4">Liên hệ</th>
                  <th className="px-6 py-4">Số dư</th>
                  <th className="px-6 py-4">Đơn hàng</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-muted/10 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                          {customer.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{customer.fullName}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <AtSign className="w-3 h-3" /> {customer.username}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="flex items-center gap-1.5 text-foreground">
                          <Phone className="w-3.5 h-3.5 text-muted-foreground" /> {customer.phone}
                        </p>
                        {customer.email && (
                          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Mail className="w-3.5 h-3.5" /> {customer.email}
                          </p>
                        )}
                        {customer.address && (
                          <p className="flex items-center gap-1.5 text-xs text-muted-foreground line-clamp-1">
                            <MapPin className="w-3.5 h-3.5 shrink-0" /> {customer.address}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-400">
                          <Wallet className="w-4 h-4" />
                          {formatCny(customer.balance)}
                        </span>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          ≈ {formatVnd(cnyToVnd(customer.balance, vndPerCny))}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-foreground font-medium">
                        {customer._count?.orders ?? 0} đơn
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-semibold ${
                          customer.status === 'ACTIVE' ? 'text-emerald-700 dark:text-emerald-400' : 'text-muted-foreground'
                        }`}
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        {customer.status === 'ACTIVE' ? 'Hoạt động' : 'Ngưng HĐ'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/customers/${customer.id}`}
                          className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'h-8 text-xs')}
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEdit(customer)}
                          className="h-8 text-xs font-semibold flex items-center gap-1"
                        >
                          <Edit2 className="w-3.5 h-3.5" /> Sửa
                        </Button>
                        {deleteConfirmId === customer.id ? (
                          <div className="flex items-center gap-1.5">
                            <Button variant="destructive" size="sm" onClick={() => handleDelete(customer.id)} className="h-8 text-xs">
                              Có
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setDeleteConfirmId(null)} className="h-8 text-xs">
                              Hủy
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteConfirmId(customer.id)}
                            className="h-8 text-xs text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="bg-card w-full max-w-lg rounded-2xl border border-border shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center px-6 py-4 border-b border-border sticky top-0 bg-card z-10">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  {editingCustomer ? 'Cập nhật khách hàng' : 'Khách hàng'}
                </h2>
                <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder="khachhang001"
                      disabled={!!editingCustomer}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="fullName">Họ và tên</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="Nguyễn Văn A"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="phone">Số điện thoại</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="0901234567"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="email@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="address">Địa chỉ liên hệ</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Số nhà, phường, quận, thành phố"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="dateOfBirth">Ngày sinh</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="gender">Giới tính</Label>
                    <Select
                      value={formData.gender || 'none'}
                      onValueChange={(val) =>
                        setFormData({
                          ...formData,
                          gender: val === 'none' ? '' : (val as typeof formData.gender),
                        })
                      }
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

                <div className="space-y-1.5">
                  <Label htmlFor="shippingAddress">Địa chỉ nhận hàng</Label>
                  <Input
                    id="shippingAddress"
                    value={formData.shippingAddress}
                    onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
                    placeholder="Địa chỉ giao hàng tại Việt Nam"
                  />
                </div>

                <div className="rounded-lg border border-border p-4 space-y-3">
                  <p className="text-sm font-semibold">Thông tin ngân hàng</p>
                  <div className="space-y-1.5">
                    <Label htmlFor="bankName">Tên ngân hàng</Label>
                    <Input
                      id="bankName"
                      value={formData.bankInfo.bankName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bankInfo: { ...formData.bankInfo, bankName: e.target.value },
                        })
                      }
                      placeholder="VD: Vietcombank"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="accountNumber">Số tài khoản</Label>
                      <Input
                        id="accountNumber"
                        value={formData.bankInfo.accountNumber}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            bankInfo: { ...formData.bankInfo, accountNumber: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="accountHolder">Chủ tài khoản</Label>
                      <Input
                        id="accountHolder"
                        value={formData.bankInfo.accountHolder}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            bankInfo: { ...formData.bankInfo, accountHolder: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="balance">Số dư ví (¥)</Label>
                    <Input
                      id="balance"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.balance}
                      onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                    />
                    {formData.balance && Number(formData.balance) > 0 && (
                      <p className="text-xs text-muted-foreground">
                        ≈ {formatVnd(cnyToVnd(formData.balance, vndPerCny))}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="status">Trạng thái</Label>
                    <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val })}>
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

                <div className="space-y-1.5">
                  <Label htmlFor="note">Ghi chú</Label>
                  <Textarea
                    id="note"
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    placeholder="Ghi chú nội bộ về khách hàng..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={submitting}>
                    Hủy
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Lưu thông tin'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
