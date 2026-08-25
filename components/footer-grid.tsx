"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

const ALPHABET = [...Array(26).keys()].map((i) => String.fromCharCode(i + 65));
const HIRAGANA = [...Array(26).keys()].map((i) => String.fromCharCode(i + 12353));
const KATAKANA = [...Array(26).keys()].map((i) => String.fromCharCode(i + 12449));

const GERMAN = [
  "Ä",
  "Ö",
  "Ü",
  "ä",
  "ö",
  "ü",
  "ß",
  "ẞ",
  "é",
  "è",
  "à",
];
const PORTUGUESE = [
  "á",
  "à",
  "ã",
  "â",
  "é",
  "è",
  "ẽ",
  "ê",
  "í",
  "ì",
  "ĩ",
  "î",
  "ó",
  "ò",
  "õ",
  "ô",
  "ú",
  "ù",
  "ũ",
  "û",
  "ç",
  "Ç",
  "ñ",
  "Ñ",
  "",
];
const HANZI = [...Array(26).keys()].map((i) => String.fromCharCode(i + 19968));
const SYMBOLS = ["·", "•", "◦", "⁺", "⁎", "⁕", "⟡", "◆", "◇", "░", "▒", "▓", "⟐"];
const POOL = [
  ...GERMAN,
  ...HANZI,
  ...SYMBOLS,
  ...ALPHABET,
  ...HIRAGANA,
  ...KATAKANA,
  ...PORTUGUESE,
];

function pickChar() {
  return POOL[Math.floor(Math.random() * POOL.length)];
}

export function FooterGrid() {
  const reduce = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ cols: 0, rows: 0, total: 0 });
  const [active, setActive] = useState<Map<number, string>>(new Map());
  const visibleRef = useRef(true);

  // measure grid
  useEffect(() => {
    const el = containerRef.current?.parentElement;
    if (!el) return;
    const update = () => {
      const { width, height } = el.getBoundingClientRect();
      const cell = 56; // 3.5rem
      const cols = Math.max(8, Math.ceil(width / cell));
      const rows = Math.max(6, Math.ceil(height / cell));
      const total = cols * rows;
      setDims({ cols, rows, total });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  // pause when not visible
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry.isIntersecting;
      },
      { threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [dims.total]);

  // random bloom — interval drives shimmer, timeouts fade cells
  useEffect(() => {
    if (reduce) return;
    if (dims.total === 0) return;

    const timers = new Set<number>();

    const tick = () => {
      if (!visibleRef.current) return;
      if (document.hidden) return;

      // slow tempo: 1-2 cells per tick
      const count = 1 + Math.floor(Math.random() * 4);
      const picks: Array<{ idx: number; ch: string }> = [];
      for (let i = 0; i < count; i++) {
        const idx = Math.floor(Math.random() * dims.total);
        picks.push({ idx, ch: pickChar() });
      }
      if (picks.length === 0) return;

      setActive((prev) => {
        const next = new Map(prev);
        picks.forEach(({ idx, ch }) => next.set(idx, ch));
        return next;
      });

      picks.forEach(({ idx }) => {
        const dur = 2200 + Math.random() * 1400;
        const id = window.setTimeout(() => {
          setActive((prev) => {
            const next = new Map(prev);
            next.delete(idx);
            return next;
          });
          timers.delete(id);
        }, dur);
        timers.add(id);
      });
    };

    const interval = window.setInterval(tick, 620);
    // initial slow scatter
    const seeding = window.setTimeout(() => {
      for (let k = 0; k < 4; k++) tick();
    }, 300);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(seeding);
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [dims.total, reduce]);

  if (dims.total === 0) {
    return <div ref={containerRef} className="absolute inset-0" aria-hidden />;
  }

  // reduced motion: static subtle grid, no random fills
  if (reduce) {
    return (
      <div
        ref={containerRef}
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          WebkitMaskImage: "radial-gradient(125% 100% at 50% 0%, #000 26%, transparent 78%)",
          maskImage: "radial-gradient(125% 100% at 50% 0%, #000 26%, transparent 78%)",
          display: "grid",
          gridTemplateColumns: `repeat(${dims.cols}, 3.5rem)`,
          gridAutoRows: "3.5rem",
          justifyContent: "start",
          alignContent: "start",
          opacity: 0.35,
        }}
      >
        {Array.from({ length: dims.total }).map((_, i) => (
          <div key={i} className="grid place-items-center border border-line/40 font-mono text-sm text-accent/25">
            {i % 13 === 0 ? pickChar() : ""}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 select-none"
      style={{
        WebkitMaskImage: "radial-gradient(125% 100% at 50% 0%, #000 26%, transparent 78%)",
        maskImage: "radial-gradient(125% 100% at 50% 0%, #000 26%, transparent 78%)",
        display: "grid",
        gridTemplateColumns: `repeat(${dims.cols}, 3.5rem)`,
        gridAutoRows: "3.5rem",
        justifyContent: "start",
        alignContent: "start",
      }}
    >
      {Array.from({ length: dims.total }).map((_, i) => {
        const ch = active.get(i);
        const isActive = ch !== undefined;
        return (
          <div
            key={i}
            className="relative grid place-items-center overflow-hidden border font-mono text-[11px] leading-none transition-[background,border-color,color] duration-[680ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{
              background: isActive ? "var(--accent)" : "transparent",
              color: isActive ? "var(--accent-foreground)" : "transparent",
              borderColor: isActive ? "var(--accent)" : "transparent",
              // solid fill of the grid itself — not a translucent overlay
            }}
          >
            <span
              className="transition-all duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{
                opacity: isActive ? 1 : 0,
                transform: isActive ? "scale(1) translateY(0)" : "scale(0.88) translateY(2px)",
                filter: isActive ? "blur(0px)" : "blur(2px)",
              }}
            >
              {ch ?? "·"}
            </span>
          </div>
        );
      })}
    </div>
  );
}
