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
            Huntr<span className="ht-accent">Table</span>
          </h1>
          <p className="mt-0.5 text-sm font-medium text-stone-500 dark:text-stone-400">
            Great conversations start here
          </p>
        </div>
        <ThemeToggle />
      </header>

      {/* ── Category buttons ─────────────────────────────────── */}
      <section
        aria-label="Conversation categories"
        className="ht-grid mb-6 grid grid-cols-3 gap-x-3 gap-y-5"
      >
        {CATEGORIES.map((category, i) => (
          <div
            key={category.id}
            /* Offset the middle of each row to create the playful, scattered look. */
            className={i % 3 === 1 ? "translate-y-4" : ""}
          >
            <CategoryButton
              category={category}
              active={current?.category.id === category.id}
              onPress={handleCategory}
            />
          </div>
        ))}
        <div className="col-span-3 mt-1 flex justify-center">
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
          />
        )}
      </div>
    </main>
  );
}
