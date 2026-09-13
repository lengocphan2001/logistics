'use client';

import { useQuery } from '@tanstack/react-query';
import { addressesService, type CustomerAddress } from '@/services/addresses.service';
import { cn } from '@/lib/utils';

export const savedAddressesKey = ['customer', 'addresses'] as const;

type SavedAddressPickerProps = {
  /** Fills the receiver fields from the chosen entry. */
  onPick: (address: CustomerAddress) => void;
};

/**
 * Shown above the receiver fields when the customer has saved addresses.
 * Picking one fills the form; the fields stay editable, so a one-off delivery
 * does not have to be saved first.
 */
export function SavedAddressPicker({ onPick }: SavedAddressPickerProps) {
  const { data: addresses = [] } = useQuery({
    queryKey: savedAddressesKey,
    queryFn: async () => (await addressesService.list()).data,
    staleTime: 5 * 60 * 1000,
  });

  if (addresses.length === 0) return null;

  return (
    <div className="mb-4 border-b border-[var(--rule)] pb-4">
      <p className="text-sm font-semibold text-[var(--ink)]">Địa chỉ đã lưu</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {addresses.map((address) => (
          <button
            key={address.id}
            type="button"
            onClick={() => onPick(address)}
            className={cn(
              'max-w-full rounded-[var(--radius-control)] border px-3 py-2 text-left text-xs outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--manifest-navy)]',
              address.isDefault
                ? 'border-[var(--manifest-navy)]'
                : 'border-[var(--rule-strong)] hover:border-[var(--manifest-navy)]',
            )}
          >
            <span className="block font-semibold text-[var(--ink)]">
              {address.label || address.receiverName}
            </span>
            <span className="block truncate text-[var(--graphite)]">
              {address.receiverPhone} — {address.receiverAddress}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
