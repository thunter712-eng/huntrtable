"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Wrapper around the browser Speech Synthesis API.
 *
 * Voice quality is entirely determined by what's installed on the device, so
 * we (a) rank the available voices and auto-pick the most natural one, and
 * (b) let the user override that choice (persisted). Speech plays slightly
 * slower than default with a warm, conversational tone.
 */

const ENABLED_KEY = "huntrtable:speech-enabled:v1";
const VOICE_KEY = "huntrtable:voice:v1";

/**
 * Score a voice for "naturalness". Modern OSes label their high-quality voices
 * with these keywords; the named voices are known-good defaults per platform.
 * Higher is better.
 */
function scoreVoice(v: SpeechSynthesisVoice): number {
  const id = `${v.name} ${v.voiceURI}`.toLowerCase();
  let s = 0;

  if (id.includes("siri")) s += 120;
  if (id.includes("natural") || id.includes("neural")) s += 100;
  if (id.includes("premium") || id.includes("enhanced")) s += 80;

  // Known pleasant voices across iOS/macOS, Windows, Android, Chrome.
  const goodNames = [
    "ava", "samantha", "allison", "serena", "nicky", "zoe", // Apple
    "aria", "jenny", "guy", "michelle", "zira", // Microsoft
    "google us english", "google uk english female", // Chrome/Android
    "karen", "moira", "tessa", "fiona", "daniel", "kate",
  ];
  if (goodNames.some((n) => id.includes(n))) s += 35;

  const lang = v.lang.toLowerCase();
  if (lang === "en-us") s += 10;
  else if (lang.startsWith("en")) s += 5;

  if (v.default) s += 5;
  return s;
}

/** English voices only, sorted best-first. */
function rankEnglishVoices(all: SpeechSynthesisVoice[]): SpeechSynthesisVoice[] {
  const english = all.filter((v) => v.lang.toLowerCase().startsWith("en"));
  const pool = english.length ? english : all;
  return [...pool].sort((a, b) => scoreVoice(b) - scoreVoice(a));
}

export interface UseSpeech {
  enabled: boolean;
  supported: boolean;
  /** English voices available on this device, best-first. */
  voices: SpeechSynthesisVoice[];
  /** voiceURI of the chosen voice, or "" for automatic (best available). */
  voiceURI: string;
  /** Choose a specific voice (persisted). Pass "" to return to automatic. */
  setVoice: (uri: string) => void;
  /** Re-query the OS for installed voices (picks up newly downloaded ones). */
  refreshVoices: () => void;
  /** Toggle speech on/off (persisted). Cancels current speech when turned off. */
  toggle: () => void;
  /** Speak the given text aloud (no-op when disabled or unsupported). */
  speak: (text: string) => void;
  /** Stop any in-progress speech. */
  cancel: () => void;
}

export function useSpeech(): UseSpeech {
  const [enabled, setEnabled] = useState(true);
  const [supported, setSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceURI, setVoiceURI] = useState("");

  // Mirror voices/selection into refs so speak() always sees current values.
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const voiceURIRef = useRef("");

  /** Re-query the OS voice list and update state if it changed. */
  const refreshVoices = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const ranked = rankEnglishVoices(window.speechSynthesis.getVoices());
    if (ranked.length === 0) return;
    // Only update state when the set of voices actually changed (avoids churn).
    const sig = (list: SpeechSynthesisVoice[]) =>
      list.map((v) => v.voiceURI).join("|");
    if (sig(ranked) !== sig(voicesRef.current)) {
      voicesRef.current = ranked;
      setVoices(ranked);
    }
  }, []);

  useEffect(() => {
    const isSupported =
      typeof window !== "undefined" && "speechSynthesis" in window;
    setSupported(isSupported);
    if (!isSupported) return;

    try {
      const savedEnabled = window.localStorage.getItem(ENABLED_KEY);
      if (savedEnabled !== null) setEnabled(savedEnabled === "true");
      const savedVoice = window.localStorage.getItem(VOICE_KEY);
      if (savedVoice) {
        setVoiceURI(savedVoice);
        voiceURIRef.current = savedVoice;
      }
    } catch {
      /* ignore */
    }

    refreshVoices();
    // Voices load asynchronously; iOS in particular may populate late or after
    // returning from Settings, so we listen for the event AND retry on focus.
    window.speechSynthesis.addEventListener("voiceschanged", refreshVoices);
    document.addEventListener("visibilitychange", refreshVoices);
    window.addEventListener("focus", refreshVoices);
    // A couple of delayed retries catch slow first-load population on iOS.
    const t1 = setTimeout(refreshVoices, 500);
    const t2 = setTimeout(refreshVoices, 1500);

    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", refreshVoices);
      document.removeEventListener("visibilitychange", refreshVoices);
      window.removeEventListener("focus", refreshVoices);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [refreshVoices]);

  /** Resolve the voice to use: the user's choice, else the top-ranked one. */
  const resolveVoice = useCallback((): SpeechSynthesisVoice | null => {
    const list = voicesRef.current;
    if (list.length === 0) return null;
    if (voiceURIRef.current) {
      const chosen = list.find((v) => v.voiceURI === voiceURIRef.current);
      if (chosen) return chosen;
    }
    return list[0]; // best-ranked
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
      const voice = resolveVoice();
      if (voice) {
        utter.voice = voice;
        utter.lang = voice.lang;
      }
      utter.rate = 0.95; // A touch slower than default for a relaxed feel.
      utter.pitch = 1.0; // Neutral pitch reads most naturally.
      utter.volume = 1;
      synth.speak(utter);
    },
    [supported, enabled, resolveVoice],
  );

  const setVoice = useCallback((uri: string) => {
    voiceURIRef.current = uri;
    setVoiceURI(uri);
    try {
      if (uri) window.localStorage.setItem(VOICE_KEY, uri);
      else window.localStorage.removeItem(VOICE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const nextVal = !prev;
      if (!nextVal) cancel(); // Going silent — stop talking immediately.
      try {
        window.localStorage.setItem(ENABLED_KEY, String(nextVal));
      } catch {
        /* ignore */
      }
      return nextVal;
    });
  }, [cancel]);

  return {
    enabled,
    supported,
    voices,
    voiceURI,
    setVoice,
    refreshVoices,
    toggle,
    speak,
    cancel,
  };
}
