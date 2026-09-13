'use client';

import { formatCny, formatVnd } from '@/lib/currency';
import type { OrderAmounts, Order } from '@/services/orders.service';

type OrderAmountsPanelProps = {
  order: Order;
  amounts: OrderAmounts;
};

/**
 * The one number staff keep asking for is "còn phải thu". Everything else on
 * this panel exists to explain how that number was reached, so it is the only
 * line given weight.
 */
export function OrderAmountsPanel({ order, amounts }: OrderAmountsPanelProps) {
  const rows: { label: string; value: string; hint?: string }[] = [
    {
      label: order.type === 'CONSIGNMENT' ? 'Tiền hàng (khách tự trả)' : 'Tiền hàng',
      value: formatCny(amounts.goodsCny),
    },
    {
      label: 'Phí dịch vụ và vận chuyển',
      value: formatVnd(amounts.feesVnd),
      hint: formatCny(amounts.feesCny),
    },
    { label: 'Đã thu từ ví', value: formatCny(amounts.paidCny) },
  ];

  return (
    <section className="panel">
      <h2 className="border-b border-[var(--rule)] px-5 py-3.5 font-heading text-base font-semibold text-[var(--ink)]">
        Công nợ đơn hàng
      </h2>

      <dl className="divide-y divide-[var(--rule)]">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-baseline justify-between gap-4 px-5 py-3"
          >
            <dt className="text-sm text-[var(--graphite)]">{row.label}</dt>
            <dd className="text-right">
              <span data-numeric className="text-sm text-[var(--ink)]">
                {row.value}
              </span>
              {row.hint && (
                <span data-numeric className="ml-2 text-xs text-[var(--graphite)]">
                  {row.hint}
                </span>
              )}
            </dd>
          </div>
        ))}

        <div className="flex items-baseline justify-between gap-4 bg-[var(--wash)]/60 px-5 py-3.5">
          <dt className="text-sm font-semibold text-[var(--ink)]">
            {amounts.overpaidCny > 0 ? 'Thu thừa, cần hoàn' : 'Còn phải thu'}
          </dt>
          <dd
            data-numeric
            className={
              amounts.dueCny > 0
                ? 'text-base font-bold text-[var(--seal-red)]'
                : 'text-base font-bold text-[var(--ledger-green)]'
            }
          >
            {formatCny(
              amounts.overpaidCny > 0 ? amounts.overpaidCny : amounts.dueCny,
            )}
          </dd>
        </div>
      </dl>

      <p data-prose className="border-t border-[var(--rule)] px-5 py-3 text-xs">
        Quy đổi theo tỉ giá {formatVnd(amounts.exchangeRate)} cho mỗi ¥1.
      </p>
    </section>
  );
}
