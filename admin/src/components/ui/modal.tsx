'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { icon } from '@/lib/icon';
import { cn } from '@/lib/utils';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Footer actions; rendered on a rule at the bottom of the sheet. */
  footer?: React.ReactNode;
  size?: 'md' | 'lg' | 'xl';
  children: React.ReactNode;
};

const WIDTHS = {
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-3xl',
} as const;

/**
 * Every create and edit form in the admin opens through this one sheet, so
 * the scrim, the escape key, the scroll behaviour and the close control are
 * identical everywhere. The entry is the single deliberate motion in the app.
 */
export function Modal({ open, onClose, title, footer, size = 'xl', children }: ModalProps) {
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Move focus into the sheet so the keyboard lands where the eye does.
    sheetRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="dock-scrim fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={cn(
          'dock-modal flex max-h-[92vh] w-full flex-col rounded-[var(--radius-panel)] border border-[var(--rule)] bg-[var(--sheet-white)] shadow-[var(--lift-modal)] outline-none',
          WIDTHS[size],
        )}
      >
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-[var(--rule)] px-5 py-3.5">
          <h2 className="font-heading text-base font-semibold text-[var(--ink)]">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="flex size-8 items-center justify-center rounded-[var(--radius-control)] text-[var(--graphite)] hover:bg-[var(--wash)] hover:text-[var(--ink)]"
          >
            <X {...icon('control')} aria-hidden />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>

        {footer && (
          <div className="flex shrink-0 items-center justify-end gap-3 border-t border-[var(--rule)] bg-[var(--wash)]/60 px-5 py-3.5">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

/** A labelled group of fields inside a modal form. */
export function ModalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-[var(--rule)] px-5 py-4 last:border-b-0">
      <h3 className="mb-3 text-sm font-semibold text-[var(--ink)]">{title}</h3>
      {children}
    </section>
  );
}
