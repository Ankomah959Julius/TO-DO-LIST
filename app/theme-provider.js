"use client";

import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({
  theme: "system",
  resolvedTheme: "light",
  setTheme: () => {},
});

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState("system");
  const [resolvedTheme, setResolvedTheme] = useState("light");

  // Pick up whatever the inline script in layout.js already applied to
  // <html data-theme="..."> on first paint, so React's state matches
  // the DOM instead of flashing back to a default.
  useEffect(() => {
    const stored = localStorage.getItem("theme") || "system";
    setThemeState(stored);
  }, []);

  useEffect(() => {
    function applyTheme() {
      let effective = theme;
      if (theme === "system") {
        effective = window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
      }
      setResolvedTheme(effective);
      document.documentElement.setAttribute("data-theme", effective);
    }

    applyTheme();

    if (theme === "system") {
      const mql = window.matchMedia("(prefers-color-scheme: dark)");
      mql.addEventListener("change", applyTheme);
      return () => mql.removeEventListener("change", applyTheme);
    }
  }, [theme]);

  function setTheme(next) {
    setThemeState(next);
    localStorage.setItem("theme", next);
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
