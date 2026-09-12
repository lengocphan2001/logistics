import type { SkuPropertyPair } from './interfaces/product-provider.interface';

/**
 * Stored SKU properties are complete only when they also carry the original
 * marketplace wording. A row saved before that existed has the Vietnamese
 * labels alone, which staff cannot match on the shop page, so it is refreshed
 * the next time the cart or the checkout touches it.
 */
export function needsSourceProperties(props: unknown): boolean {
  if (!Array.isArray(props) || props.length === 0) return true;
  return !props.some(
    (p) => typeof (p as SkuPropertyPair)?.valueOriginal === 'string',
  );
}
