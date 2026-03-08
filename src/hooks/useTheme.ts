// ═══════════════════════════════
// XPMT — useTheme Hook
// ═══════════════════════════════

import { useState } from "react";
import { Theme } from "../types";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("dark");

  const toggleTheme = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute(
      "data-theme",
      next === "light" ? "light" : ""
    );
  };

  return { theme, toggleTheme };
}
