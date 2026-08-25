"use client";

import { useRef } from "react";
import { motion, useInView, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "@phosphor-icons/react";

export const EASE_OUT = [0.22, 1, 0.36, 1] as const;
export const SPRING_SOFT = { type: "spring", stiffness: 220, damping: 26, mass: 0.9 } as const;

export function Prompt({ symbol = ">" }: { symbol?: string }) {
  return <span className="mr-2 select-none font-mono text-accent accent-glow">{symbol}</span>;
}

export function Corners() {
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0 z-10 font-mono text-xs text-accent/70">
      <span className="absolute -left-1.5 -top-2.5">+</span>
      <span className="absolute -right-1.5 -top-2.5">+</span>
      <span className="absolute -bottom-2.5 -left-1.5">+</span>
      <span className="absolute -bottom-2.5 -right-1.5">+</span>
    </span>
  );
}

export function SectionShell({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="mx-auto w-full max-w-6xl scroll-mt-28 px-6 py-24 md:py-36">
      {children}
    </section>
  );
}

export function SectionTitle({ children, id }: { children: React.ReactNode; id?: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <h2 ref={ref} id={id} className="relative font-display text-[clamp(2.5rem,6vw,4.5rem)] leading-[0.98] tracking-tight [overflow-wrap:anywhere] [hyphens:auto]">
      <span className="text-accent accent-glow">{">"}</span> {children}
      <span aria-hidden className={cn("title-sheen pointer-events-none absolute inset-0", inView && "run")}>
        <span>{">"}</span> {children}
      </span>
    </h2>
  );
}

export function AccentTitle({ raw }: { raw: string }) {
  const parts = raw.split(/\*([^*]+)\*/);
  if (parts.length === 1) return <>{raw}</>;
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} className="text-accent accent-glow">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

export function SectionHead({ title, subtitle, eyebrow, id }: { title: string; subtitle?: string; eyebrow?: string; id?: string }) {
  return (
    <div className="max-w-3xl">
      {eyebrow ? (
        <p className="chip mb-6 text-accent accent-glow">
          <Prompt />
          {eyebrow}
        </p>
      ) : null}
      <SectionTitle id={id}>
        <AccentTitle raw={title} />
      </SectionTitle>
      {subtitle ? <Subtitle text={subtitle} /> : null}
    </div>
  );
}

// ── Word-stagger paragraph ──
export function TypeParagraph({ text, reduce }: { text: string; reduce: boolean | null }) {
  const words = text.split(" ");
  if (reduce) return <span>{text}</span>;
  return (
    <>
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.02, delay: Math.min(i * 0.012, 1.4) }}
        >
          {word}{" "}
        </motion.span>
      ))}
    </>
  );
}

export function Subtitle({ text, center = false, className }: { text: string; center?: boolean; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <p className={cn("mt-6 max-w-[58ch] font-light text-[17px] leading-relaxed text-muted-foreground md:text-lg", center && "mx-auto", className)}>
      <span aria-hidden className="mr-3 select-none font-mono text-sm text-accent accent-glow">
        {"//"}
      </span>
      <TypeParagraph text={text} reduce={reduce} />
    </p>
  );
}

// ── Decode-in text ──
const SCRAMBLE = "!<>-_\\/[]{}=+*^?#01";

import { useEffect, useState } from "react";

export function DecodeText({ text, className }: { text: string; className?: string }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    if (reduce || !inView) return;
    const total = 14;
    let frame = 0;
    const id = setInterval(() => {
      frame += 1;
      const revealCount = Math.floor((frame / total) * text.length);
      setDisplay(
        text
          .split("")
          .map((c, i) => {
            if (c === " ") return " ";
            if (i < revealCount) return c;
            return SCRAMBLE[((i + frame) * 7) % SCRAMBLE.length];
          })
          .join(""),
      );
      if (frame >= total) {
        clearInterval(id);
        setDisplay(text);
      }
    }, 32);
    return () => clearInterval(id);
  }, [inView, reduce, text]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}

export function BracketButton({
  href,
  children,
  reduce,
  magnetic = false,
  primary = false,
}: {
  href: string;
  children: React.ReactNode;
  reduce: boolean | null;
  magnetic?: boolean;
  primary?: boolean;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 15 });
  const sy = useSpring(y, { stiffness: 200, damping: 15 });

  const onMove = (e: React.MouseEvent) => {
    if (reduce || !magnetic || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * 0.35);
    y.set((e.clientY - (r.top + r.height / 2)) * 0.35);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.a
      ref={ref}
      href={href}
      onMouseMove={onMove}
      onMouseLeave={reset}
      style={reduce || !magnetic ? undefined : { x: sx, y: sy }}
      whileHover={reduce || magnetic ? undefined : { y: -2 }}
      whileTap={{ scale: 0.97 }}
      transition={SPRING_SOFT}
      className={cn(
        "pill group relative gap-2 border px-5 py-2.5 text-[13px] active:scale-[0.98]",
        "text-foreground transition-colors duration-300 ease-out",
        "hover:bg-accent hover:text-accent-foreground",
        primary ? "border-accent" : "border-line",
      )}
    >
      <span aria-hidden className="text-accent transition-colors group-hover:text-accent-foreground">
        {">"}
      </span>
      <span aria-hidden className="max-w-0 overflow-hidden opacity-0 transition-all duration-300 group-hover:max-w-[4ch] group-hover:opacity-100">
        {"===="}
      </span>
      <span>{children}</span>
      <span
        aria-hidden
        className="grid size-8 shrink-0 place-items-center rounded-full border border-line bg-surface-2/60 text-accent transition-[transform,background-color,border-color] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1 group-hover:-translate-y-[1px] group-hover:scale-105 group-hover:border-accent/50 group-hover:bg-accent/15 group-hover:text-accent-foreground"
      >
        <ArrowUpRight size={14} weight="light" aria-hidden />
      </span>
    </motion.a>
  );
}
