"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <button
      onClick={() =>
        setTheme(theme === "dark" ? "light" : "dark")
      }
      className="
        fixed
        top-6
        right-6
        z-50
        w-14
        h-14
        rounded-full
        bg-white/80
        dark:bg-gray-900/80
        backdrop-blur-xl
        border
        border-white/20
        dark:border-gray-700
        shadow-xl
        flex
        items-center
        justify-center
        transition-all
        duration-300
        hover:scale-110
      "
    >
      {theme === "dark" ? (
        <Sun className="text-yellow-400 h-6 w-6" />
      ) : (
        <Moon className="text-emerald-600 h-6 w-6" />
      )}
    </button>
  );
}