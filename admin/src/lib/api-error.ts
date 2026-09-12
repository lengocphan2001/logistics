/**
 * The API returns validation problems as `{ message: string | string[] }`.
 * These helpers replace the hand-written cast that was repeated at every
 * catch site.
 */
type ApiErrorShape = {
  response?: { data?: { message?: string | string[] } };
};

/** Every message the server sent, or undefined when it sent none. */
export function apiErrorMessages(err: unknown): string[] | undefined {
  const message = (err as ApiErrorShape)?.response?.data?.message;
  if (message == null) return undefined;
  const list = Array.isArray(message) ? message : [message];
  const cleaned = list.filter((m) => typeof m === 'string' && m.length > 0);
  return cleaned.length > 0 ? cleaned : undefined;
}

/** The first message the server sent, falling back to a local wording. */
export function apiErrorMessage(err: unknown, fallback: string): string {
  return apiErrorMessages(err)?.[0] ?? fallback;
}
