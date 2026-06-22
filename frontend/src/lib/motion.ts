'use client';

import { useReducedMotion } from 'framer-motion';

export function useMotionSafe() {
  const reduced = useReducedMotion();
  return { reduced: reduced ?? false };
}

export const easeOut = [0.22, 1, 0.36, 1] as const;

export function fadeUp(reduced: boolean, delay = 0) {
  if (reduced) {
    return {
      initial: { opacity: 1, y: 0 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0 },
    };
  }
  return {
    initial: { opacity: 0, y: 28 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.55, delay, ease: easeOut },
  };
}

export function fadeIn(reduced: boolean, delay = 0) {
  if (reduced) {
    return {
      initial: { opacity: 1 },
      whileInView: { opacity: 1 },
      transition: { duration: 0 },
    };
  }
  return {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-60px' },
    transition: { duration: 0.5, delay, ease: easeOut },
  };
}

export function scaleIn(reduced: boolean, delay = 0) {
  if (reduced) {
    return {
      initial: { opacity: 1, scale: 1 },
      whileInView: { opacity: 1, scale: 1 },
      transition: { duration: 0 },
    };
  }
  return {
    initial: { opacity: 0, scale: 0.96 },
    whileInView: { opacity: 1, scale: 1 },
    viewport: { once: true, margin: '-40px' },
    transition: { duration: 0.45, delay, ease: easeOut },
  };
}
