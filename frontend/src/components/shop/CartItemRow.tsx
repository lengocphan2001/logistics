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

/** Grid template for the cart header and rows from the medium breakpoint up. */
export const CART_ROW_COLUMNS = 'md:grid-cols-[2.5rem_minmax(0,1fr)_7rem_7rem_8rem_2.5rem]';

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
    <li
      className={cn(
        'grid grid-cols-[1rem_minmax(0,1fr)] gap-x-3 gap-y-3 border-b border-[var(--rule)] px-3 py-4 last:border-b-0 md:gap-x-0 md:gap-y-0 md:px-0',
        CART_ROW_COLUMNS,
        selected && 'bg-[var(--navy-wash)]/40',
      )}
    >
      <div className="pt-0.5 md:px-2 md:text-center">
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggle}
          aria-label={`Chọn ${item.title}`}
          className="size-4 cursor-pointer accent-[var(--manifest-navy)]"
        />
      </div>
      <div className="min-w-0 md:px-3">
        <div className="flex gap-3">
          <ProductImage src={item.image} fallbackIcon="control" className="size-16 shrink-0" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <p className="line-clamp-2 text-sm font-medium leading-snug text-[var(--ink)]">
              {item.title}
            </p>
            {propsText && (
              <p className="text-xs text-[var(--graphite)]">Phân loại: {propsText}</p>
            )}
            <p data-numeric className="text-xs text-[var(--graphite)] md:hidden">
              Đơn giá {formatCny(Number(item.priceCny))} (
              {formatVnd(cnyToVnd(item.priceCny, vndPerCny))})
            </p>
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
                className="mt-1 h-8 text-base sm:text-xs"
              />
            </div>
          </div>
        </div>
      </div>
      {/* Phones: quantity, line total and delete share one row under the
          product. From md up the wrapper dissolves into the grid columns. */}
      <div className="col-start-2 flex items-center gap-3 md:contents">
        <div className="md:flex md:items-start md:justify-center md:px-2">
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
        <div className="hidden px-2 text-right text-xs md:block">
          <p data-numeric className="font-semibold text-[var(--ink)]">
            {formatCny(Number(item.priceCny))}
          </p>
          <p data-numeric className="text-[var(--graphite)]">
            {formatVnd(cnyToVnd(item.priceCny, vndPerCny))}
          </p>
        </div>
        <p
          data-numeric
          className="ml-auto text-sm font-bold text-[var(--ink)] md:ml-0 md:px-2 md:text-right"
        >
          {formatVnd(lineVnd)}
        </p>
        <div className="md:px-2 md:text-center">
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
        </div>
      </div>
    </li>
  );
}
