"use client";

import { useMemo } from "react";
import { useTheme } from "./ThemeProvider";

export default function ThemeToggle() {
  const { theme, resolvedTheme, toggleTheme, setTheme, reducedMotion, toggleMotion } =
    useTheme();

  const nextThemeLabel = useMemo(() => {
    if (theme === "dark") return "Switch to light";
    if (theme === "light") return "Follow system";
    return "Switch to dark";
  }, [theme]);

  const themeDescription = useMemo(() => {
    if (theme === "system") {
      return `Theme: System (${resolvedTheme === "light" ? "light" : "dark"})`;
    }
    return `Theme: ${theme}`;
  }, [resolvedTheme, theme]);

  return (
    <div className="flex flex-wrap gap-2">
      <button className="btn-ghost text-xs" onClick={toggleTheme} aria-label="Cycle theme">
        {nextThemeLabel}
      </button>
      <button
        className="btn-ghost text-xs"
        onClick={() => setTheme("system")}
        aria-label="Use system theme"
      >
        {themeDescription}
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

