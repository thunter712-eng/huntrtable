"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { ActiveQuestion } from "@/lib/types";

interface QuestionCardProps {
  question: ActiveQuestion | null;
  speaking: boolean;
}

/**
 * The big reading card. Animates a fresh pop-in each time the question changes
 * (keyed on the text) and scales typography down gracefully for long questions.
 */
export default function QuestionCard({ question, speaking }: QuestionCardProps) {
  // Longer questions get a slightly smaller starting size so they always fit.
  const length = question?.text.length ?? 0;
  const sizeClass =
    length > 110
      ? "text-2xl sm:text-3xl"
      : length > 70
        ? "text-[1.7rem] sm:text-4xl"
        : "text-3xl sm:text-5xl";

  return (
    <div className="ht-card relative w-full overflow-hidden rounded-[2rem] px-6 py-9 sm:px-9 sm:py-12">
      <AnimatePresence mode="wait">
        {question ? (
          <motion.div
            key={question.text}
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -14, scale: 0.98 }}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center gap-4 text-center"
          >
            <span
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white"
              style={{ backgroundColor: question.category.color }}
            >
              <span aria-hidden>{question.category.emoji}</span>
              {question.category.name}
            </span>
            <p
              className={`font-display font-semibold leading-snug text-stone-800 dark:text-stone-50 ${sizeClass} text-balance`}
            >
              {question.text}
            </p>
            {speaking && (
              <span className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-stone-400 dark:text-stone-400">
                <SoundWave />
                Speaking…
              </span>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-3 text-center"
          >
            <span className="animate-float text-5xl" aria-hidden>
              💬
            </span>
            <p className="max-w-xs font-display text-xl font-semibold text-stone-500 dark:text-stone-300">
              Tap a color to start the conversation
            </p>
            <p className="text-sm text-stone-400 dark:text-stone-500">
              Gather round — the question appears here.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Tiny animated equalizer shown while a question is being read aloud. */
function SoundWave() {
  return (
    <span className="flex items-end gap-0.5" aria-hidden>
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className="w-1 rounded-full bg-current"
          style={{
            height: "0.9rem",
            animation: `ht-eq 0.9s ease-in-out ${i * 0.12}s infinite`,
          }}
        />
      ))}
    </span>
  );
}
