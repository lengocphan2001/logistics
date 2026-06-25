export const DEFAULT_CORS_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://tamanlogistics.vn',
  'https://www.tamanlogistics.vn',
  'https://admin.tamanlogistics.vn',
];

export function getCorsOrigins(): string[] {
  const fromEnv = process.env.CORS_ORIGINS?.split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  if (fromEnv?.length) return fromEnv;

  if (process.env.NODE_ENV === 'production') {
    return DEFAULT_CORS_ORIGINS.filter((o) => o.startsWith('https://'));
  }

  return DEFAULT_CORS_ORIGINS;
}
