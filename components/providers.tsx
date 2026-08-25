"use client";
import { ReactLenis } from "lenis/react";
import "lenis/dist/lenis.css";
import React, { createContext, useContext, useEffect, useState } from "react";
type Theme = "light" | "dark";
type ThemeContextType = {
  theme: Theme;
  /** `origin` (viewport px) seeds the circular reveal so the new theme wipes
   *  in from the toggle button. Omit for an instant swap. */
  toggleTheme: (origin?: { x: number; y: number }) => void;
};
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
export function Providers({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [smooth, setSmooth] = useState(true);
  useEffect(() => {
    // The pre-paint script in layout already set the class from localStorage /
    // system preference; sync React state to that external (DOM) source once.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const saveData = (navigator as unknown as { connection?: { saveData?: boolean } }).connection?.saveData;
    setSmooth(!reduce && !saveData && !(coarse && window.innerWidth < 768));
  }, []);
  const toggleTheme = (origin?: { x: number; y: number }) => {
    const root = document.documentElement;
    // Read the live class, not React state, so rapid clicks can't desync.
    const next: Theme = root.classList.contains("dark") ? "light" : "dark";
    const apply = () => {
      root.classList.toggle("dark", next === "dark");
      localStorage.setItem("theme", next);
      setTheme(next);
    };

    // startViewTransition isn't in every browser's lib types yet.
    const doc = document as Document & {
      startViewTransition?: (cb: () => void) => void;
    };
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!doc.startViewTransition || reduce) {
      apply();
      return;
    }

    // Seed the reveal origin (defaults to center via CSS fallback).
    if (origin) {
      root.style.setProperty("--theme-x", `${origin.x}px`);
      root.style.setProperty("--theme-y", `${origin.y}px`);
    }
    doc.startViewTransition(apply);
  };
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {smooth ? (
        <ReactLenis root options={{ lerp: 0.1, duration: 1.2, smoothWheel: true, anchors: true }}>
          {children}
        </ReactLenis>
      ) : (
        <>{children}</>
      )}
    </ThemeContext.Provider>
  );
}