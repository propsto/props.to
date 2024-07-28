"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { SunMoon, Sun, Moon } from "lucide-react";

export function ThemeToggle(): JSX.Element {
  const { theme, setTheme } = useTheme();
  const [changeThemeValue, setChangeThemeValue] = useState<string>("dark");

  useEffect(() => {
    function getNextThemeOption(matches: boolean): void {
      let newValue;
      if (theme === "dark") {
        newValue = "light";
      } else if (theme === "light") {
        newValue = "dark";
      } else if (matches) {
        newValue = "light";
      } else {
        newValue = "dark";
      }
      setChangeThemeValue(newValue);
    }
    // detect if current system theme is dark
    const checkDarkTheme = window.matchMedia("(prefers-color-scheme: dark)");
    getNextThemeOption(checkDarkTheme.matches);
    checkDarkTheme.addEventListener("change", (e: MediaQueryListEvent) => {
      getNextThemeOption(e.matches);
    });
    return () => {
      checkDarkTheme.removeEventListener("change", (e: MediaQueryListEvent) => {
        getNextThemeOption(e.matches);
      });
    };
  }, [theme]);

  if (typeof window === "undefined") {
    setChangeThemeValue("system");
  }

  return (
    <button
      type="button"
      className="absolute bottom-4 right-4"
      title={
        changeThemeValue === "dark" && theme !== "system"
          ? "Switch to system theme"
          : `Switch to ${theme === "system" ? "dark or light" : changeThemeValue} theme`
      }
      onClick={() => {
        setTheme(
          changeThemeValue === "dark" && theme !== "system"
            ? "system"
            : changeThemeValue
        );
      }}
    >
      {theme === "system" && (
        <SunMoon aria-label="System theme" className="size-6" />
      )}
      {changeThemeValue === "light" && theme !== "system" && (
        <Sun aria-label="Light theme" className="size-6" />
      )}
      {changeThemeValue === "dark" && theme !== "system" && (
        <Moon aria-label="Dark theme" className="size-6" />
      )}
    </button>
  );
}
