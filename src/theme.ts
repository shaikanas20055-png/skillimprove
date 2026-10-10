import { useEffect, useState } from "react";

export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "skillimprove-theme";

export function getStoredTheme(): Theme {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === "dark" || saved === "light") {
      return saved;
    }
    // Also check if any role settings had dark
    for (const role of ["student", "industry", "college"]) {
      const stored = localStorage.getItem(`skillimprove-settings-${role}`);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.themeMode === "dark") return "dark";
        } catch {
          // ignore
        }
      }
    }
    if (typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
  } catch {
    // fallback
  }
  return "light";
}

export function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const body = document.body;
  if (theme === "dark") {
    root.classList.add("dark");
    body?.classList.add("dark");
    root.setAttribute("data-theme", "dark");
  } else {
    root.classList.remove("dark");
    body?.classList.remove("dark");
    root.setAttribute("data-theme", "light");
  }
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    // Also sync to active role settings if present
    const role = localStorage.getItem("skill-role");
    if (role) {
      const settingsKey = `skillimprove-settings-${role}`;
      const existing = localStorage.getItem(settingsKey);
      if (existing) {
        try {
          const parsed = JSON.parse(existing);
          parsed.themeMode = theme;
          localStorage.setItem(settingsKey, JSON.stringify(parsed));
        } catch {
          // ignore
        }
      }
    }
  } catch {
    // ignore
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("skillimprove-theme-change", { detail: theme }));
  }
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(getStoredTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    const onThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<Theme>;
      if (customEvent.detail && (customEvent.detail === "dark" || customEvent.detail === "light")) {
        setThemeState(customEvent.detail);
      }
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === THEME_STORAGE_KEY && (e.newValue === "dark" || e.newValue === "light")) {
        setThemeState(e.newValue);
        applyTheme(e.newValue);
      }
    };
    window.addEventListener("skillimprove-theme-change", onThemeChange);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("skillimprove-theme-change", onThemeChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const toggleTheme = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setThemeState(next);
    applyTheme(next);
  };

  const setTheme = (next: Theme) => {
    setThemeState(next);
    applyTheme(next);
  };

  return {
    theme,
    isDark: theme === "dark",
    toggleTheme,
    setTheme,
  };
}
