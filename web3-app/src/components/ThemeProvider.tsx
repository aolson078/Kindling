"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "dark" | "light";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  reducedMotion: boolean;
  toggleMotion: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const storedTheme = (localStorage.getItem("theme") as Theme) || null;
    if (storedTheme) {
      setTheme(storedTheme);
    } else if (window.matchMedia("(prefers-color-scheme: light)").matches) {
      setTheme("light");
    }

    const storedMotion = localStorage.getItem("reduced-motion");
    if (storedMotion !== null) {
      setReducedMotion(storedMotion === "true");
    } else if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setReducedMotion(true);
    }
  }, []);

  useEffect(() => {
    document.body.classList.toggle("light", theme === "light");
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    document.body.classList.toggle("reduce-motion", reducedMotion);
    localStorage.setItem("reduced-motion", String(reducedMotion));
  }, [reducedMotion]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
  const toggleMotion = () => setReducedMotion((m) => !m);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, reducedMotion, toggleMotion }}>
      {children}
    </ThemeContext.Provider>
  );
}

