'use client';

import { UserCog } from 'lucide-react';
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
import { roleLabels, type StaffUser } from '@/components/staff/staff.types';

type StaffTableProps = {
  users: StaffUser[];
  loading: boolean;
  onEdit: (user: StaffUser) => void;
  confirmingId: string | null;
  deletingId: string | null;
  onArmDelete: (id: string) => void;
  onCancelDelete: () => void;
  onConfirmDelete: (id: string) => void;
};

export function StaffTable({
  users,
  loading,
  onEdit,
  confirmingId,
  deletingId,
  onArmDelete,
  onCancelDelete,
  onConfirmDelete,
}: StaffTableProps) {
  if (loading) {
    return <LoadingState label="Đang tải danh sách nhân viên" className="py-20" />;
  }

  if (users.length === 0) {
    return (
      <EmptyState
        icon={UserCog}
        title="Không tìm thấy tài khoản nhân viên nào"
        hint="Đổi bộ lọc chức vụ hoặc xoá từ khoá tìm kiếm."
      />
    );
  }

  return (
    <div className="panel overflow-hidden">
      <div className="overflow-x-auto">
        <Table className="min-w-[760px]">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Nhân viên</TableHead>
              <TableHead>Chức vụ</TableHead>
              <TableHead>Nơi làm việc</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="whitespace-normal">
                  <p className="text-sm font-semibold text-[var(--ink)]">{user.name}</p>
                  <p className="text-xs text-[var(--graphite)]">{user.email}</p>
                </TableCell>
                <TableCell className="text-sm text-[var(--ink)]">
                  {roleLabels[user.role] || user.role}
                </TableCell>
                <TableCell className="whitespace-normal text-sm">
                  {user.role === 'WAREHOUSE_MANAGER' ? (
                    user.warehouse ? (
                      <>
                        <span className="text-[var(--ink)]">{user.warehouse.name}</span>{' '}
                        <span className="text-xs text-[var(--graphite)]">
                          ({user.warehouse.code})
                        </span>
                      </>
                    ) : (
                      <span className="text-[var(--seal-red)]">Chưa phân kho</span>
                    )
                  ) : (
                    <span className="text-[var(--graphite)]">Văn phòng chính</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={user.status === 'ACTIVE' ? 'success' : 'secondary'}>
                    {user.status === 'ACTIVE' ? 'Hoạt động' : 'Tạm khoá'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <RowActions
                    label={`nhân viên ${user.name}`}
                    onEdit={() => onEdit(user)}
                    onDelete={() => onArmDelete(user.id)}
                    confirming={confirmingId === user.id}
                    deleting={deletingId === user.id}
                    onConfirmDelete={() => onConfirmDelete(user.id)}
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
