"use client";

import { motion } from "framer-motion";
import { useLocale } from "next-intl";
import { useTransition } from "react";
import { useTheme } from "@/components/providers";
import { setLocale } from "@/app/actions";
import { cn } from "@/lib/utils";

const LOCALES = [
  { code: "en", label: "EN" },
  { code: "id", label: "ID" },
  { code: "de", label: "DE" },
  { code: "es", label: "ES" },
  { code: "zh-CN", label: "中" },
] as const;

/**
 * Fixed terminal control strip (DESIGN.md, the command line):
 * an i18n language switch + the theme toggle (CRT Forest <-> Printout),
 * both wired to the live app state. Sharp corners, mono type, no capsules.
 */
export function SiteControls() {
  return (
    <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 sm:bottom-6 sm:left-auto sm:right-6 sm:translate-x-0">
      <div className="glass flex items-center gap-1.5 rounded-full p-2">
        <LocaleSwitch />
        <span className="mx-0.5 h-6 w-px bg-line" aria-hidden="true" />
        <ThemeToggle />
      </div>
    </div>
  );
}

function LocaleSwitch() {
  const active = useLocale();
  const [isPending, startTransition] = useTransition();

  const change = (code: string) => {
    if (code === active || isPending) return;
    startTransition(async () => {
      await setLocale(code);
      window.location.reload();
    });
  };

  return (
    <div
      role="group"
      aria-label="Language"
      className={cn("flex items-center gap-0.5", isPending && "opacity-60")}
    >
      {LOCALES.map((l) => {
        const isActive = l.code === active;
        return (
          <button
            key={l.code}
            type="button"
            onClick={() => change(l.code)}
            aria-pressed={isActive}
            aria-label={`Switch language to ${l.label}`}
            className={cn(
              "relative px-2 py-2 font-mono text-[11px] font-medium uppercase tracking-wider",
              "transition-colors duration-200",
              isActive
                ? "text-accent-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {isActive && (
              <motion.span
                layoutId="locale-active"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
                className="absolute inset-0 -z-10 rounded-full bg-accent"
              />
            )}
            {l.label}
          </button>
        );
      })}
    </div>
  );
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  // Reveal originates from the button's center (correct even for keyboard
  // activation, where pointer coords would be 0,0).
  const onToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    toggleTheme({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
  };

  return (
    <button
      id="theme-toggle"
      type="button"
      onClick={onToggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={isDark}
      className="grid size-9 place-items-center rounded-full text-foreground transition-colors duration-200 hover:bg-accent/15 active:scale-95"
    >
      <svg
        className="size-5"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        fill="currentColor"
        strokeLinecap="round"
        viewBox="0 0 32 32"
      >
        <clipPath id="site-theme-clip">
          <motion.path
            animate={{ y: isDark ? 10 : 0, x: isDark ? -12 : 0 }}
            transition={{ ease: "easeInOut", duration: 0.35 }}
            d="M0-5h30a1 1 0 0 0 9 13v24H0Z"
          />
        </clipPath>
        <g clipPath="url(#site-theme-clip)">
          <motion.circle
            animate={{ r: isDark ? 10 : 8 }}
            transition={{ ease: "easeInOut", duration: 0.35 }}
            cx="16"
            cy="16"
          />
          <motion.g
            animate={{
              rotate: isDark ? -100 : 0,
              scale: isDark ? 0.5 : 1,
              opacity: isDark ? 0 : 1,
            }}
            transition={{ ease: "easeInOut", duration: 0.35 }}
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M16 5.5v-4" />
            <path d="M16 30.5v-4" />
            <path d="M1.5 16h4" />
            <path d="M26.5 16h4" />
            <path d="m23.4 8.6 2.8-2.8" />
            <path d="m5.7 26.3 2.9-2.9" />
            <path d="m5.8 5.8 2.8 2.8" />
            <path d="m23.4 23.4 2.9 2.9" />
          </motion.g>
        </g>
      </svg>
    </button>
  );
}
