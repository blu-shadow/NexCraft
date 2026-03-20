// ═══════════════════════════════════════════════════════════
//                   THEME CONTEXT
//            Dark / Light / System Mode
// ═══════════════════════════════════════════════════════════
import { createContext, useState, useEffect, useCallback } from "react";

export const ThemeContext = createContext(null);

const STORAGE_KEY = "1000din_theme";
const VALID_THEMES = ["dark", "light", "system"];

// ─────────────────────────────────────────
//   Get system preference
// ─────────────────────────────────────────
const getSystemTheme = () =>
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

// ─────────────────────────────────────────
//   Resolve actual theme (handles "system")
// ─────────────────────────────────────────
const resolveTheme = (preference) => {
  if (preference === "system") return getSystemTheme();
  return preference;
};

export const ThemeProvider = ({ children }) => {
  // ── Stored preference (dark | light | system)
  const [preference, setPreference] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return VALID_THEMES.includes(stored) ? stored : "dark";
  });

  // ── Resolved theme (always "dark" or "light")
  const [theme, setTheme] = useState(() => resolveTheme(
    localStorage.getItem(STORAGE_KEY) || "dark"
  ));

  // ─────────────────────────────────────────
  //   Apply theme to DOM
  // ─────────────────────────────────────────
  useEffect(() => {
    const resolved = resolveTheme(preference);
    setTheme(resolved);
    document.documentElement.setAttribute("data-theme", resolved);
    // Update meta theme-color for mobile browser chrome
    const meta = document.querySelector("meta[name='theme-color']");
    if (meta) {
      meta.setAttribute("content", resolved === "dark" ? "#0f0f1a" : "#f2f2ff");
    }
  }, [preference]);

  // ─────────────────────────────────────────
  //   Listen to system preference changes
  // ─────────────────────────────────────────
  useEffect(() => {
    if (preference !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => {
      const resolved = e.matches ? "dark" : "light";
      setTheme(resolved);
      document.documentElement.setAttribute("data-theme", resolved);
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [preference]);

  // ─────────────────────────────────────────
  //   Change Theme
  // ─────────────────────────────────────────
  const changeTheme = useCallback((newPreference) => {
    if (!VALID_THEMES.includes(newPreference)) return;
    localStorage.setItem(STORAGE_KEY, newPreference);
    setPreference(newPreference);
  }, []);

  const toggleTheme = useCallback(() => {
    const next = theme === "dark" ? "light" : "dark";
    changeTheme(next);
  }, [theme, changeTheme]);

  // ─────────────────────────────────────────
  //   Context Value
  // ─────────────────────────────────────────
  const value = {
    theme,           // "dark" | "light"
    preference,      // "dark" | "light" | "system"
    isDark  : theme === "dark",
    isLight : theme === "light",
    toggleTheme,
    changeTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
