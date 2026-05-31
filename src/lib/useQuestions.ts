"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ActiveQuestion, CategoryId } from "./types";
import { CATEGORIES, QUESTIONS, getCategory } from "./categories";

/**
 * Engine for picking questions so that none repeat until every question in a
 * category has been used. We keep a shuffled "bag" of remaining indices per
 * category; when a bag empties, we reshuffle the whole category and start over.
 *
 * Progress (the bags + a running total) is persisted to localStorage so the
 * experience is remembered across visits.
 *
 * The bags live in a ref (not React state) so that `draw` can compute and
 * RETURN the chosen question synchronously. That lets the caller speak it
 * immediately inside the tap handler — required by iOS Safari, which only
 * allows speech synthesis that begins within a user gesture.
 */

const STORAGE_KEY = "huntrtable:progress:v1";
const CONFETTI_EVERY = 25;

interface PersistedState {
  /** Remaining (unused) question indices for each category. */
  bags: Record<CategoryId, number[]>;
  /** Total questions drawn across the whole app, used for the confetti milestone. */
  total: number;
}

/** Fisher–Yates shuffle returning a new array. */
function shuffle<T>(input: T[]): T[] {
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** A freshly shuffled bag of every index for a category. */
function fullBag(id: CategoryId): number[] {
  return shuffle(QUESTIONS[id].map((_, i) => i));
}

function makeInitialBags(): Record<CategoryId, number[]> {
  const bags = {} as Record<CategoryId, number[]>;
  for (const c of CATEGORIES) bags[c.id] = fullBag(c.id);
  return bags;
}

function loadState(): PersistedState {
  const fallback: PersistedState = { bags: makeInitialBags(), total: 0 };
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    // Merge defensively so a data change can't break loading.
    if (parsed.bags) {
      for (const c of CATEGORIES) {
        const saved = parsed.bags[c.id];
        if (Array.isArray(saved)) {
          // Drop any indices that no longer exist in the current data.
          const valid = saved.filter(
            (i) => Number.isInteger(i) && i >= 0 && i < QUESTIONS[c.id].length,
          );
          fallback.bags[c.id] = valid.length ? valid : fullBag(c.id);
        }
      }
    }
    if (typeof parsed.total === "number" && parsed.total >= 0) {
      fallback.total = parsed.total;
    }
    return fallback;
  } catch {
    return fallback;
  }
}

export interface UseQuestions {
  /** The question currently on screen, or null before the first draw. */
  current: ActiveQuestion | null;
  /** Total questions drawn this device, across all categories. */
  total: number;
  /** Whether the persisted state has hydrated (avoids SSR flash). */
  ready: boolean;
  /** Draw a new question from a specific category. Returns the chosen question. */
  draw: (id: CategoryId) => ActiveQuestion;
  /** Draw from a randomly chosen category ("Surprise Me"). */
  drawRandom: () => ActiveQuestion;
  /** Re-draw the next question from the current category (or random if none). */
  next: () => ActiveQuestion;
  /** Reset all progress back to fresh, full bags. */
  reset: () => void;
  /** Fires (with the new total) whenever a confetti milestone is reached. */
  onMilestone: (cb: (total: number) => void) => void;
}

export function useQuestions(): UseQuestions {
  // Source of truth for bags/total lives in refs so draws are synchronous.
  const bagsRef = useRef<Record<CategoryId, number[]>>(makeInitialBags());
  const totalRef = useRef(0);

  // Mirrored into state only for rendering.
  const [current, setCurrent] = useState<ActiveQuestion | null>(null);
  const [total, setTotal] = useState(0);
  const [ready, setReady] = useState(false);
  const milestoneCb = useRef<((total: number) => void) | null>(null);

  // Hydrate from localStorage after mount (keeps server/client markup identical).
  useEffect(() => {
    const loaded = loadState();
    bagsRef.current = loaded.bags;
    totalRef.current = loaded.total;
    setTotal(loaded.total);
    setReady(true);
  }, []);

  const persist = useCallback(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ bags: bagsRef.current, total: totalRef.current }),
      );
    } catch {
      /* storage may be unavailable (private mode) — fail silently */
    }
  }, []);

  const draw = useCallback(
    (id: CategoryId): ActiveQuestion => {
      // Refill the bag if it has been emptied.
      let bag = bagsRef.current[id];
      if (!bag || bag.length === 0) bag = fullBag(id);

      const [index, ...rest] = bag;
      bagsRef.current = { ...bagsRef.current, [id]: rest };

      const question: ActiveQuestion = {
        category: getCategory(id),
        text: QUESTIONS[id][index],
      };

      totalRef.current += 1;
      setTotal(totalRef.current);
      setCurrent(question);
      persist();

      if (totalRef.current % CONFETTI_EVERY === 0) {
        milestoneCb.current?.(totalRef.current);
      }
      return question;
    },
    [persist],
  );

  const drawRandom = useCallback((): ActiveQuestion => {
    const id = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)].id;
    return draw(id);
  }, [draw]);

  const next = useCallback((): ActiveQuestion => {
    return current ? draw(current.category.id) : drawRandom();
  }, [current, draw, drawRandom]);

  const reset = useCallback(() => {
    bagsRef.current = makeInitialBags();
    totalRef.current = 0;
    setTotal(0);
    setCurrent(null);
    persist();
  }, [persist]);

  const onMilestone = useCallback((cb: (total: number) => void) => {
    milestoneCb.current = cb;
  }, []);

  return { current, total, ready, draw, drawRandom, next, reset, onMilestone };
}
