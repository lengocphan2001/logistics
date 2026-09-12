'use client';

import { useEffect, type DependencyList } from 'react';

/**
 * Runs an effect after the dependencies have been still for `delay`.
 *
 * Every list screen refetches when a search box or a filter changes; without
 * this each keystroke would be a request.
 */
export function useDebouncedEffect(
  effect: () => void,
  deps: DependencyList,
  delay = 300,
) {
  useEffect(() => {
    const timer = setTimeout(effect, delay);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, delay]);
}
