/**
 * Icon system.
 *
 * One stroke weight (also enforced in globals.css) and three sizes tied to
 * context, so an icon never drifts a pixel between two similar controls.
 *
 *   inline  (16) — inside a button or a line of text
 *   control (20) — navigation, top bar actions, form affordances
 *   page    (24) — page-level status and empty states
 *
 * Colour always comes from the palette via `currentColor`; icons never
 * introduce a hue of their own.
 */
export const ICON_STROKE = 1.75;

export const ICON_SIZE = {
  inline: 16,
  control: 20,
  page: 24,
} as const;

export type IconSize = keyof typeof ICON_SIZE;

/** Spread onto any lucide icon: `<ShoppingCart {...icon('inline')} />` */
export function icon(size: IconSize = 'inline') {
  return { size: ICON_SIZE[size], strokeWidth: ICON_STROKE } as const;
}
