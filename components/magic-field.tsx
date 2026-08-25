"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

/**
 * MagicField — the ambient "mana dust" layer (Task 5, magicworks decor).
 *
 * A single fixed <canvas> of drifting, twinkling motes that wire themselves into
 * faint constellations and lean toward the cursor like iron filings to a wand.
 * One gsap.ticker drives everything (no per-particle tweens, no per-frame allocs
 * — see gsap-performance). Sits behind content (z-[1]) so frosted-glass panels
 * blur it. The mote field parallax-slides at 60% of scroll speed. Honors
 * prefers-reduced-motion by painting a single static frame, and pauses while
 * the tab is hidden.
 */
export function MagicField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx2d = canvas?.getContext("2d");
    if (!canvas || !ctx2d) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Accent colour, kept in sync with the active theme (light/dark toggle).
    const rgb = { r: 129, g: 140, b: 248 };
    const readAccent = () => {
      const dark = document.documentElement.classList.contains("dark");
      // matches --accent in globals.css (light #4f46e5 / dark #818cf8)
      if (dark) Object.assign(rgb, { r: 129, g: 140, b: 248 });
      else Object.assign(rgb, { r: 79, g: 70, b: 229 });
    };
    readAccent();
    const themeObserver = new MutationObserver(readAccent);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    type Mote = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
      a: number; // base alpha
      tw: number; // twinkle phase
      ts: number; // twinkle speed
    };

    let motes: Mote[] = [];
    let w = 0;
    let h = 0;
    let dpr = 1;
    const LINK = 120; // constellation link distance (css px)
    const PULL = 220; // cursor influence radius (css px) — wide, volumetric field
    const pointer = { x: -9999, y: -9999, active: false };

    const rand = (min: number, max: number) => min + Math.random() * (max - min);

    const build = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);

      // density scaled to viewport area, capped for perf
      const count = Math.min(96, Math.round((w * h) / 24000));
      motes = Array.from({ length: count }, () => ({
        x: rand(0, w),
        y: rand(0, h),
        vx: rand(-0.06, 0.06),
        vy: rand(-0.22, -0.05), // drift gently upward, like embers
        r: rand(0.6, 1.9),
        a: rand(0.18, 0.5),
        tw: rand(0, Math.PI * 2),
        ts: rand(0.008, 0.03),
      }));
    };

    const draw = (dt: number) => {
      ctx2d.clearRect(0, 0, w, h);
      const { r, g, b } = rgb;

      // Parallax: the field is a viewport-sized window sliding through a
      // taller virtual field at 60% of scroll speed, so it drifts behind the
      // page content as you scroll instead of sitting pinned to the glass.
      const sy = window.scrollY * 0.6;
      const py = (p: Mote) => ((p.y - sy) % h + h) % h;

      // constellation links first (behind the motes), on parallaxed positions
      for (let i = 0; i < motes.length; i++) {
        const p = motes[i];
        const px = p.x;
        const pyy = py(p);
        for (let j = i + 1; j < motes.length; j++) {
          const q = motes[j];
          const dx = px - q.x;
          const dy = pyy - py(q);
          const d2 = dx * dx + dy * dy;
          if (d2 < LINK * LINK) {
            const t = 1 - Math.sqrt(d2) / LINK;
            ctx2d.strokeStyle = `rgba(${r},${g},${b},${t * 0.12})`;
            ctx2d.lineWidth = 1;
            ctx2d.beginPath();
            ctx2d.moveTo(px, pyy);
            ctx2d.lineTo(q.x, py(q));
            ctx2d.stroke();
          }
        }
      }

      for (const p of motes) {
        if (dt > 0) {
          // cursor gravity — a soft pull toward the wand tip
          if (pointer.active) {
            const dx = pointer.x - p.x;
            const dy = pointer.y - p.y;
            const dist = Math.hypot(dx, dy);
            if (dist < PULL && dist > 0.01) {
              // eased falloff (smoothstep) so the pull swells softly toward the
              // cursor instead of snapping — reads as a volumetric draw.
              const n = (PULL - dist) / PULL;
              const f = n * n * (3 - 2 * n) * 0.32;
              p.vx += (dx / dist) * f * dt;
              p.vy += (dy / dist) * f * dt;
            }
          }
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.vx *= 0.96; // damping keeps drift calm
          p.vy = p.vy * 0.96 - 0.03 * dt; // gentle upward bias
          p.tw += p.ts * dt;

          // wrap around edges so the field never empties
          if (p.y < -4) p.y = h + 4;
          if (p.y > h + 4) p.y = -4;
          if (p.x < -4) p.x = w + 4;
          if (p.x > w + 4) p.x = -4;
        }

        const yy = py(p);
        const twinkle = 0.55 + 0.45 * Math.sin(p.tw);
        const alpha = p.a * twinkle;
        const glow = pointer.active
          ? Math.max(0, 1 - Math.hypot(pointer.x - p.x, pointer.y - yy) / PULL)
          : 0;

        ctx2d.beginPath();
        ctx2d.arc(p.x, yy, p.r + glow * 1.2, 0, Math.PI * 2);
        ctx2d.fillStyle = `rgba(${r},${g},${b},${Math.min(1, alpha + glow * 0.4)})`;
        ctx2d.fill();
      }
    };

    build();

    if (reduce) {
      draw(0); // one static frame, no motion
      return () => {
        themeObserver.disconnect();
      };
    }

    const onMove = (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
    };
    const onLeave = () => {
      pointer.active = false;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerout", onLeave, { passive: true });

    let resizeRaf = 0;
    const onResize = () => {
      cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(build);
    };
    window.addEventListener("resize", onResize);

    const tick = (_t: number, deltaMs: number) => {
      // normalize to ~60fps steps, clamp big gaps (tab refocus)
      const dt = Math.min(deltaMs / 16.67, 3);
      draw(dt);
    };
    gsap.ticker.add(tick);

    const onVisibility = () => {
      if (document.hidden) gsap.ticker.remove(tick);
      else gsap.ticker.add(tick);
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      gsap.ticker.remove(tick);
      themeObserver.disconnect();
      cancelAnimationFrame(resizeRaf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerout", onLeave);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[1]"
    />
  );
}
