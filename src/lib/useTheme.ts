"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Light/dark theme with persistence. Defaults to the system preference on the
 * very first visit, then remembers the user's explicit choice.
 *
 * The initial class is set by an inline script in the layout (see ThemeScript)
 * to avoid a flash of the wrong theme before React hydrates.
 */

const STORAGE_KEY = "huntrtable:theme:v1";
export type Theme = "light" | "dark";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Read whatever the inline script already applied to <html>.
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
    setMounted(true);
  }, []);

  const apply = useCallback((next: Theme) => {
    document.documentElement.classList.toggle("dark", next === "dark");
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", next === "dark" ? "#13111e" : "#fff3e6");
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
    setTheme(next);
  }, []);

  const toggle = useCallback(() => {
    apply(theme === "dark" ? "light" : "dark");
  }, [apply, theme]);

  return { theme, toggle, mounted };
}

/**
 * Inline script (stringified) that runs before paint to set the initial theme.
 * Rendered via dangerouslySetInnerHTML in the root layout.
 */
export const THEME_INIT_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem('${STORAGE_KEY}');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var dark = stored ? stored === 'dark' : prefersDark;
    document.documentElement.classList.toggle('dark', dark);
  } catch (e) {}
})();
`;
