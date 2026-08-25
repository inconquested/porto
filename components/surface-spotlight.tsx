"use client";

import { useEffect } from "react";

/* Surfaces that catch the light. Chips are excluded — too small to read a glow. */
const SELECTOR = ".glass, .plate";
/* How far beyond a surface's edge the glow begins to rise (css px). */
const INFLUENCE = 100;

/**
 * SurfaceSpotlight — the volumetric light lives on the surfaces, not the cursor.
 *
 * Rather than a glow that floats over the whole page, each glass/plate surface
 * reveals an accent spotlight *inside itself* (masked to its rounded box, via
 * the surface's own background gradient in globals.css) that rises only as the
 * cursor approaches. One pointer listener, rAF-batched, sets three CSS custom
 * properties (--spot-x/y/-i) on the few surfaces near the cursor and clears the
 * rest — no React state on the hot path, no per-element listeners.
 *
 * Fine-pointer only; disabled for touch and prefers-reduced-motion.
 */
export function SurfaceSpotlight() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    let surfaces: HTMLElement[] = [];
    const collect = () => {
      surfaces = Array.from(document.querySelectorAll<HTMLElement>(SELECTOR));
    };
    collect();

    let px = -9999;
    let py = -9999;
    let raf = 0;
    // Surfaces currently lit, so we can darken them once the cursor moves away.
    const lit = new Set<HTMLElement>();

    const update = () => {
      raf = 0;
      const stillLit = new Set<HTMLElement>();

      for (const el of surfaces) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;

        // Distance from the pointer to the surface rectangle (0 when inside).
        const dx = px < r.left ? r.left - px : px > r.right ? px - r.right : 0;
        const dy = py < r.top ? r.top - py : py > r.bottom ? py - r.bottom : 0;
        const dist = Math.hypot(dx, dy);
        if (dist > INFLUENCE) continue;

        // Eased 0..1 rise toward the surface — no glow at the edge of influence.
        const n = 1 - dist / INFLUENCE;
        el.style.setProperty("--spot-x", `${px - r.left}px`);
        el.style.setProperty("--spot-y", `${py - r.top}px`);
        el.style.setProperty("--spot-i", (n * n).toFixed(3));
        stillLit.add(el);
        lit.delete(el);
      }

      // Anything lit last frame but not this one goes dark.
      for (const el of lit) el.style.setProperty("--spot-i", "0");
      lit.clear();
      stillLit.forEach((el) => lit.add(el));
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const onMove = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      schedule();
    };
    const onLeave = () => {
      px = -9999;
      py = -9999;
      schedule();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("resize", collect);
    // Late-mounting surfaces (e.g. the GitHub panel opens on click).
    document.addEventListener("click", collect);

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", collect);
      document.removeEventListener("click", collect);
      cancelAnimationFrame(raf);
      lit.forEach((el) => {
        el.style.removeProperty("--spot-i");
        el.style.removeProperty("--spot-x");
        el.style.removeProperty("--spot-y");
      });
    };
  }, []);

  return null;
}
