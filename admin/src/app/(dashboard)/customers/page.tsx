'use client';

import { useCallback, useState } from 'react';
import { toast } from 'sonner';
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
import { CustomersTable } from '@/components/customers/CustomersTable';
import { CustomerFormModal } from '@/components/customers/CustomerFormModal';
import { useDebouncedEffect } from '@/hooks/use-debounced-effect';
import { useDeleteConfirm } from '@/hooks/use-delete-confirm';
import { customersService, type Customer } from '@/services/customers.service';
import { apiErrorMessage } from '@/lib/api-error';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [isOpen, setIsOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await customersService.getAll({
        limit: 100,
        search: searchQuery || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
      });
      setCustomers(res.data.data ?? res.data);
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Không thể tải danh sách khách hàng'));
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter]);

  useDebouncedEffect(() => {
    void fetchCustomers();
  }, [fetchCustomers]);

  const deletion = useDeleteConfirm((id) => customersService.remove(id), {
    successMessage: 'Xoá khách hàng thành công',
    errorMessage: 'Không thể xoá khách hàng',
    onDone: () => void fetchCustomers(),
  });

  const openEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsOpen(true);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Khách hàng"
        description="Khách hàng tự đăng ký từ website. Quản trị viên chỉ cập nhật thông tin, không tạo mới."
      />

      <FilterBar>
        <div className="w-full sm:max-w-xs">
          <SearchInput
            placeholder="Tìm tên đăng nhập, họ tên, số điện thoại, email"
            aria-label="Tìm khách hàng"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-48">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger aria-label="Lọc theo trạng thái">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả</SelectItem>
              <SelectItem value="ACTIVE">Hoạt động</SelectItem>
              <SelectItem value="INACTIVE">Ngưng hoạt động</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </FilterBar>

      <CustomersTable
        customers={customers}
        loading={loading}
        onEdit={openEdit}
        confirmingId={deletion.confirmingId}
        deletingId={deletion.deletingId}
        onArmDelete={deletion.arm}
        onCancelDelete={deletion.cancel}
        onConfirmDelete={deletion.confirm}
      />

      <CustomerFormModal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        editing={editingCustomer}
        onSaved={() => void fetchCustomers()}
      />
    </div>
  );
}
