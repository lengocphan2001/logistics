import { ShieldCheck, Truck } from 'lucide-react';
import { exampleShipment } from '@/components/landing/landing-content';
import { icon } from '@/lib/icon';
import { cn } from '@/lib/utils';

/**
 * A worked example of a shipment, shown as the record the customer will
 * actually read in the portal. No decorative chrome: the panel is the same
 * hairline sheet used everywhere else.
 */
export function ShipmentExample() {
  const { code, weight, shippingFee, legs } = exampleShipment;

  return (
    <div className="panel mx-auto w-full max-w-lg p-5 lg:max-w-none">
      <div className="flex items-center justify-between border-b border-[var(--rule)] pb-3">
        <span className="text-sm font-semibold text-[var(--ink)]">Đang vận chuyển</span>
        <span className="font-mono text-xs font-semibold text-[var(--manifest-navy)]">
          {code}
        </span>
      </div>

      <ol className="mt-4 space-y-4">
        {legs.map((leg) => (
          <li key={leg.label} className="flex items-start gap-3">
            <span
              className={cn(
                'mt-0.5 flex size-8 shrink-0 items-center justify-center border',
                leg.done
                  ? 'border-[var(--ledger-green)] text-[var(--ledger-green)]'
                  : 'border-[var(--rule-strong)] text-[var(--graphite)]',
              )}
            >
              {leg.done ? (
                <ShieldCheck {...icon('inline')} aria-hidden />
              ) : (
                <Truck {...icon('inline')} aria-hidden />
              )}
            </span>
            <span>
              <span className="block text-sm font-semibold text-[var(--ink)]">
                {leg.label}
              </span>
              <span className="block text-xs text-[var(--graphite)]">{leg.sub}</span>
            </span>
          </li>
        ))}
      </ol>

      <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-[var(--rule)] pt-4">
        <div>
          <dt className="text-xs text-[var(--graphite)]">Cân nặng</dt>
          <dd data-numeric className="mt-0.5 text-sm font-bold text-[var(--ink)]">
            {weight}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-[var(--graphite)]">Phí vận chuyển</dt>
          <dd data-numeric className="mt-0.5 text-sm font-bold text-[var(--seal-red)]">
            {shippingFee}
          </dd>
        </div>
      </dl>
    </div>
  );
}
