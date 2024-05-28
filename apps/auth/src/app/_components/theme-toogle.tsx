"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import useLongPress from "@/lib/use-long-press";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [changeThemeValue, setChangeThemeValue] = useState<string>("dark");
  const { longPressHandlers } = useLongPress({
    onLongPress: () => {
      setTheme("system");
    },
    onClick: () => {
      setTheme(changeThemeValue);
    },
  });

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
      newValue = "light";
    } else {
      newValue = "dark";
    }
    setChangeThemeValue(newValue);
  }, [theme]);

  return (
    <button
      type="button"
      className="absolute bottom-4 right-4"
      {...longPressHandlers}
    >
      <img
        alt="theme toggle"
        className="size-6"
        src={changeThemeValue === "light" ? "sun.svg" : "moon.svg"}
      />
    </button>
  );
}
