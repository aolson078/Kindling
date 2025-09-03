"use client";

import { useTheme } from "./ThemeProvider";

export default function ThemeToggle() {
  const { theme, toggleTheme, reducedMotion, toggleMotion } = useTheme();
  return (
    <div className="flex gap-2">
      <button className="btn-ghost text-xs" onClick={toggleTheme} aria-label="Toggle theme">
        {theme === "dark" ? "Light mode" : "Dark mode"}
      </button>
      <button
        className="btn-ghost text-xs"
        onClick={toggleMotion}
        aria-label="Toggle motion"
      >
        {reducedMotion ? "Enable motion" : "Reduce motion"}
      </button>
    </div>
  );
}

