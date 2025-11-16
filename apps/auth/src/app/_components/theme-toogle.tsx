"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { SunMoon, Sun, Moon } from "lucide-react";

export default function ThemeToggle(): React.ReactElement | null {
  const { theme = "system", setTheme } = useTheme();
  const [nextValue, setNextValue] = useState<string>("system");
  const [systemDark, setSystemDark] = useState(false);

  useEffect(() => {
    function getNextThemeOption(): void {
      let newValue;
      if (theme === "system") {
        newValue = systemDark ? "light" : "dark";
      } else if (theme === "light") {
        newValue = systemDark ? "dark" : "system";
      } else if (theme === "dark") {
        newValue = systemDark ? "system" : "light";
      } else {
        newValue = "system";
      }
      setNextValue(newValue);
    }
    // detect if current system theme is dark
    const checkDarkTheme = window.matchMedia("(prefers-color-scheme: dark)");
    setSystemDark(checkDarkTheme.matches);
    getNextThemeOption();
    checkDarkTheme.addEventListener("change", (e: MediaQueryListEvent) => {
      setSystemDark(e.matches);
      getNextThemeOption();
    });
    return () => {
      checkDarkTheme.removeEventListener("change", (e: MediaQueryListEvent) => {
        setSystemDark(e.matches);
        getNextThemeOption();
      });
    };
  }, [theme, systemDark]);

  const systemDarkText = systemDark ? " (dark)" : " (light)";
  return (
    <button
      type="button"
      className="fixed bottom-4 right-6 lg:right-4 z-50"
      title={`Switch to ${nextValue}${nextValue === "system" ? systemDarkText : ""} theme`}
      onClick={() => {
        setTheme(nextValue);
      }}
    >
      {nextValue === "system" && (
        <SunMoon aria-label="System theme" className="size-6" />
      )}
      {nextValue === "light" && (
        <Sun aria-label="Light theme" className="size-6" />
      )}
      {nextValue === "dark" && (
        <Moon aria-label="Dark theme" className="size-6" />
      )}
    </button>
  );
}
