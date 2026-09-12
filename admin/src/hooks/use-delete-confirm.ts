'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { apiErrorMessage } from '@/lib/api-error';

/**
 * In-row delete confirmation: the first click arms the row, the second one
 * sends the request. One row can be armed at a time.
 */
export function useDeleteConfirm(
  remove: (id: string) => Promise<unknown>,
  { successMessage, errorMessage, onDone }: {
    successMessage: string;
    errorMessage: string;
    onDone?: () => void;
  },
) {
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const confirm = async (id: string) => {
    setDeletingId(id);
    try {
      await remove(id);
      toast.success(successMessage);
      setConfirmingId(null);
      onDone?.();
    } catch (err) {
      toast.error(apiErrorMessage(err, errorMessage));
    } finally {
      setDeletingId(null);
    }
  };

  return {
    confirmingId,
    deletingId,
    arm: setConfirmingId,
    cancel: () => setConfirmingId(null),
    confirm,
  };
}
