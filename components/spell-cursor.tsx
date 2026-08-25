"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

const GLYPHS = ["✦", "✧", "⋆", "✴", "+", "·"];
const POOL = 22; // recycled sparks — no allocation on the hot path
const STEP = 22; // min pointer travel (px) between sparks

/* Elements that should make the cursor "bloom" (grow) when hovered. */
const HOT_SELECTOR = 'a, button, [role="button"], input, textarea, select, label, summary, [data-cursor="hot"]';

/**
 * SpellCursor — a themed "magicworks" cursor that replaces the native pointer
 * with a glowing rune ring + dot, trailing a wand-trail of rune sparks
 * (Task: custom animated cursor + magicworks decor). Pointer-fine devices only;
 * disabled for touch and prefers-reduced-motion, where the native cursor stays.
 *
 * The ring lags the pointer, the dot tracks tightly, and both bloom over
 * interactive targets. Positions are driven with gsap.quickTo (no React state
 * on the hot path); the native cursor is hidden via the .cursor-magic class.
 */
export function SpellCursor() {
  const layerRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = layerRef.current;
    const ring = ringRef.current;
    const dot = dotRef.current;
    if (!layer || !ring || !dot) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    // Replace the OS cursor everywhere while this custom one is active.
    document.documentElement.classList.add("cursor-magic");

    const sparks: HTMLSpanElement[] = [];
    for (let i = 0; i < POOL; i++) {
      const s = document.createElement("span");
      s.className =
        "absolute left-0 top-0 select-none font-mono text-accent accent-glow will-change-transform";
      s.style.opacity = "0";
      layer.appendChild(s);
      sparks.push(s);
    }

    // Smooth followers — ring trails silkily, dot snaps close.
    const ringX = gsap.quickTo(ring, "x", { duration: 0.36, ease: "power4.out" });
    const ringY = gsap.quickTo(ring, "y", { duration: 0.36, ease: "power4.out" });
    const dotX = gsap.quickTo(dot, "x", { duration: 0.08, ease: "power3.out" });
    const dotY = gsap.quickTo(dot, "y", { duration: 0.08, ease: "power3.out" });

    let idx = 0;
    let lastX = 0;
    let lastY = 0;
    let primed = false;
    let hot = false;

    const emit = (x: number, y: number, big: boolean) => {
      const el = sparks[idx];
      idx = (idx + 1) % POOL;
      el.textContent = GLYPHS[(Math.random() * GLYPHS.length) | 0];
      el.style.fontSize = `${big ? 20 : 10 + Math.random() * 8}px`;
      gsap.killTweensOf(el);
      gsap.set(el, {
        x,
        y,
        xPercent: -50,
        yPercent: -50,
        scale: 0.4,
        opacity: big ? 1 : 0.9,
        rotation: Math.random() * 90 - 45,
      });
      gsap.to(el, {
        x: x + (Math.random() * 26 - 13),
        y: y - (14 + Math.random() * 26),
        scale: big ? 1.6 : 1.2,
        opacity: 0,
        rotation: `+=${Math.random() * 80 - 40}`,
        duration: 0.8 + Math.random() * 0.5,
        ease: "power2.out",
      });
    };

    const setHot = (next: boolean) => {
      if (next === hot) return;
      hot = next;
      gsap.to(ring, {
        scale: next ? 1.4 : 1,
        opacity: next ? 1 : 0.85,
        borderColor: next
          ? "color-mix(in oklab, var(--accent) 100%, transparent)"
          : "color-mix(in oklab, var(--accent) 70%, transparent)",
        duration: next ? 0.42 : 0.3,
        ease: next ? "back.out(1.7)" : "power3.out", // gentle spring bloom
      });
      gsap.to(dot, { scale: next ? 0.4 : 1, duration: 0.3, ease: "power3.out" });
    };

    const onMove = (e: PointerEvent) => {
      if (!primed) {
        primed = true;
        lastX = e.clientX;
        lastY = e.clientY;
        gsap.set([ring, dot], { x: e.clientX, y: e.clientY });
        gsap.to([ring, dot], { opacity: 1, duration: 0.25 });
      }
      ringX(e.clientX);
      ringY(e.clientY);
      dotX(e.clientX);
      dotY(e.clientY);

      const target = e.target as Element | null;
      setHot(!!target?.closest?.(HOT_SELECTOR));

      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      if (dx * dx + dy * dy < STEP * STEP) return;
      lastX = e.clientX;
      lastY = e.clientY;
      emit(e.clientX, e.clientY, false);
    };

    // a brighter burst + ring pulse on click — a little cast
    const onDown = (e: PointerEvent) => {
      gsap.fromTo(
        ring,
        { scale: hot ? 1.2 : 1 },
        { scale: hot ? 1.1 : 0.5, duration: 0.12, yoyo: true, repeat: 1, ease: "power2.inOut" },
      );
      for (let i = 0; i < 6; i++) emit(e.clientX, e.clientY, i === 0);
    };

    // Hide the followers when the pointer leaves the window.
    const onLeave = () => gsap.to([ring, dot], { opacity: 0, duration: 0.2 });
    const onEnter = () => gsap.to([ring, dot], { opacity: 1, duration: 0.2 });

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("pointerenter", onEnter);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("pointerenter", onEnter);
      document.documentElement.classList.remove("cursor-magic");
      gsap.killTweensOf([ring, dot, ...sparks]);
      sparks.forEach((s) => s.remove());
    };
  }, []);

  return (
    <>
      <div
        ref={layerRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[60] overflow-hidden"
      />
      <div ref={ringRef} aria-hidden="true" className="magic-cursor magic-cursor--ring" />
      <div ref={dotRef} aria-hidden="true" className="magic-cursor magic-cursor--dot" />
    </>
  );
}
