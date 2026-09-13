import api from '@/lib/api';

/**
 * Export endpoints sit behind the same bearer token as everything else, so a
 * plain link would return 401. Fetch through the API client, then hand the
 * blob to the browser as a download.
 */
export async function downloadFile(
  url: string,
  params?: Record<string, string | undefined>,
) {
  const res = await api.get(url, { params, responseType: 'blob' });

  const disposition = String(res.headers['content-disposition'] ?? '');
  const match = disposition.match(/filename="?([^";]+)"?/i);
  const filename = match?.[1] ?? 'export.csv';

  const objectUrl = URL.createObjectURL(res.data as Blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}
