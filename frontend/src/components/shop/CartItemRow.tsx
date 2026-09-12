'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { QuantityStepper } from '@/components/ui/quantity-stepper';
import { ProductImage } from '@/components/shop/ProductImage';
import { formatProperties } from '@/components/shop/product-display.utils';
import { cartService, type CartItem } from '@/services/cart.service';
import { cnyToVnd, formatCny, formatVnd } from '@/lib/currency';
import { apiErrorMessage } from '@/lib/api-error';
import { icon } from '@/lib/icon';
import { cn } from '@/lib/utils';

type CartItemRowProps = {
  item: CartItem;
  vndPerCny: number;
  selected: boolean;
  onToggle: () => void;
  onRemove: () => void;
  onRefresh: () => void;
};

/** Quantity is saved as it changes; the note is saved when the field loses focus. */
export function CartItemRow({
  item,
  vndPerCny,
  selected,
  onToggle,
  onRemove,
  onRefresh,
}: CartItemRowProps) {
  const [qty, setQty] = useState(item.quantity);
  const [note, setNote] = useState(item.note ?? '');
  const [updating, setUpdating] = useState(false);
  const [removing, setRemoving] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setQty(item.quantity);
  }, [item.quantity]);

  useEffect(() => {
    setNote(item.note ?? '');
  }, [item.note]);

  const lineVnd = cnyToVnd(Number(item.priceCny) * qty, vndPerCny);
  const propsText = formatProperties(item.properties);

  const persistQty = async (newQty: number) => {
    if (newQty < 1 || newQty === item.quantity) return;
    setUpdating(true);
    try {
      await cartService.updateItem(item.id, { quantity: newQty });
      onRefresh();
    } catch (err) {
      setQty(item.quantity);
      toast.error(apiErrorMessage(err, 'Không thể cập nhật số lượng'));
    } finally {
      setUpdating(false);
    }
  };

  const scheduleQtySave = (newQty: number) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    if (newQty < 1) return;
    saveTimer.current = setTimeout(() => {
      void persistQty(newQty);
    }, 400);
  };

  const commitQty = () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    const parsed = Math.floor(Number(qty));
    if (!Number.isFinite(parsed) || parsed < 1) {
      setQty(item.quantity);
      toast.error('Số lượng phải >= 1');
      return;
    }
    setQty(parsed);
    void persistQty(parsed);
  };

  const saveNote = async () => {
    const trimmed = note.trim();
    if (trimmed === (item.note ?? '')) return;
    try {
      await cartService.updateItem(item.id, { note: trimmed });
      onRefresh();
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Không thể lưu ghi chú'));
    }
  };

  const handleRemove = async () => {
    setRemoving(true);
    try {
      await cartService.removeItem(item.id);
      onRemove();
      onRefresh();
    } catch {
      toast.error('Không thể xóa');
    } finally {
      setRemoving(false);
    }
  };

  const noteId = `note-${item.id}`;

  return (
    <tr className={cn('border-b border-[var(--rule)]', selected && 'bg-[var(--navy-wash)]/40')}>
      <td className="px-2 py-4 text-center align-top">
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggle}
          aria-label={`Chọn ${item.title}`}
          className="size-4 cursor-pointer accent-[var(--manifest-navy)]"
        />
      </td>
      <td className="px-3 py-4 align-top">
        <div className="flex gap-3">
          <ProductImage src={item.image} fallbackIcon="control" className="size-16 shrink-0" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <p className="line-clamp-2 text-sm font-medium leading-snug text-[var(--ink)]">
              {item.title}
            </p>
            {propsText && (
              <p className="text-xs text-[var(--graphite)]">Phân loại: {propsText}</p>
            )}
            <div>
              <label htmlFor={noteId} className="text-xs text-[var(--graphite)]">
                Ghi chú
              </label>
              <Input
                id={noteId}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                onBlur={saveNote}
                placeholder="Ghi chú cho sản phẩm"
                className="mt-1 h-8 text-xs"
              />
            </div>
          </div>
        </div>
      </td>
      <td className="px-2 py-4 align-top">
        <div className="flex justify-center">
          <QuantityStepper
            value={qty}
            variant="input"
            size="sm"
            disabled={updating}
            onChange={setQty}
            onStep={(next) => void persistQty(next)}
            onType={scheduleQtySave}
            onCommit={commitQty}
          />
        </div>
      </td>
      <td className="px-2 py-4 text-right align-top text-xs">
        <p data-numeric className="font-semibold text-[var(--ink)]">
          {formatCny(Number(item.priceCny))}
        </p>
        <p data-numeric className="text-[var(--graphite)]">
          {formatVnd(cnyToVnd(item.priceCny, vndPerCny))}
        </p>
      </td>
      <td
        data-numeric
        className="px-2 py-4 text-right align-top text-sm font-bold text-[var(--ink)]"
      >
        {formatVnd(lineVnd)}
      </td>
      <td className="px-2 py-4 text-center align-top">
        <button
          type="button"
          aria-label={`Xóa ${item.title}`}
          disabled={removing}
          onClick={handleRemove}
          className="inline-flex size-8 items-center justify-center rounded-[var(--radius-control)] text-[var(--graphite)] hover:bg-[var(--red-wash)] hover:text-[var(--seal-red)]"
        >
          {removing ? (
            <Loader2 {...icon('inline')} aria-hidden className="animate-spin" />
          ) : (
            <Trash2 {...icon('inline')} aria-hidden />
          )}
        </button>
      </td>
    </tr>
  );
}
