'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import { Trash2, Loader2, Minus, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { cartService, type CartItem } from '@/services/cart.service';
import { productsService } from '@/services/products.service';
import {
  formatProperties,
  getShopKey,
  ProductPriceBlock,
} from '@/components/shop/product-display.utils';
import { cnyToVnd, formatVnd } from '@/lib/currency';
import { cn } from '@/lib/utils';

const SHOP_SERVICES = [
  { id: 'inspect', label: 'Kiểm hàng' },
  { id: 'wood', label: 'Đóng gỗ' },
  { id: 'insurance', label: 'Bảo hiểm' },
  { id: 'bubble', label: 'Bọt khí' },
] as const;

export interface ShopGroup {
  shopKey: string;
  shopName: string;
  items: CartItem[];
}

interface CartShopGroupProps {
  group: ShopGroup;
  vndPerCny: number;
  selectedIds: Set<string>;
  onToggleItem: (id: string) => void;
  onToggleShop: (ids: string[], select: boolean) => void;
  onRemoveShop: () => void;
  onRemoveItem: (id: string) => void;
  onRefresh: () => void;
}

export function CartShopGroup({
  group,
  vndPerCny,
  selectedIds,
  onToggleItem,
  onToggleShop,
  onRemoveShop,
  onRemoveItem,
  onRefresh,
}: CartShopGroupProps) {
  const [services, setServices] = useState<Record<string, boolean>>({});
  const [removingShop, setRemovingShop] = useState(false);

  const shopItemIds = group.items.map((i) => i.id);
  const allSelected = shopItemIds.every((id) => selectedIds.has(id));
  const someSelected = shopItemIds.some((id) => selectedIds.has(id));

  const shopTotalVnd = useMemo(
    () =>
      group.items
        .filter((i) => selectedIds.has(i.id))
        .reduce((sum, i) => sum + cnyToVnd(Number(i.priceCny) * i.quantity, vndPerCny), 0),
    [group.items, selectedIds, vndPerCny],
  );

  const handleRemoveShop = async () => {
    setRemovingShop(true);
    try {
      await cartService.removeShop(group.shopKey);
      onRemoveShop();
      onRefresh();
      toast.success('Đã xóa shop khỏi giỏ hàng');
    } catch {
      toast.error('Không thể xóa shop');
    } finally {
      setRemovingShop(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      {/* Shop header */}
      <div className="flex items-center gap-3 bg-red-600 px-4 py-2.5 text-white">
        <input
          type="checkbox"
          checked={allSelected}
          ref={(el) => {
            if (el) el.indeterminate = someSelected && !allSelected;
          }}
          onChange={() => onToggleShop(shopItemIds, !allSelected)}
          className="h-4 w-4 accent-white cursor-pointer"
        />
        <span className="flex-1 truncate text-sm font-medium">
          Tên shop: {group.shopName}
        </span>
        <button
          type="button"
          disabled={removingShop}
          onClick={handleRemoveShop}
          className="rounded p-1 hover:bg-red-700 disabled:opacity-50"
          title="Xóa shop"
        >
          {removingShop ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Items table */}
        <div className="min-w-0 flex-1 overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="border-b bg-gray-50 text-xs text-gray-500">
              <tr>
                <th className="w-10 px-2 py-2">Chọn</th>
                <th className="px-3 py-2 text-left">Thông tin sản phẩm</th>
                <th className="w-20 px-2 py-2">SL</th>
                <th className="w-28 px-2 py-2 text-right">Đơn giá</th>
                <th className="w-28 px-2 py-2 text-right">Thành tiền</th>
                <th className="w-10 px-2 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {group.items.map((item) => (
                <CartItemTableRow
                  key={item.id}
                  item={item}
                  vndPerCny={vndPerCny}
                  selected={selectedIds.has(item.id)}
                  onToggle={() => onToggleItem(item.id)}
                  onRemove={() => onRemoveItem(item.id)}
                  onRefresh={onRefresh}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Shop sidebar */}
        <aside className="w-full shrink-0 border-t border-sky-100 bg-sky-50 p-4 lg:w-56 lg:border-l lg:border-t-0">
          <p className="mb-3 text-xs font-semibold text-sky-800">Dịch vụ tuỳ chọn</p>
          <div className="space-y-2">
            {SHOP_SERVICES.map((svc) => (
              <label key={svc.id} className="flex cursor-pointer items-center gap-2 text-xs text-gray-700">
                <input
                  type="checkbox"
                  checked={!!services[svc.id]}
                  onChange={(e) =>
                    setServices((prev) => ({ ...prev, [svc.id]: e.target.checked }))
                  }
                  className="h-3.5 w-3.5 accent-sky-600"
                />
                {svc.label}
              </label>
            ))}
          </div>
          <div className="mt-4 border-t border-sky-200 pt-3">
            <p className="text-xs text-gray-600">Tổng tiền đơn hàng</p>
            <p className="text-xs text-gray-500">Tiền hàng</p>
            <p className="text-lg font-bold text-red-600">{formatVnd(shopTotalVnd)}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function CartItemTableRow({
  item,
  vndPerCny,
  selected,
  onToggle,
  onRemove,
  onRefresh,
}: {
  item: CartItem;
  vndPerCny: number;
  selected: boolean;
  onToggle: () => void;
  onRemove: () => void;
  onRefresh: () => void;
}) {
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
    } catch (err: unknown) {
      setQty(item.quantity);
      const msg = (err as { response?: { data?: { message?: string | string[] } } })?.response
        ?.data?.message;
      toast.error(
        Array.isArray(msg) ? msg[0] : msg || 'Không thể cập nhật số lượng',
      );
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

  const adjustQty = (delta: number) => {
    const next = Math.max(1, qty + delta);
    setQty(next);
    void persistQty(next);
  };

  const saveNote = async () => {
    const trimmed = note.trim();
    if (trimmed === (item.note ?? '')) return;
    try {
      await cartService.updateItem(item.id, { note: trimmed });
      onRefresh();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string | string[] } } })?.response
        ?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : msg || 'Không thể lưu ghi chú');
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

  return (
    <tr className={cn(selected && 'bg-amber-50/40')}>
      <td className="px-2 py-3 text-center align-top">
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggle}
          className="h-4 w-4 accent-red-600 cursor-pointer"
        />
      </td>
      <td className="px-3 py-3 align-top">
        <div className="flex gap-3">
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded border bg-gray-50">
            {item.image ? (
              <img
                src={productsService.imageProxyUrl(item.image)}
                alt=""
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : null}
          </div>
          <div className="min-w-0 flex-1 space-y-1.5">
            <p className="line-clamp-2 text-sm font-medium text-gray-800">{item.title}</p>
            {propsText && (
              <p className="text-xs text-gray-500">
                <span className="font-medium text-gray-600">Thuộc tính:</span> {propsText}
              </p>
            )}
            <div>
              <label className="text-xs text-gray-500">Ghi chú</label>
              <Input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                onBlur={saveNote}
                placeholder="Ghi chú cho sản phẩm..."
                className="mt-0.5 h-8 text-xs"
              />
            </div>
          </div>
        </div>
      </td>
      <td className="px-2 py-3 align-top">
        <div className="flex items-center justify-center gap-0.5">
          <button
            type="button"
            disabled={updating || qty <= 1}
            onClick={() => adjustQty(-1)}
            className="flex h-7 w-7 items-center justify-center rounded border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
          >
            <Minus className="h-3 w-3" />
          </button>
          <Input
            type="number"
            min={1}
            value={qty}
            disabled={updating}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10);
              if (Number.isNaN(v)) {
                setQty(1);
                return;
              }
              setQty(v);
              scheduleQtySave(v);
            }}
            onBlur={commitQty}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.currentTarget.blur();
              }
            }}
            className="h-8 w-14 text-center text-sm [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <button
            type="button"
            disabled={updating}
            onClick={() => adjustQty(1)}
            className="flex h-7 w-7 items-center justify-center rounded border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
      </td>
      <td className="px-2 py-3 align-top text-right text-xs">
        <p className="font-medium">¥{Number(item.priceCny).toFixed(0)}</p>
        <p className="text-gray-500">{formatVnd(cnyToVnd(item.priceCny, vndPerCny))}</p>
      </td>
      <td className="px-2 py-3 align-top text-right font-semibold text-gray-800">
        {formatVnd(lineVnd)}
      </td>
      <td className="px-2 py-3 align-top text-center">
        <button
          type="button"
          disabled={removing}
          onClick={handleRemove}
          className="text-red-400 hover:text-red-600"
        >
          {removing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        </button>
      </td>
    </tr>
  );
}

export function groupCartByShop(items: CartItem[]): ShopGroup[] {
  const map = new Map<string, ShopGroup>();
  for (const item of items) {
    const shopKey = getShopKey(item);
    const shopName = item.shopName || item.shopId || 'Shop không xác định';
    if (!map.has(shopKey)) {
      map.set(shopKey, { shopKey, shopName, items: [] });
    }
    map.get(shopKey)!.items.push(item);
  }
  return Array.from(map.values());
}
