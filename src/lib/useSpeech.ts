"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Thin wrapper around the browser Speech Synthesis API.
 *
 * Picks a friendly, natural-sounding English voice when available and speaks
 * slightly slower than default with a warm, conversational tone. The on/off
 * preference is remembered in localStorage.
 */

const STORAGE_KEY = "huntrtable:speech-enabled:v1";

/** Voice names we prefer, in priority order — these tend to sound most natural. */
const PREFERRED_VOICES = [
  "Samantha", // iOS / macOS
  "Google US English",
  "Microsoft Aria",
  "Microsoft Jenny",
  "Karen",
  "Moira",
];

function pickVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (voices.length === 0) return null;
  const english = voices.filter((v) => v.lang.toLowerCase().startsWith("en"));
  const pool = english.length ? english : voices;

  for (const name of PREFERRED_VOICES) {
    const match = pool.find((v) => v.name.includes(name));
    if (match) return match;
  }
  // Otherwise prefer a local (non-network), default voice.
  return (
    pool.find((v) => v.localService && v.default) ??
    pool.find((v) => v.default) ??
    pool[0]
  );
}

export interface UseSpeech {
  enabled: boolean;
  supported: boolean;
  /** Toggle speech on/off (persisted). Cancels any current speech when turned off. */
  toggle: () => void;
  /** Speak the given text aloud (no-op when disabled or unsupported). */
  speak: (text: string) => void;
  /** Stop any in-progress speech. */
  cancel: () => void;
}

export function useSpeech(): UseSpeech {
  const [enabled, setEnabled] = useState(true);
  const [supported, setSupported] = useState(false);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    const isSupported =
      typeof window !== "undefined" && "speechSynthesis" in window;
    setSupported(isSupported);
    if (!isSupported) return;

    // Restore saved preference.
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved !== null) setEnabled(saved === "true");
    } catch {
      /* ignore */
    }

    const loadVoices = () => {
      voiceRef.current = pickVoice(window.speechSynthesis.getVoices());
    };
    loadVoices();
    // Voices often load asynchronously, especially on first visit.
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
    };
  }, []);

  const cancel = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (!supported || !enabled) return;
      const synth = window.speechSynthesis;
      synth.cancel(); // Interrupt anything already playing.

      const utter = new SpeechSynthesisUtterance(text);
      if (voiceRef.current) utter.voice = voiceRef.current;
      utter.rate = 0.92; // A touch slower than default for a relaxed feel.
      utter.pitch = 1.05; // Slightly warm and friendly.
      utter.volume = 1;
      synth.speak(utter);
    },
    [supported, enabled],
  );

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const nextVal = !prev;
      if (!nextVal) cancel(); // Going silent — stop talking immediately.
      try {
        window.localStorage.setItem(STORAGE_KEY, String(nextVal));
      } catch {
        /* ignore */
      }
      return nextVal;
    });
  }, [cancel]);

  return { enabled, supported, toggle, speak, cancel };
}
