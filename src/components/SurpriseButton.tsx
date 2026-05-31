"use client";

interface SurpriseButtonProps {
  onPress: () => void;
}

/**
 * The "Surprise Me" button — draws from a random category. Sits in the center
 * of the radial dial as a round, rainbow "hub" button, echoing the center of
 * the physical device.
 */
export default function SurpriseButton({ onPress }: SurpriseButtonProps) {
  return (
    <button
      type="button"
      onClick={onPress}
      aria-label="Surprise me — random category"
      className="ht-surprise group grid h-[6.75rem] w-[6.75rem] place-items-center gap-0.5 rounded-full text-white outline-none transition-transform duration-150 active:scale-95"
    >
      <span
        aria-hidden
        className="text-2xl drop-shadow-[0_2px_3px_rgba(0,0,0,0.3)] transition-transform duration-500 group-hover:rotate-180"
      >
        🎲
      </span>
      <span className="font-display text-sm font-bold leading-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
        Surprise
        <br />
        Me
      </span>
    </button>
  );
}
