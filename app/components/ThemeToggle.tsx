"use client";

import { useEffect, useState } from "react";

// Toggle between explicit light/dark classes on <html>.
// Respects system preference on first load if no saved choice.
export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const applyTheme = (mode: "light" | "dark") => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(mode);
    localStorage.setItem("theme", mode);
  };

  useEffect(() => {
    // Initialize theme from localStorage or system
    const saved = typeof window !== "undefined" ? localStorage.getItem("theme") : null;
    const prefersDark = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial: "light" | "dark" = saved === "light" || saved === "dark" ? (saved as "light" | "dark") : prefersDark ? "dark" : "light";
    applyTheme(initial);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(initial);
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    applyTheme(next);
    setTheme(next);
  };

  // Avoid hydration mismatch by not rendering icon until mounted
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={theme === "dark"}
      className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors border-black/10 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/10"
    >
      <span className="inline-block" aria-hidden suppressHydrationWarning>
        {theme === "dark" ? (
          // Sun icon
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
            <path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.93 4.93 6.34 6.34m11.32 11.32 1.41 1.41M4.93 19.07 6.34 17.66m11.32-11.32 1.41-1.41" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        ) : (
          // Moon icon
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span className="text-[var(--foreground)]">{theme === "dark" ? "Light" : "Dark"}</span>
    </button>
  );
}
