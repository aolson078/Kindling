"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";

type Theme = "dark" | "light" | "system";

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: "dark" | "light";
  toggleTheme: () => void;
  setTheme: (next: Theme) => void;
  reducedMotion: boolean;
  toggleMotion: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function isTheme(value: unknown): value is Theme {
  return value === "dark" || value === "light" || value === "system";
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">("dark");
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedTheme = localStorage.getItem("theme");
    if (isTheme(storedTheme) && storedTheme !== theme) {
      setTheme(storedTheme);
    }

    const storedMotion = localStorage.getItem("reduced-motion");
    if (storedMotion !== null) {
      setReducedMotion(storedMotion === "true");
    } else if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setReducedMotion(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyTheme = useCallback(
    (target: "dark" | "light") => {
      if (typeof document === "undefined") return;
      document.documentElement.classList.toggle("light", target === "light");
      document.body.classList.toggle("light", target === "light");
      setResolvedTheme(target);
    },
    []
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const media = window.matchMedia("(prefers-color-scheme: light)");
    const updateResolved = () => {
      const target = theme === "system" ? (media.matches ? "light" : "dark") : theme;
      applyTheme(target);
    };

    updateResolved();
    localStorage.setItem("theme", theme);

    if (theme === "system") {
      media.addEventListener("change", updateResolved);
      return () => media.removeEventListener("change", updateResolved);
    }

    return undefined;
  }, [applyTheme, theme]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.classList.toggle("reduce-motion", reducedMotion);
    document.documentElement.classList.toggle("reduce-motion", reducedMotion);
    localStorage.setItem("reduced-motion", String(reducedMotion));
  }, [reducedMotion]);

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      if (current === "dark") return "light";
      if (current === "light") return "system";
      return "dark";
    });
  }, []);

  const toggleMotion = useCallback(() => {
    setReducedMotion((motion) => !motion);
  }, []);

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      toggleTheme,
      setTheme,
      reducedMotion,
      toggleMotion,
    }),
    [theme, resolvedTheme, toggleTheme, setTheme, reducedMotion, toggleMotion]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

