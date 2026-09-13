'use client';

import { Package } from 'lucide-react';
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
import type { Order } from '@/services/orders.service';
import { orderStatusBadgeColors, orderStatusLabels } from '@/lib/order-status';
import { orderTypeBadgeColors, orderTypeLabels } from '@/lib/order-type';
import { formatVnd } from '@/lib/currency';
import { formatDate } from '@/lib/date';
import { isQuoteExpired, isQuoteOverdue } from '@/lib/order-workflow';

type OrdersTableProps = {
  orders: Order[];
  loading: boolean;
  onEdit: (order: Order) => void;
  confirmingId: string | null;
  deletingId: string | null;
  onArmDelete: (id: string) => void;
  onCancelDelete: () => void;
  onConfirmDelete: (id: string) => void;
};

export function OrdersTable({
  orders,
  loading,
  onEdit,
  confirmingId,
  deletingId,
  onArmDelete,
  onCancelDelete,
  onConfirmDelete,
}: OrdersTableProps) {
  if (loading) {
    return <LoadingState label="Đang tải danh sách đơn hàng" className="py-20" />;
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="Không tìm thấy đơn hàng nào"
        hint="Đổi bộ lọc hoặc xoá từ khoá tìm kiếm để xem toàn bộ đơn."
      />
    );
  }

  return (
    <div className="panel overflow-hidden">
      <div className="overflow-x-auto">
        <Table className="min-w-[980px]">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Mã vận đơn</TableHead>
              <TableHead>Loại đơn</TableHead>
              <TableHead>Người gửi và nhận</TableHead>
              <TableHead>Khách hàng</TableHead>
              <TableHead className="text-right">Tổng phí</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-mono text-xs font-semibold text-[var(--ink)]">
                  {order.billOfLadingCode}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={orderTypeBadgeColors[order.type]}>
                    {orderTypeLabels[order.type]}
                  </Badge>
                </TableCell>
                <TableCell className="whitespace-normal">
                  <p className="text-sm font-medium text-[var(--ink)]">{order.senderName}</p>
                  <p className="text-xs text-[var(--graphite)]">{order.receiverName}</p>
                  <p className="text-xs text-[var(--graphite)]">{order.receiverPhone}</p>
                </TableCell>
                <TableCell className="whitespace-normal">
                  {order.customer ? (
                    <>
                      <p className="text-sm font-medium text-[var(--ink)]">
                        {order.customer.fullName}
                      </p>
                      <p className="text-xs text-[var(--graphite)]">{order.customer.phone}</p>
                    </>
                  ) : (
                    <span className="text-xs text-[var(--graphite)]">Khách lẻ</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <p data-numeric className="text-sm font-semibold text-[var(--ink)]">
                    {formatVnd(order.totalFee)}
                  </p>
                  <p data-numeric className="text-xs text-[var(--graphite)]">
                    Vận chuyển {formatVnd(order.feeTransfer)}
                  </p>
                </TableCell>
                <TableCell className="whitespace-normal">
                  <Badge variant="outline" className={orderStatusBadgeColors[order.status]}>
                    {orderStatusLabels[order.status]}
                  </Badge>
                  {(isQuoteOverdue(order) || isQuoteExpired(order)) && (
                    <p className="mt-1 text-xs text-[var(--seal-red)]">
                      {isQuoteExpired(order) ? 'Báo giá hết hạn' : 'Quá hạn báo giá'}
                    </p>
                  )}
                  {order.assignedTo && (
                    <p className="mt-1 text-xs text-[var(--graphite)]">
                      {order.assignedTo.name}
                    </p>
                  )}
                </TableCell>
                <TableCell className="text-xs text-[var(--graphite)]">
                  {formatDate(order.createdAt)}
                </TableCell>
                <TableCell className="text-right">
                  <RowActions
                    label={`đơn ${order.billOfLadingCode}`}
                    viewHref={`/orders/${order.id}`}
                    onEdit={() => onEdit(order)}
                    onDelete={() => onArmDelete(order.id)}
                    confirming={confirmingId === order.id}
                    deleting={deletingId === order.id}
                    onConfirmDelete={() => onConfirmDelete(order.id)}
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
