'use client';

import { Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
import type { Customer } from '@/services/customers.service';
import { useExchangeRate } from '@/hooks/use-exchange-rate';
import { cnyToVnd, formatCny, formatVnd } from '@/lib/currency';

type CustomersTableProps = {
  customers: Customer[];
  loading: boolean;
  onEdit: (customer: Customer) => void;
  confirmingId: string | null;
  deletingId: string | null;
  onArmDelete: (id: string) => void;
  onCancelDelete: () => void;
  onConfirmDelete: (id: string) => void;
};

export function CustomersTable({
  customers,
  loading,
  onEdit,
  confirmingId,
  deletingId,
  onArmDelete,
  onCancelDelete,
  onConfirmDelete,
}: CustomersTableProps) {
  const { vndPerCny } = useExchangeRate();

  if (loading) {
    return <LoadingState label="Đang tải danh sách khách hàng" className="py-20" />;
  }

  if (customers.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="Không tìm thấy khách hàng nào"
        hint="Khách hàng xuất hiện ở đây sau khi họ tự đăng ký trên website."
      />
    );
  }

  return (
    <div className="panel overflow-hidden">
      <div className="overflow-x-auto">
        <Table className="min-w-[860px]">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Khách hàng</TableHead>
              <TableHead>Liên hệ</TableHead>
              <TableHead className="text-right">Số dư ví</TableHead>
              <TableHead className="text-right">Đơn hàng</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="whitespace-normal">
                  <p className="text-sm font-semibold text-[var(--ink)]">
                    {customer.fullName}
                  </p>
                  <p className="font-mono text-xs text-[var(--graphite)]">
                    {customer.username}
                  </p>
                </TableCell>
                <TableCell className="whitespace-normal">
                  <p className="text-sm text-[var(--ink)]">{customer.phone}</p>
                  {customer.email && (
                    <p className="text-xs text-[var(--graphite)]">{customer.email}</p>
                  )}
                  {customer.address && (
                    <p className="line-clamp-1 text-xs text-[var(--graphite)]">
                      {customer.address}
                    </p>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <p data-numeric className="text-sm font-semibold text-[var(--ink)]">
                    {formatCny(customer.balance)}
                  </p>
                  <p data-numeric className="text-xs text-[var(--graphite)]">
                    ≈ {formatVnd(cnyToVnd(customer.balance, vndPerCny))}
                  </p>
                </TableCell>
                <TableCell data-numeric className="text-right text-sm text-[var(--ink)]">
                  {customer._count?.orders ?? 0}
                </TableCell>
                <TableCell>
                  <Badge variant={customer.status === 'ACTIVE' ? 'success' : 'secondary'}>
                    {customer.status === 'ACTIVE' ? 'Hoạt động' : 'Ngưng hoạt động'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <RowActions
                    label={`khách hàng ${customer.fullName}`}
                    viewHref={`/customers/${customer.id}`}
                    onEdit={() => onEdit(customer)}
                    onDelete={() => onArmDelete(customer.id)}
                    confirming={confirmingId === customer.id}
                    deleting={deletingId === customer.id}
                    onConfirmDelete={() => onConfirmDelete(customer.id)}
                    onCancelDelete={onCancelDelete}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
