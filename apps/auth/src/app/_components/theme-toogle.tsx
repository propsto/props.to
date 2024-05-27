"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [changeThemeValue, setChangeThemeValue] = useState<string>();

  useEffect(() => {
    setChangeThemeValue(theme === "dark" ? "light" : "dark");
  }, [theme]);

  useEffect(() => {
    // detect if current system theme is dark
    const checkDarkTheme = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    // Find new theme value for setTheme
    let newValue;
    if (theme === "dark") {
      newValue = "light";
    } else if (theme === "light") {
      newValue = "dark";
    } else if (checkDarkTheme) {
      newValue = "dark";
    } else {
      newValue = "light";
    }
    setChangeThemeValue(newValue);
  }, [theme]);

  return (
    <button
      type="button"
      className="absolute bottom-4 right-4"
      onClick={() => {
        setTheme(changeThemeValue ?? "dark");
      }}
    >
      <img
        alt="theme toggle"
        className="size-6"
        src={changeThemeValue === "dark" ? "sun.svg" : "moon.svg"}
      />
    </button>
  );
}
