'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2, Plus, Warehouse as WarehouseIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SearchInput } from '@/components/ui/input-group';
import { Label } from '@/components/ui/label';
import { Modal } from '@/components/ui/modal';
import { RequiredMark } from '@/components/ui/required-mark';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingState } from '@/components/ui/loading-state';
import { RowActions } from '@/components/ui/row-actions';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PageHeader } from '@/components/layout/PageHeader';
import { FilterBar } from '@/components/layout/FilterBar';
import { useDeleteConfirm } from '@/hooks/use-delete-confirm';
import api from '@/lib/api';
import { apiErrorMessage } from '@/lib/api-error';
import { icon } from '@/lib/icon';

interface Warehouse {
  id: string;
  name: string;
  code: string;
  address: string;
  users?: { id: string; name: string; email: string }[];
  _count?: { users: number };
}

const emptyForm = { name: '', code: '', address: '' };

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<Warehouse | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchWarehouses = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/warehouses');
      setWarehouses(res.data);
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Không thể tải danh sách kho'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchWarehouses();
  }, [fetchWarehouses]);

  const deletion = useDeleteConfirm((id) => api.delete(`/warehouses/${id}`), {
    successMessage: 'Xoá kho thành công',
    errorMessage: 'Không thể xoá kho',
    onDone: () => void fetchWarehouses(),
  });

  const openCreate = () => {
    setEditing(null);
    setFormData(emptyForm);
    setIsOpen(true);
  };

  const openEdit = (wh: Warehouse) => {
    setEditing(wh);
    setFormData({ name: wh.name, code: wh.code, address: wh.address });
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim() || !formData.address.trim()) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      setSubmitting(true);
      if (editing) {
        await api.patch(`/warehouses/${editing.id}`, formData);
        toast.success('Cập nhật kho thành công');
      } else {
        await api.post('/warehouses', formData);
        toast.success('Tạo kho mới thành công');
      }
      setIsOpen(false);
      void fetchWarehouses();
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Không thể lưu thông tin kho'));
    } finally {
      setSubmitting(false);
    }
  };

  // The warehouse endpoint returns everything, so filtering stays on the client.
  const filtered = useMemo(() => {
    const needle = searchQuery.toLowerCase();
    return warehouses.filter(
      (wh) =>
        wh.name.toLowerCase().includes(needle) ||
        wh.code.toLowerCase().includes(needle) ||
        wh.address.toLowerCase().includes(needle),
    );
  }, [warehouses, searchQuery]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Kho hàng"
        description="Địa điểm kho của hệ thống và nhân sự phụ trách từng kho."
        action={
          <Button onClick={openCreate}>
            <Plus {...icon('inline')} aria-hidden />
            Thêm kho
          </Button>
        }
      />

      <FilterBar>
        <div className="w-full sm:max-w-xs">
          <SearchInput
            placeholder="Tìm theo tên, mã hoặc địa chỉ"
            aria-label="Tìm kho"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </FilterBar>

      {loading ? (
        <LoadingState label="Đang tải danh sách kho" className="py-20" />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={WarehouseIcon}
          title="Không tìm thấy kho nào"
          hint="Thêm kho mới hoặc xoá từ khoá tìm kiếm."
        />
      ) : (
        /* A warehouse is a record with four fields, so it belongs in the same
           table as everything else rather than in a grid of cards. */
        <div className="panel overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="min-w-[620px]">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Mã kho</TableHead>
                  <TableHead>Tên kho</TableHead>
                  <TableHead>Địa chỉ</TableHead>
                  <TableHead className="text-right">Nhân sự</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((wh) => (
                  <TableRow key={wh.id}>
                    <TableCell className="font-mono text-xs font-semibold text-[var(--ink)]">
                      {wh.code}
                    </TableCell>
                    <TableCell className="text-sm font-medium text-[var(--ink)]">
                      {wh.name}
                    </TableCell>
                    <TableCell className="whitespace-normal text-sm text-[var(--graphite)]">
                      {wh.address}
                    </TableCell>
                    <TableCell data-numeric className="text-right text-sm text-[var(--ink)]">
                      {wh._count?.users || wh.users?.length || 0}
                    </TableCell>
                    <TableCell className="text-right">
                      <RowActions
                        label={`kho ${wh.name}`}
                        onEdit={() => openEdit(wh)}
                        onDelete={() => deletion.arm(wh.id)}
                        confirming={deletion.confirmingId === wh.id}
                        deleting={deletion.deletingId === wh.id}
                        onConfirmDelete={() => deletion.confirm(wh.id)}
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
        title={editing ? `Sửa kho ${editing.name}` : 'Thêm kho mới'}
        size="md"
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={submitting}>
              Huỷ
            </Button>
            <Button type="submit" form="warehouse-form" disabled={submitting}>
              {submitting ? (
                <Loader2 {...icon('inline')} aria-hidden className="animate-spin" />
              ) : editing ? (
                'Cập nhật kho'
              ) : (
                'Tạo kho'
              )}
            </Button>
          </>
        }
      >
        <form id="warehouse-form" onSubmit={handleSubmit} className="space-y-4 px-5 py-4">
          <div className="space-y-1.5">
            <Label htmlFor="wh-name">
              Tên kho <RequiredMark />
            </Label>
            <Input
              id="wh-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="wh-code">
              Mã kho <RequiredMark />
            </Label>
            <Input
              id="wh-code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="wh-address">
              Địa chỉ <RequiredMark />
            </Label>
            <Input
              id="wh-address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
