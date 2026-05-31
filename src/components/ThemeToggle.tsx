"use client";

import { useTheme } from "@/lib/useTheme";

/** Small round sun/moon toggle in the header. */
export default function ThemeToggle() {
  const { theme, toggle, mounted } = useTheme();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      className="ht-icon-btn"
    >
      {/* Render a neutral icon until mounted to avoid hydration mismatch. */}
      <span aria-hidden className="text-xl">
        {!mounted ? "🌙" : theme === "dark" ? "☀️" : "🌙"}
      </span>
    </button>
  );
}
