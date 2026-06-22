export function formatCny(value: number | string) {
  const num = Number(value);
  return `¥${new Intl.NumberFormat('vi-VN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)}`;
}

export function formatVnd(value: number | string) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value));
}

export function cnyToVnd(cny: number | string, vndPerCny: number) {
  return Number(cny) * vndPerCny;
}
