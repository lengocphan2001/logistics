'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * The one deliberate motion moment in the interface: confirming that an item
 * landed in the cart. Everything else changes colour and nothing else.
 *
 * Returns `committed`, which stays true long enough for the button to show a
 * check mark, then resets so the control can be used again.
 */
export function useCommitFeedback(holdMs = 1100) {
  const [committed, setCommitted] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const commit = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    setCommitted(true);
    timer.current = setTimeout(() => setCommitted(false), holdMs);
  }, [holdMs]);

  return { committed, commit };
}
