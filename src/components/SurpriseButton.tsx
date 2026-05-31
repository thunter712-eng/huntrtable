"use client";

interface SurpriseButtonProps {
  onPress: () => void;
}

/**
 * The "Surprise Me" button — draws from a random category. Styled as a wide
 * rainbow pill so it reads as a special action distinct from the five circles.
 */
export default function SurpriseButton({ onPress }: SurpriseButtonProps) {
  return (
    <button
      type="button"
      onClick={onPress}
      className="ht-surprise group inline-flex items-center gap-2 rounded-full px-7 py-3 font-display text-base font-semibold text-white outline-none transition-transform duration-150 active:scale-95"
    >
      <span
        aria-hidden
        className="text-xl transition-transform duration-500 group-hover:rotate-180"
      >
        🎲
      </span>
      Surprise Me
    </button>
  );
}
