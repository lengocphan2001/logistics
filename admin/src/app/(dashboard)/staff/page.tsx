'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/input-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageHeader } from '@/components/layout/PageHeader';
import { FilterBar } from '@/components/layout/FilterBar';
import { StaffTable } from '@/components/staff/StaffTable';
import { StaffFormModal } from '@/components/staff/StaffFormModal';
import {
  ROLES,
  roleLabels,
  type StaffUser,
  type WarehouseOption,
} from '@/components/staff/staff.types';
import { useDeleteConfirm } from '@/hooks/use-delete-confirm';
import api from '@/lib/api';
import { apiErrorMessage } from '@/lib/api-error';
import { icon } from '@/lib/icon';

export default function StaffPage() {
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  const [isOpen, setIsOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<StaffUser | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [usersRes, whsRes] = await Promise.all([
        api.get('/users'),
        api.get('/warehouses'),
      ]);
      setUsers(usersRes.data);
      setWarehouses(whsRes.data);
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Lỗi khi tải dữ liệu nhân viên'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const deletion = useDeleteConfirm((id) => api.delete(`/users/${id}`), {
    successMessage: 'Xoá tài khoản nhân viên thành công',
    errorMessage: 'Không thể xoá nhân viên',
    onDone: () => void fetchData(),
  });

  // The staff endpoint returns the full list, so filtering stays on the client.
  const filteredUsers = useMemo(() => {
    const needle = searchQuery.toLowerCase();
    return users.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(needle) || u.email.toLowerCase().includes(needle);
      const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

  const openCreate = () => {
    setEditingUser(null);
    setIsOpen(true);
  };

  const openEdit = (user: StaffUser) => {
    setEditingUser(user);
    setIsOpen(true);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Nhân viên"
        description="Phân quyền hệ thống, cấp tài khoản và điều phối nhân sự các bộ phận."
        action={
          <Button onClick={openCreate}>
            <Plus {...icon('inline')} aria-hidden />
            Cấp tài khoản
          </Button>
        }
      />

      <FilterBar>
        <div className="w-full sm:max-w-xs">
          <SearchInput
            placeholder="Tìm theo tên hoặc email"
            aria-label="Tìm nhân viên"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-56">
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger aria-label="Lọc theo chức vụ">
              <SelectValue placeholder="Chức vụ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả chức vụ</SelectItem>
              {ROLES.map((role) => (
                <SelectItem key={role} value={role}>
                  {roleLabels[role]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </FilterBar>

      <StaffTable
        users={filteredUsers}
        loading={loading}
        onEdit={openEdit}
        confirmingId={deletion.confirmingId}
        deletingId={deletion.deletingId}
        onArmDelete={deletion.arm}
        onCancelDelete={deletion.cancel}
        onConfirmDelete={deletion.confirm}
      />

      <StaffFormModal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        editing={editingUser}
        warehouses={warehouses}
        onSaved={() => void fetchData()}
      />
    </div>
  );
}
