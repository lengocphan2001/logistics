'use client';

import { useCallback, useState } from 'react';
import { Download, Loader2, Plus } from 'lucide-react';
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
import { OrdersTable } from '@/components/orders/OrdersTable';
import {
  OrderFormModal,
  type WarehouseOption,
} from '@/components/orders/OrderFormModal';
import { useDebouncedEffect } from '@/hooks/use-debounced-effect';
import { useDeleteConfirm } from '@/hooks/use-delete-confirm';
import api from '@/lib/api';
import { ordersService, type Order } from '@/services/orders.service';
import { customersService, type Customer } from '@/services/customers.service';
import { ORDER_STATUSES, orderStatusLabels } from '@/lib/order-status';
import { ORDER_TYPES, orderTypeLabels } from '@/lib/order-type';
import {
  WORK_QUEUES,
  WORK_QUEUE_ORDER,
  type WorkQueueKey,
} from '@/lib/order-workflow';
import { useAuthStore } from '@/stores/auth.store';
import { cn } from '@/lib/utils';
import { apiErrorMessage } from '@/lib/api-error';
import { downloadFile } from '@/lib/download';
import { icon } from '@/lib/icon';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseOption[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [queue, setQueue] = useState<WorkQueueKey>('all');
  const [mineOnly, setMineOnly] = useState(false);

  const currentUserId = useAuthStore((s) => s.user?.id);

  const [isOpen, setIsOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      await downloadFile('/orders/export', {
        search: searchQuery || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        type: typeFilter !== 'ALL' ? typeFilter : undefined,
      });
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Không thể xuất dữ liệu'));
    } finally {
      setExporting(false);
    }
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [ordersRes, customersRes, warehousesRes] = await Promise.all([
        ordersService.getAll({
          limit: 100,
          search: searchQuery || undefined,
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
          type: typeFilter !== 'ALL' ? typeFilter : undefined,
        }),
        customersService.getAll({ limit: 100 }),
        api.get('/warehouses'),
      ]);
      setOrders(ordersRes.data.data ?? ordersRes.data);
      setCustomers(customersRes.data.data ?? customersRes.data);
      setWarehouses(warehousesRes.data);
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Lỗi khi tải dữ liệu'));
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter, typeFilter]);

  useDebouncedEffect(() => {
    void fetchData();
  }, [fetchData]);

  const queueStatuses = WORK_QUEUES[queue].statuses;
  const visibleOrders = orders.filter((order) => {
    if (queueStatuses.length > 0 && !queueStatuses.includes(order.status)) {
      return false;
    }
    if (mineOnly && order.assignedToId !== currentUserId) return false;
    return true;
  });

  const deletion = useDeleteConfirm((id) => ordersService.remove(id), {
    successMessage: 'Xoá đơn hàng thành công',
    errorMessage: 'Không thể xoá đơn hàng',
    onDone: () => void fetchData(),
  });

  const openCreate = () => {
    setEditingOrder(null);
    setIsOpen(true);
  };

  const openEdit = (order: Order) => {
    setEditingOrder(order);
    setIsOpen(true);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Đơn hàng"
        description="Đơn ký gửi, mua hộ, đặt hàng hộ và thanh toán hộ từ Trung Quốc về Việt Nam."
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport} disabled={exporting}>
              {exporting ? (
                <Loader2 {...icon('inline')} aria-hidden className="animate-spin" />
              ) : (
                <Download {...icon('inline')} aria-hidden />
              )}
              Xuất Excel
            </Button>
            <Button onClick={openCreate}>
              <Plus {...icon('inline')} aria-hidden />
              Tạo đơn hàng
            </Button>
          </div>
        }
      />

      {/* Staff think in jobs, not in statuses: each tab is one job to pick up. */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[var(--rule)] pb-3">
        {WORK_QUEUE_ORDER.map((key) => {
          const count =
            WORK_QUEUES[key].statuses.length === 0
              ? orders.length
              : orders.filter((o) => WORK_QUEUES[key].statuses.includes(o.status))
                  .length;

          return (
            <button
              key={key}
              type="button"
              onClick={() => setQueue(key)}
              aria-pressed={queue === key}
              className={cn(
                'rounded-[var(--radius-control)] border px-3 py-1.5 text-sm',
                queue === key
                  ? 'border-[var(--manifest-navy)] bg-[var(--manifest-navy)] text-white'
                  : 'border-[var(--rule)] bg-[var(--sheet-white)] text-[var(--graphite)] hover:text-[var(--ink)]',
              )}
            >
              {WORK_QUEUES[key].label}
              <span data-numeric className="ml-2 text-xs opacity-80">
                {count}
              </span>
            </button>
          );
        })}

        {currentUserId && (
          <button
            type="button"
            onClick={() => setMineOnly((prev) => !prev)}
            aria-pressed={mineOnly}
            className={cn(
              'ml-auto rounded-[var(--radius-control)] border px-3 py-1.5 text-sm',
              mineOnly
                ? 'border-[var(--manifest-navy)] bg-[var(--manifest-navy)] text-white'
                : 'border-[var(--rule)] bg-[var(--sheet-white)] text-[var(--graphite)] hover:text-[var(--ink)]',
            )}
          >
            Việc của tôi
          </button>
        )}
      </div>

      <FilterBar>
        <div className="w-full sm:max-w-xs">
          <SearchInput
            placeholder="Tìm mã vận đơn, số điện thoại, tên"
            aria-label="Tìm đơn hàng"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-52">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger aria-label="Lọc theo loại đơn">
              <SelectValue placeholder="Loại đơn" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả loại đơn</SelectItem>
              {ORDER_TYPES.map((key) => (
                <SelectItem key={key} value={key}>
                  {orderTypeLabels[key]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-full sm:w-52">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger aria-label="Lọc theo trạng thái">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
              {ORDER_STATUSES.map((key) => (
                <SelectItem key={key} value={key}>
                  {orderStatusLabels[key]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </FilterBar>

      <OrdersTable
        orders={visibleOrders}
        loading={loading}
        onEdit={openEdit}
        confirmingId={deletion.confirmingId}
        deletingId={deletion.deletingId}
        onArmDelete={deletion.arm}
        onCancelDelete={deletion.cancel}
        onConfirmDelete={deletion.confirm}
      />

      <OrderFormModal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        editing={editingOrder}
        customers={customers}
        warehouses={warehouses}
        onSaved={() => void fetchData()}
      />
    </div>
  );
}
