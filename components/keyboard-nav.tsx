"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Keyboard, X } from "@phosphor-icons/react";
import { useTheme } from "@/components/providers";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

/* Ordered scroll targets — kept in sync with the section ids in app/page.tsx
   and the header menu. Number keys 1..n jump straight to each. */
const SECTION_IDS = [
  "home",
  "about",
  "experience",
  "project",
  "skill",
  "education",
  "cta",
] as const;

/**
 * Global keyboard navigation (Task: "keyboard navigations for ease").
 * - 1..7  jump to a section        - J / K  next / previous section
 * - T     toggle theme             - M      toggle the menu
 * - ?     shortcut help overlay    - Esc    close the overlay
 * A small [keyboard] affordance (desktop only) opens the same help.
 */
export function KeyboardNav() {
  const t = useTranslations("Keyboard");
  const h = useTranslations("Header");
  const reduce = useReducedMotion();
  const { toggleTheme } = useTheme();
  const [helpOpen, setHelpOpen] = useState(false);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }, [reduce]);

  const scrollToId = useCallback(
    (id: string) => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    },
    [reduce],
  );

  // Move to the next / previous section relative to the current scroll offset.
  const goRelative = useCallback(
    (dir: 1 | -1) => {
      const tops = SECTION_IDS.map((id): { id: string; top: number } | null => {
        const el = document.getElementById(id);
        return el ? { id, top: el.getBoundingClientRect().top + window.scrollY } : null;
      }).filter((x): x is { id: string; top: number } => x !== null);
      if (!tops.length) return;

      const cur = window.scrollY;
      const EPS = 8;
      if (dir === 1) {
        const next = tops.find((s) => s.top > cur + EPS);
        scrollToId((next ?? tops[tops.length - 1]).id);
      } else {
        const prevs = tops.filter((s) => s.top < cur - EPS);
        scrollToId((prevs.length ? prevs[prevs.length - 1] : tops[0]).id);
      }
    },
    [scrollToId],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      // Never hijack typing or OS/browser shortcuts.
      if (
        e.metaKey ||
        e.ctrlKey ||
        e.altKey ||
        (el &&
          (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)))
      ) {
        return;
      }

      if (e.key === "?") {
        e.preventDefault();
        setHelpOpen((v) => !v);
        return;
      }
      if (e.key === "Escape") {
        if (helpOpen) setHelpOpen(false);
        return;
      }
      if (helpOpen) return; // hold other keys while the overlay is up

      if (/^[1-9]$/.test(e.key)) {
        const idx = Number(e.key) - 1;
        if (idx < SECTION_IDS.length) {
          e.preventDefault();
          scrollToId(SECTION_IDS[idx]);
        }
        return;
      }

      switch (e.key.toLowerCase()) {
        case "j":
          e.preventDefault();
          goRelative(1);
          break;
        case "k":
          e.preventDefault();
          goRelative(-1);
          break;
        case "g":
          e.preventDefault();
          scrollToTop();
          break;
        case "t": {
          e.preventDefault();
          // Seed the circular reveal from the on-screen toggle so keyboard and
          // pointer activation animate from the same origin.
          const toggle = document.getElementById("theme-toggle");
          if (toggle) {
            const r = toggle.getBoundingClientRect();
            toggleTheme({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
          } else {
            toggleTheme();
          }
          break;
        }
        case "m": {
          const btn = document.querySelector<HTMLButtonElement>(".sm-toggle");
          if (btn) {
            e.preventDefault();
            btn.click();
          }
          break;
        }
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [helpOpen, goRelative, scrollToTop, scrollToId, toggleTheme]);

  const rows: { keys: string[]; label: string }[] = [
    { keys: ["1", "-", "7"], label: t("sections") },
    { keys: ["J", "K"], label: t("nav") },
    { keys: ["G"], label: t("top") },
    { keys: ["T"], label: t("theme") },
    { keys: ["M"], label: t("menu") },
    { keys: ["?"], label: t("help") },
  ];

  return (
    <>
      {/* Desktop-only affordance so the shortcuts are discoverable */}
      <button
        type="button"
        onClick={() => setHelpOpen(true)}
        aria-label={t("open")}
        aria-haspopup="dialog"
        className="glass fixed bottom-4 left-4 z-50 hidden size-9 place-items-center rounded-full text-muted-foreground transition-colors duration-200 hover:text-foreground md:grid"
      >
        <Keyboard size={17} aria-hidden />
      </button>

      <AnimatePresence>
        {helpOpen && (
          <motion.div
            className="fixed inset-0 z-[60] grid place-items-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className="absolute inset-0 bg-background/70 backdrop-blur-sm"
              onClick={() => setHelpOpen(false)}
              aria-hidden
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={t("title")}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.97 }}
              animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.24, ease: EASE_OUT }}
              className="glass relative w-full max-w-md rounded-2xl p-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.25em] text-accent accent-glow">
                  <span aria-hidden>{"//"}</span>
                  {t("title")}
                </h2>
                <button
                  type="button"
                  onClick={() => setHelpOpen(false)}
                  aria-label={t("close")}
                  className="grid size-7 place-items-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
                >
                  <X size={16} aria-hidden />
                </button>
              </div>

              <dl className="mt-5 flex flex-col gap-2.5">
                {rows.map((r) => (
                  <div key={r.label} className="flex items-center justify-between gap-4">
                    <dt className="text-sm text-foreground/80">{r.label}</dt>
                    <dd className="flex items-center gap-1.5">
                      {r.keys.map((k, i) =>
                        k === "–" ? (
                          <span key={i} className="font-mono text-xs text-muted-foreground">
                            –
                          </span>
                        ) : (
                          <kbd
                            key={i}
                            className="rounded-md border border-line bg-surface-2 px-2 py-1 font-mono text-[11px] leading-none text-foreground/90"
                          >
                            {k}
                          </kbd>
                        ),
                      )}
                    </dd>
                  </div>
                ))}
              </dl>

              {/* Which number lands where */}
              <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1.5 border-t border-line pt-4 font-mono text-[11px] text-muted-foreground">
                {SECTION_IDS.map((id, i) => (
                  <span key={id}>
                    <span className="text-accent">{i + 1}</span> {h(id)}
                  </span>
                ))}
              </div>

              <p className="mt-4 font-mono text-[11px] text-muted-foreground">
                <span className="text-accent">{">"}</span> {t("hint")}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
