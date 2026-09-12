import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

type DateInput = string | number | Date;

/** `12/06/2025` */
export function formatDate(value: DateInput): string {
  return format(new Date(value), 'dd/MM/yyyy', { locale: vi });
}

/** `12/06/2025 14:30` */
export function formatDateTime(value: DateInput): string {
  return format(new Date(value), 'dd/MM/yyyy HH:mm', { locale: vi });
}
