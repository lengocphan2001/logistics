'use client';

import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { CustomerOrderRequestItem } from '@/services/orders.service';
import { icon } from '@/lib/icon';

type RequestItemsFieldProps = {
  items: CustomerOrderRequestItem[];
  onChange: (items: CustomerOrderRequestItem[]) => void;
};

export const emptyRequestItem: CustomerOrderRequestItem = {
  title: '',
  url: '',
  note: '',
  quantity: 1,
};

/** The product list for an order-on-behalf request: one row per line item. */
export function RequestItemsField({ items, onChange }: RequestItemsFieldProps) {
  const update = (index: number, patch: Partial<CustomerOrderRequestItem>) =>
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));

  const remove = (index: number) => onChange(items.filter((_, i) => i !== index));

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={index} className="border border-[var(--rule)] p-4">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-semibold text-[var(--ink)]">
              Sản phẩm <span data-numeric>{index + 1}</span>
            </p>
            {items.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`Xoá sản phẩm ${index + 1}`}
                onClick={() => remove(index)}
                className="hover:bg-[var(--red-wash)] hover:text-[var(--seal-red)]"
              >
                <Trash2 {...icon('inline')} aria-hidden />
              </Button>
            )}
          </div>

          <div className="mt-3 space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor={`item-url-${index}`}>Link sản phẩm</Label>
              <Input
                id={`item-url-${index}`}
                inputMode="url"
                placeholder="https://detail.1688.com/offer/..."
                value={item.url ?? ''}
                onChange={(e) => update(index, { url: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor={`item-title-${index}`}>Tên sản phẩm</Label>
              <Input
                id={`item-title-${index}`}
                value={item.title}
                onChange={(e) => update(index, { title: e.target.value })}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor={`item-qty-${index}`}>Số lượng</Label>
                <Input
                  id={`item-qty-${index}`}
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) =>
                    update(index, { quantity: Math.max(1, Number(e.target.value) || 1) })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`item-price-${index}`}>Đơn giá tham khảo (¥)</Label>
                <Input
                  id={`item-price-${index}`}
                  type="number"
                  min={0}
                  step="0.01"
                  value={item.priceCny ?? ''}
                  onChange={(e) =>
                    update(index, {
                      priceCny: e.target.value === '' ? undefined : Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor={`item-note-${index}`}>Phân loại, màu, size</Label>
              <Input
                id={`item-note-${index}`}
                placeholder="Ví dụ: màu đen, size XL"
                value={item.note ?? ''}
                onChange={(e) => update(index, { note: e.target.value })}
              />
            </div>
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={() => onChange([...items, { ...emptyRequestItem }])}
      >
        <Plus {...icon('inline')} aria-hidden />
        Thêm sản phẩm
      </Button>
    </div>
  );
}
