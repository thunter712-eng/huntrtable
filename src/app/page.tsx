"use client";

import { useEffect, useState } from "react";
import CategoryButton from "@/components/CategoryButton";
import SurpriseButton from "@/components/SurpriseButton";
import QuestionCard from "@/components/QuestionCard";
import Controls from "@/components/Controls";
import VoiceSelect from "@/components/VoiceSelect";
import ThemeToggle from "@/components/ThemeToggle";
import { CATEGORIES } from "@/lib/categories";
import { useQuestions } from "@/lib/useQuestions";
import { useSpeech } from "@/lib/useSpeech";
import { useHaptics } from "@/lib/useHaptics";
import { celebrate } from "@/lib/confetti";
import type { Category } from "@/lib/types";

export default function Home() {
  const { current, total, ready, draw, drawRandom, next, onMilestone } =
    useQuestions();
  const speech = useSpeech();
  const haptic = useHaptics();
  const [speaking, setSpeaking] = useState(false);

  // Fire confetti (and a celebratory buzz) at every 25-question milestone.
  useEffect(() => {
    onMilestone(() => {
      celebrate();
      haptic("celebrate");
    });
  }, [onMilestone, haptic]);

  /**
   * Speak a question aloud. Called synchronously from tap handlers so the
   * Speech Synthesis call happens inside the user gesture — iOS Safari blocks
   * speech that starts outside one (e.g. from an effect a tick later).
   */
  const sayQuestion = (text: string) => {
    if (speech.enabled && speech.supported) {
      speech.speak(text);
      setSpeaking(true);
    }
  };

  // Clear the "Speaking…" indicator after an estimated reading time. (The Web
  // Speech API's end event is unreliable across browsers, so we approximate.)
  useEffect(() => {
    if (!speaking || !current) return;
    const ms = Math.min(12000, 1200 + current.text.length * 55);
    const t = setTimeout(() => setSpeaking(false), ms);
    return () => clearTimeout(t);
  }, [speaking, current]);

  const handleCategory = (category: Category) => {
    haptic("tap");
    sayQuestion(draw(category.id).text);
  };

  const handleSurprise = () => {
    haptic("double");
    sayQuestion(drawRandom().text);
  };

  const handleRepeat = () => {
    if (!current) return;
    haptic("tap");
    sayQuestion(current.text);
  };

  const handleNext = () => {
    haptic("tap");
    sayQuestion(next().text);
  };

  const handleToggleSpeech = () => {
    haptic("tap");
    speech.toggle();
    setSpeaking(false);
  };

  return (
    <main className="relative mx-auto flex min-h-[100dvh] w-full max-w-md flex-col px-5 pb-8 pt-[max(1.25rem,env(safe-area-inset-top))]">
      {/* ── Header ───────────────────────────────────────────── */}
      <header className="mb-5 flex items-start justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-stone-800 dark:text-stone-50">
            Yappo<span className="ht-accent">Zappo</span>
          </h1>
          <p className="mt-0.5 text-sm font-medium text-stone-500 dark:text-stone-400">
            Great conversations start here
          </p>
        </div>
        <ThemeToggle />
      </header>

      {/* ── Category dial ────────────────────────────────────────
          The five categories sit evenly around a circle (starting at the
          top, 72° apart) with the Surprise Me hub in the center. */}
      <section
        aria-label="Conversation categories"
        className="relative mx-auto mb-4 aspect-square w-full max-w-[23rem]"
      >
        {/* Faint dial ring running through the button centers. */}
        <div
          aria-hidden
          className="absolute left-1/2 top-1/2 h-[80%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-stone-300/50 dark:border-white/10"
        />

        {CATEGORIES.map((category, i) => {
          // Place button i at angle: top (-90°) then 72° steps clockwise.
          const angle = ((-90 + i * (360 / CATEGORIES.length)) * Math.PI) / 180;
          const radius = 40; // % of half the container
          const left = 50 + radius * Math.cos(angle);
          const top = 50 + radius * Math.sin(angle);
          return (
            <div
              key={category.id}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${left}%`, top: `${top}%` }}
            >
              <CategoryButton
                category={category}
                active={current?.category.id === category.id}
                showTagline={false}
                onPress={handleCategory}
              />
            </div>
          );
        })}

        {/* Center hub */}
        <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
          <SurpriseButton onPress={handleSurprise} />
        </div>
      </section>

      {/* ── Question card ────────────────────────────────────── */}
      <div className="flex-1">
        <QuestionCard question={current} speaking={speaking} />
      </div>

      {/* ── Progress + controls ──────────────────────────────── */}
      <div className="mt-6 flex flex-col gap-4">
        <p className="text-center text-xs font-medium text-stone-400 dark:text-stone-500">
          {ready && total > 0
            ? `${total} question${total === 1 ? "" : "s"} explored together`
            : "Pick a category to begin"}
        </p>
        <Controls
          hasQuestion={!!current}
          speechEnabled={speech.enabled}
          speechSupported={speech.supported}
          onRepeat={handleRepeat}
          onNext={handleNext}
          onToggleSpeech={handleToggleSpeech}
        />
        {speech.supported && speech.enabled && (
          <VoiceSelect
            voices={speech.voices}
            value={speech.voiceURI}
            onChange={speech.setVoice}
            onPreview={(text) => speech.speak(text)}
            onOpen={speech.refreshVoices}
          />
        )}
      </div>
    </main>
  );
}
