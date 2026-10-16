"use client";

import { useEffect } from "react";
import { applyTheme } from "@/components/theme-toggle";

export function ThemeBoot() {
  useEffect(() => {
    const stored = (localStorage.getItem("spars_theme") as "light" | "dark") || "light";
    applyTheme(stored);
  }, []);
  return null;
}
