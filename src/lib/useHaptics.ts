"use client";

import { useCallback } from "react";

/**
 * Lightweight haptic feedback using the Vibration API where it exists.
 *
 * Note: iOS Safari does not expose the Vibration API, so this is a graceful
 * no-op there. On Android Chrome and other supporting devices it produces a
 * short, satisfying tap. The CSS press animations carry the tactile feel
 * everywhere else.
 */
export type HapticPattern = "tap" | "double" | "celebrate";

const PATTERNS: Record<HapticPattern, number | number[]> = {
  tap: 12,
  double: [10, 40, 10],
  celebrate: [12, 30, 12, 30, 24],
};

export function useHaptics() {
  return useCallback((pattern: HapticPattern = "tap") => {
    if (typeof navigator === "undefined" || !("vibrate" in navigator)) return;
    try {
      navigator.vibrate(PATTERNS[pattern]);
    } catch {
      /* ignore — some browsers throw if called without a user gesture */
    }
  }, []);
}
