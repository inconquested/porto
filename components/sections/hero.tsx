"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { BracketButton, EASE_OUT, Subtitle } from "@/components/section";

const PixelBlast = dynamic(() => import("@/components/PixelBlast"), { ssr: false });

function PixelBlastDeferred() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const nav = navigator as unknown as { connection?: { saveData?: boolean; effectiveType?: string }; deviceMemory?: number; hardwareConcurrency?: number };
    if (nav.connection?.saveData) return;
    if (nav.connection?.effectiveType && ["slow-2g", "2g", "3g"].includes(nav.connection.effectiveType)) return;
    if (nav.deviceMemory && nav.deviceMemory <= 4) return;
    if (typeof nav.hardwareConcurrency === "number" && nav.hardwareConcurrency <= 4) return;
    // skip entirely on coarse/mobile — WebGL diamond + ripples is the top mobile jank source
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(max-width: 768px)").matches) return;
    const cb = () => setReady(true);
    const w = window as unknown as { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
    if (w.requestIdleCallback) {
      const iid = w.requestIdleCallback(cb, { timeout: 1500 });
      return () => w.cancelIdleCallback?.(iid);
    }
    const t = globalThis.setTimeout(cb, 600);
    return () => globalThis.clearTimeout(t);
  }, []);
  if (!ready) return null;
  return (
    <PixelBlast
      variant="diamond"
      pixelSize={4}
      patternDensity={0.9}
      pixelSizeJitter={0.5}
      color="#6366f1"
      speed={0.5}
      enableRipples
      rippleIntensityScale={0.8}
      edgeFade={0.4}
      className="absolute inset-0"
      style={{ position: "absolute", inset: 0 }}
    />
  );
}

export function Hero({ hero }: { hero: { main: string; subtitle: string; cta: string } }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const isCoarse = typeof window !== "undefined" ? window.matchMedia("(pointer: coarse)").matches : false;
  const disableParallax = !!reduce || isCoarse;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const fgOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const fgY = useTransform(scrollYProgress, [0, 0.6], [0, -60]);

  return (
    <section ref={ref} id="home" className="relative flex min-h-[100dvh] items-center overflow-hidden px-6">
      {!reduce && <PixelBlastDeferred />}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(72% 68% at 28% 44%, color-mix(in oklab, var(--background) 82%, transparent) 0%, transparent 72%)" }}
      />
      <motion.div style={disableParallax ? undefined : { opacity: fgOpacity, y: fgY }} className="relative mx-auto w-full max-w-6xl">
        <div className="max-w-3xl">
          <motion.h1
            initial={reduce ? false : { y: 14 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.7, ease: EASE_OUT, delay: 0.08 }}
            className="font-display text-[clamp(2.75rem,8.5vw,5.5rem)] leading-[0.95] tracking-tight [text-wrap:balance] will-change-transform"
            style={{ opacity: 1 }}
          >
            {hero.main}
          </motion.h1>
          <Subtitle text={hero.subtitle} className="mt-6 max-w-[56ch]" />
          <div className="mt-6 flex flex-wrap gap-2" aria-label="At a glance">
            <span className="chip text-accent">3 shipped systems</span>
            <span className="chip">Fullstack → AI</span>
            <span className="chip">Cimahi · Remote-ready</span>
            <span className="chip">Next.js · Laravel · Flutter</span>
          </div>
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.22 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <BracketButton href="#project" reduce={reduce}>
              {hero.cta}
            </BracketButton>
            <a href="#about" className="pill border border-line px-5 py-2.5 text-foreground/70 transition-colors hover:border-accent/30 hover:text-foreground">
              <span aria-hidden className="text-accent">·</span> Who I am
            </a>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
