'use client';

import { useState } from 'react';
import { ExternalLink, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SourcePropertyCopy } from '@/components/orders/SourcePropertyCopy';
import { apiErrorMessage } from '@/lib/api-error';
import { formatCny } from '@/lib/currency';
import { icon } from '@/lib/icon';
import {
  ordersService,
  orderItemStatusLabels,
  type AdminOrderItem,
  type Order,
  type OrderItemStatus,
  type OrderSummary,
} from '@/services/orders.service';

const ITEM_STATUSES: OrderItemStatus[] = [
  'PENDING',
  'PURCHASED',
  'OUT_OF_STOCK',
  'PRICE_CHANGED',
  'REFUNDED',
];

const STATUS_TONE: Record<OrderItemStatus, string> = {
  PENDING: 'border-[var(--rule-strong)] bg-transparent text-[var(--graphite)]',
  PURCHASED:
    'border-[var(--ledger-green)] bg-transparent text-[var(--ledger-green)]',
  OUT_OF_STOCK: 'border-[var(--seal-red)] bg-[var(--red-wash)] text-[var(--seal-red)]',
  PRICE_CHANGED:
    'border-[var(--manifest-navy)] bg-transparent text-[var(--manifest-navy)]',
  REFUNDED: 'border-[var(--rule-strong)] bg-[var(--wash)] text-[var(--graphite)]',
};

type OrderItemsPanelProps = {
  order: Order;
  editable: boolean;
  onChanged: (summary: OrderSummary) => void;
};

/**
 * A line that cannot be bought no longer strands the order: staff mark it out
 * of stock or re-price it here, and the money owed is recalculated from the
 * lines that survive.
 */
export function OrderItemsPanel({ order, editable, onChanged }: OrderItemsPanelProps) {
  const items = order.items ?? [];
  const [editing, setEditing] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  if (items.length === 0) return null;

  const save = async (
    item: AdminOrderItem,
    status: OrderItemStatus,
    priceText?: string,
  ) => {
    setSavingId(item.id);
    try {
      const res = await ordersService.updateItems(order.id, [
        {
          id: item.id,
          status,
          purchasedPriceCny:
            priceText && priceText.trim() !== '' ? Number(priceText) : undefined,
        },
      ]);
      toast.success('Đã cập nhật dòng hàng');
      onChanged(res.data);
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Không cập nhật được dòng hàng'));
    } finally {
      setSavingId(null);
    }
  };

  const chargeable = items.filter(
    (item) => item.status !== 'OUT_OF_STOCK' && item.status !== 'REFUNDED',
  );
  const total = chargeable.reduce(
    (sum, item) =>
      sum + Number(item.purchasedPriceCny ?? item.priceCny) * item.quantity,
    0,
  );

  return (
    <section className="panel overflow-hidden">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--rule)] px-5 py-3.5">
        <h2 className="font-heading text-base font-semibold text-[var(--ink)]">
          Sản phẩm
        </h2>
        {order.shopName && (
          <span className="text-sm text-[var(--graphite)]">
            {order.shopName}
            {order.shopUrl && (
              <a
                href={order.shopUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 inline-flex text-[var(--manifest-navy)] hover:underline"
                aria-label="Mở trang shop"
              >
                <ExternalLink {...icon('inline')} aria-hidden />
              </a>
            )}
          </span>
        )}
      </div>

      <ul className="divide-y divide-[var(--rule)]">
        {items.map((item) => {
          const priceValue =
            editing[item.id] ??
            (item.purchasedPriceCny != null
              ? String(Number(item.purchasedPriceCny))
              : '');

          return (
            <li key={item.id} className="px-5 py-4">
              <div className="flex gap-3">
                {item.image && (
                  <img
                    src={item.image}
                    alt=""
                    className="size-16 shrink-0 border border-[var(--rule)] object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-[var(--ink)]">{item.title}</p>
                  {item.properties && item.properties.length > 0 && (
                    <>
                      <p className="mt-0.5 text-xs text-[var(--graphite)]">
                        {item.properties
                          .map((p) => `${p.name}: ${p.value}`)
                          .join(', ')}
                      </p>
                      <SourcePropertyCopy properties={item.properties} />
                    </>
                  )}
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-0.5 inline-flex items-center gap-1 text-xs text-[var(--manifest-navy)] hover:underline"
                    >
                      Xem nguồn
                      <ExternalLink {...icon('inline')} aria-hidden />
                    </a>
                  )}
                  {item.statusNote && (
                    <p className="mt-1 text-xs text-[var(--seal-red)]">
                      {item.statusNote}
                    </p>
                  )}
                </div>

                <div className="shrink-0 text-right">
                  <p data-numeric className="text-sm font-semibold text-[var(--ink)]">
                    {formatCny(Number(item.purchasedPriceCny ?? item.priceCny))}
                  </p>
                  <p data-numeric className="text-xs text-[var(--graphite)]">
                    × {item.quantity}
                  </p>
                  <Badge variant="outline" className={`mt-1 ${STATUS_TONE[item.status]}`}>
                    {orderItemStatusLabels[item.status]}
                  </Badge>
                </div>
              </div>

              {editable && (
                <div className="mt-3 flex flex-wrap items-end gap-2">
                  <div className="w-44">
                    <Select
                      value={item.status}
                      onValueChange={(value) =>
                        void save(item, value as OrderItemStatus, priceValue)
                      }
                    >
                      <SelectTrigger aria-label={`Trạng thái ${item.title}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ITEM_STATUSES.map((status) => (
                          <SelectItem key={status} value={status}>
                            {orderItemStatusLabels[status]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-36">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Giá mua thật (¥)"
                      aria-label={`Giá mua thật của ${item.title}`}
                      value={priceValue}
                      onChange={(e) =>
                        setEditing((prev) => ({ ...prev, [item.id]: e.target.value }))
                      }
                    />
                  </div>
                  <Button
                    variant="outline"
                    disabled={savingId === item.id}
                    onClick={() => void save(item, item.status, priceValue)}
                  >
                    {savingId === item.id ? (
                      <Loader2 {...icon('inline')} aria-hidden className="animate-spin" />
                    ) : (
                      'Lưu giá'
                    )}
                  </Button>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <div className="flex items-baseline justify-between gap-4 border-t border-[var(--rule)] bg-[var(--wash)]/60 px-5 py-3.5">
        <span className="text-sm font-semibold text-[var(--ink)]">
          Tổng hàng còn tính tiền
        </span>
        <span data-numeric className="text-sm font-bold text-[var(--ink)]">
          {formatCny(total)}
        </span>
      </div>
    </section>
  );
}
