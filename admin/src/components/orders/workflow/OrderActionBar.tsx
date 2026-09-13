'use client';

import { Button } from '@/components/ui/button';
import type { OrderSummary } from '@/services/orders.service';
import {
  ORDER_ACTIONS,
  actionLabel,
  availableActions,
  type OrderActionKey,
} from '@/lib/order-workflow';

type OrderActionBarProps = {
  summary: OrderSummary;
  busy: boolean;
  onAction: (key: OrderActionKey) => void;
};

/**
 * Only the steps this order can actually take next, in the order they happen.
 * A consignment never shows "đã mua", and nothing shows once the order closes,
 * so staff are never offered a button that would only return an error.
 */
export function OrderActionBar({ summary, busy, onAction }: OrderActionBarProps) {
  const actions = availableActions(summary);

  if (actions.length === 0) {
    return (
      <p data-prose className="text-sm">
        Đơn đã kết thúc, không còn bước xử lý nào.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((key) => {
        const tone = ORDER_ACTIONS[key].tone;
        return (
          <Button
            key={key}
            variant={tone === 'primary' ? 'default' : tone}
            disabled={busy}
            onClick={() => onAction(key)}
          >
            {actionLabel(key, summary)}
          </Button>
        );
      })}
    </div>
  );
}
