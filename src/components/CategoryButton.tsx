"use client";

import type { Category } from "@/lib/types";

interface CategoryButtonProps {
  category: Category;
  /** Whether this category's question is currently on screen. */
  active?: boolean;
  /** Show the small tagline under the name (hidden in the compact dial). */
  showTagline?: boolean;
  onPress: (category: Category) => void;
}

/**
 * A glossy, 3D "candy button" circle. The tactile feel comes from a layered
 * gradient (light gloss on top, darker base) plus a colored drop shadow that
 * compresses on press. Colors are driven by the category via CSS variables.
 *
 * The button's box is just the circle; the text label is absolutely positioned
 * beneath it. That keeps the circle the element being centered, so it can be
 * placed exactly on the radial dial without the label shifting it off-center.
 */
export default function CategoryButton({
  category,
  active = false,
  showTagline = true,
  onPress,
}: CategoryButtonProps) {
  return (
    <button
      type="button"
      onClick={() => onPress(category)}
      aria-label={`${category.name} — ${category.tagline}`}
      className="ht-candy group relative outline-none"
      style={
        {
          "--c-base": category.color,
          "--c-light": category.colorLight,
          "--c-dark": category.colorDark,
        } as React.CSSProperties
      }
    >
      <span
        className={`ht-candy__face relative grid place-items-center rounded-full text-white transition-transform duration-150 ${
          active ? "ring-4 ring-white/70 dark:ring-white/40" : ""
        }`}
      >
        <span
          aria-hidden
          className="text-[2.35rem] drop-shadow-[0_2px_3px_rgba(0,0,0,0.25)] transition-transform duration-300 group-hover:scale-110 group-active:scale-95"
        >
          {category.emoji}
        </span>
      </span>
      <span className="absolute left-1/2 top-full mt-1.5 w-20 -translate-x-1/2 text-center leading-tight">
        <span className="block font-display text-[0.85rem] font-semibold text-stone-700 dark:text-stone-100">
          {category.name}
        </span>
        {showTagline && (
          <span className="block text-[0.7rem] font-medium text-stone-400 dark:text-stone-400">
            {category.tagline}
          </span>
        )}
      </span>
    </button>
  );
}
