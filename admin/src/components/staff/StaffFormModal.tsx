'use client';

import { useEffect, useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  InputGroup,
  InputGroupAction,
  InputGroupInput,
} from '@/components/ui/input-group';
import { Label } from '@/components/ui/label';
import { Modal } from '@/components/ui/modal';
import { RequiredMark } from '@/components/ui/required-mark';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import api from '@/lib/api';
import { apiErrorMessage } from '@/lib/api-error';
import { icon } from '@/lib/icon';
import {
  ROLES,
  roleLabels,
  type StaffUser,
  type WarehouseOption,
} from '@/components/staff/staff.types';

const emptyForm = {
  name: '',
  email: '',
  password: '',
  role: 'SALES',
  warehouseId: '',
  status: 'ACTIVE',
};

type StaffFormModalProps = {
  open: boolean;
  onClose: () => void;
  editing: StaffUser | null;
  warehouses: WarehouseOption[];
  onSaved: () => void;
};

export function StaffFormModal({
  open,
  onClose,
  editing,
  warehouses,
  onSaved,
}: StaffFormModalProps) {
  const [formData, setFormData] = useState(emptyForm);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setShowPassword(false);
    if (!editing) {
      setFormData(emptyForm);
      return;
    }
    setFormData({
      name: editing.name,
      email: editing.email,
      password: '', // Clear password field for security
      role: editing.role,
      warehouseId: editing.warehouseId || '',
      status: editing.status,
    });
  }, [open, editing]);

  const setField = (field: keyof typeof emptyForm, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error('Vui lòng nhập đầy đủ tên và email');
      return;
    }

    if (!editing && !formData.password) {
      toast.error('Vui lòng nhập mật khẩu cho tài khoản mới');
      return;
    }

    const payload: Record<string, unknown> = {
      name: formData.name,
      email: formData.email,
      role: formData.role,
      status: formData.status,
    };

    if (formData.password) {
      payload.password = formData.password;
    }

    // A warehouse manager must belong to exactly one warehouse.
    if (formData.role === 'WAREHOUSE_MANAGER') {
      if (!formData.warehouseId) {
        toast.error('Quản trị kho cần thuộc một kho cụ thể');
        return;
      }
      payload.warehouseId = formData.warehouseId;
    } else {
      payload.warehouseId = null;
    }

    try {
      setSubmitting(true);
      if (editing) {
        await api.patch(`/users/${editing.id}`, payload);
        toast.success('Cập nhật tài khoản nhân viên thành công');
      } else {
        await api.post('/users', payload);
        toast.success('Tạo tài khoản nhân viên thành công');
      }
      onClose();
      onSaved();
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Không thể lưu thông tin nhân viên'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Sửa thông tin nhân viên' : 'Cấp tài khoản nhân viên'}
      size="md"
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
            Huỷ
          </Button>
          <Button type="submit" form="staff-form" disabled={submitting}>
            {submitting ? (
              <Loader2 {...icon('inline')} aria-hidden className="animate-spin" />
            ) : (
              'Lưu tài khoản'
            )}
          </Button>
        </>
      }
    >
      <form id="staff-form" onSubmit={handleSubmit} className="space-y-4 px-5 py-4">
        <div className="space-y-1.5">
          <Label htmlFor="staff-name">
            Họ và tên <RequiredMark />
          </Label>
          <Input
            id="staff-name"
            value={formData.name}
            onChange={(e) => setField('name', e.target.value)}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="staff-email">
            Email đăng nhập <RequiredMark />
          </Label>
          <Input
            id="staff-email"
            type="email"
            value={formData.email}
            onChange={(e) => setField('email', e.target.value)}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="staff-password">
            {editing ? 'Mật khẩu mới' : 'Mật khẩu khởi tạo'}
            {!editing && <RequiredMark />}
          </Label>
          <InputGroup>
            <InputGroupInput
              id="staff-password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => setField('password', e.target.value)}
              className="pl-3 pr-11"
              required={!editing}
            />
            <InputGroupAction
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            >
              {showPassword ? (
                <EyeOff {...icon('inline')} aria-hidden />
              ) : (
                <Eye {...icon('inline')} aria-hidden />
              )}
            </InputGroupAction>
          </InputGroup>
          {editing && (
            <p className="text-xs text-[var(--graphite)]">
              Để trống nếu giữ nguyên mật khẩu hiện tại.
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="staff-role">Chức vụ</Label>
          <Select value={formData.role} onValueChange={(val) => setField('role', val)}>
            <SelectTrigger id="staff-role">
              <SelectValue placeholder="Chọn chức vụ" />
            </SelectTrigger>
            <SelectContent>
              {ROLES.map((role) => (
                <SelectItem key={role} value={role}>
                  {roleLabels[role]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {formData.role === 'WAREHOUSE_MANAGER' && (
          <div className="space-y-1.5">
            <Label htmlFor="staff-warehouse">
              Kho phụ trách <RequiredMark />
            </Label>
            <Select
              value={formData.warehouseId}
              onValueChange={(val) => setField('warehouseId', val)}
            >
              <SelectTrigger id="staff-warehouse">
                <SelectValue placeholder="Chọn kho để phân công" />
              </SelectTrigger>
              <SelectContent>
                {warehouses.map((wh) => (
                  <SelectItem key={wh.id} value={wh.id}>
                    {wh.name} ({wh.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {editing && (
          <div className="space-y-1.5">
            <Label htmlFor="staff-status">Trạng thái tài khoản</Label>
            <Select value={formData.status} onValueChange={(val) => setField('status', val)}>
              <SelectTrigger id="staff-status">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                <SelectItem value="INACTIVE">Khoá tài khoản</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </form>
    </Modal>
  );
}
