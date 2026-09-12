'use client';

import Link from 'next/link';
import { Loader2, Pencil, Trash2 } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { icon } from '@/lib/icon';
import { cn } from '@/lib/utils';

type RowActionsProps = {
  /** Optional detail page for this row. */
  viewHref?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  /** The row currently awaiting a delete confirmation. */
  confirming?: boolean;
  onConfirmDelete?: () => void;
  onCancelDelete?: () => void;
  deleting?: boolean;
  label: string;
};

/**
 * The same three controls at the end of every table row. Deleting asks in
 * place rather than opening a dialog: the row itself is the context.
 */
export function RowActions({
  viewHref,
  onEdit,
  onDelete,
  confirming = false,
  onConfirmDelete,
  onCancelDelete,
  deleting = false,
  label,
}: RowActionsProps) {
  if (confirming) {
    return (
      <div className="flex items-center justify-end gap-2">
        <span className="text-xs text-[var(--graphite)]">Xoá?</span>
        <Button
          variant="destructive"
          size="sm"
          onClick={onConfirmDelete}
          disabled={deleting}
        >
          {deleting ? (
            <Loader2 {...icon('inline')} aria-hidden className="animate-spin" />
          ) : (
            'Xoá'
          )}
        </Button>
        <Button variant="ghost" size="sm" onClick={onCancelDelete}>
          Huỷ
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-end gap-1">
      {viewHref && (
        <Link
          href={viewHref}
          aria-label={`Xem ${label}`}
          className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}
        >
          Chi tiết
        </Link>
      )}
      {onEdit && (
        <Button variant="ghost" size="icon-sm" onClick={onEdit} aria-label={`Sửa ${label}`}>
          <Pencil {...icon('inline')} aria-hidden />
        </Button>
      )}
      {onDelete && (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onDelete}
          aria-label={`Xoá ${label}`}
          className="hover:bg-[var(--red-wash)] hover:text-[var(--seal-red)]"
        >
          <Trash2 {...icon('inline')} aria-hidden />
        </Button>
      )}
    </div>
  );
}
