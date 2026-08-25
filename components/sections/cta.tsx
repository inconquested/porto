"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Subtitle, EASE_OUT, SPRING_SOFT } from "@/components/section";
import {
  GithubLogo,
  LinkedinLogo,
  XLogo,
  EnvelopeSimple,
  WhatsappLogo,
  ArrowUpRight,
  CaretDown,
  Copy,
  Check,
  type Icon as PhosphorIcon,
} from "@phosphor-icons/react";

const SOCIALS = {
  github: { label: "GitHub", handle: "@inconquested", href: "https://github.com/inconquested", Icon: GithubLogo },
  linkedin: { label: "LinkedIn", handle: "in/muhamad-revan-aulia", href: "https://www.linkedin.com/in/muhamad-revan-aulia", Icon: LinkedinLogo },
  x: { label: "X", handle: "@magicworks", href: "https://x.com/magicworks.dev", Icon: XLogo },
  email: { label: "Email", handle: "hello@magicworks.dev", href: "mailto:hello@magicworks.dev", Icon: EnvelopeSimple },
  whatsapp: { label: "WhatsApp", handle: "+62 812 0000 0000", href: "https://wa.me/6285187287828", Icon: WhatsappLogo },
} satisfies Record<string, { label: string; handle: string; href: string; Icon: PhosphorIcon }>;

type ReachChannel = { key: string; label: string; handle: string; href: string; Icon: PhosphorIcon };
const REACH_CHANNELS: ReachChannel[] = (["email", "whatsapp", "linkedin", "github", "x"] as const).map((k) => ({ key: k, ...SOCIALS[k] }));
type PopoverPos = { left: number; placement: "up" | "down"; top?: number; bottom?: number };

export function ReachOut({ reduce, label }: { reduce: boolean | null; label: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState<PopoverPos | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  const place = useCallback(() => {
    const btn = triggerRef.current;
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    const GAP = 14;
    const ESTIMATED = 380;
    const spaceAbove = r.top;
    const spaceBelow = window.innerHeight - r.bottom;
    const up = !(spaceAbove < ESTIMATED && spaceBelow > spaceAbove);
    setPos({ left: r.left + r.width / 2, placement: up ? "up" : "down", ...(up ? { bottom: window.innerHeight - r.top + GAP } : { top: r.bottom + GAP }) });
  }, []);

  const toggle = () => {
    if (!open) place();
    setOpen((v) => !v);
  };

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (rootRef.current?.contains(t) || popoverRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    const onReflow = () => place();
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onReflow, { passive: true });
    window.addEventListener("resize", onReflow);
    const raf = requestAnimationFrame(() => itemRefs.current[0]?.focus());
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onReflow);
      window.removeEventListener("resize", onReflow);
      cancelAnimationFrame(raf);
    };
  }, [open, place]);

  const onItemKey = (e: React.KeyboardEvent, i: number) => {
    const n = REACH_CHANNELS.length;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      itemRefs.current[(i + 1) % n]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      itemRefs.current[(i - 1 + n) % n]?.focus();
    }
  };

  const copyEmail = async (email: string) => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  };

  return (
    <div ref={rootRef} className="relative inline-flex flex-col items-center">
      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && pos && (
              <motion.div
                ref={popoverRef}
                role="menu"
                aria-label="Contact channels"
                style={{ left: pos.left, top: pos.top, bottom: pos.bottom }}
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: pos.placement === "up" ? 10 : -10, scale: 0.96 }}
                animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: pos.placement === "up" ? 8 : -8, scale: 0.97 }}
                transition={{ duration: 0.24, ease: EASE_OUT }}
                className="glass fixed z-[80] max-h-[80dvh] w-[min(88vw,340px)] -translate-x-1/2 overflow-y-auto rounded-2xl p-2.5 text-left"
              >
                <p className="flex items-center justify-between px-3 pb-2 pt-1 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                  <span>
                    <span className="text-accent">{"> "}</span>select channel
                  </span>
                  <span className="text-accent/70">[{REACH_CHANNELS.length}]</span>
                </p>
                <ul className="flex flex-col">
                  {REACH_CHANNELS.map((c, i) => {
                    const external = c.href.startsWith("http");
                    return (
                      <li key={c.key} className="group/row flex items-center">
                        <a
                          ref={(el) => {
                            itemRefs.current[i] = el;
                          }}
                          role="menuitem"
                          href={c.href}
                          {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
                          onKeyDown={(e) => onItemKey(e, i)}
                          onClick={() => setOpen(false)}
                          className={cn("flex flex-1 items-center gap-3 rounded-xl px-3 py-2.5 outline-none", "transition-colors duration-200", "hover:bg-accent/10 focus-visible:bg-accent/10")}
                        >
                          <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-line bg-surface-2 text-foreground transition-colors group-hover/row:border-accent/40 group-hover/row:text-accent">
                            <c.Icon size={18} weight="regular" aria-hidden />
                          </span>
                          <span className="flex min-w-0 flex-col">
                            <span className="text-sm text-foreground">{c.label}</span>
                            <span className="truncate font-mono text-[11px] text-muted-foreground">{c.handle}</span>
                          </span>
                          <ArrowUpRight size={15} weight="bold" aria-hidden className="ml-auto shrink-0 text-muted-foreground opacity-0 transition-all duration-200 group-hover/row:translate-x-0.5 group-hover/row:text-accent group-hover/row:opacity-100" />
                        </a>
                        {c.key === "email" && (
                          <button type="button" onClick={() => copyEmail(c.handle)} aria-label={copied ? "Email address copied" : "Copy email address"} className="mr-1 grid size-8 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-accent/10 hover:text-accent">
                            {copied ? <Check size={15} weight="bold" aria-hidden /> : <Copy size={15} aria-hidden />}
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}

      <motion.button
        ref={triggerRef}
        type="button"
        onClick={toggle}
        aria-haspopup="menu"
        aria-expanded={open}
        whileHover={reduce ? undefined : { y: -2 }}
        whileTap={reduce ? undefined : { scale: 0.97 }}
        transition={SPRING_SOFT}
        className={cn("pill group relative gap-2 border border-accent px-6 py-3 text-[13px]", "text-foreground transition-colors duration-300 ease-out", "hover:bg-accent hover:text-accent-foreground", open && "bg-accent text-accent-foreground")}
      >
        <span aria-hidden className={cn("transition-colors group-hover:text-accent-foreground", open ? "text-accent-foreground" : "text-accent")}>
          {">"}
        </span>
        <span>{label}</span>
        <CaretDown size={14} weight="bold" aria-hidden className={cn("transition-transform duration-300", open && "rotate-180")} />
      </motion.button>
    </div>
  );
}

export type CtaProps = { eyebrow: string; title: string; subtitle: string; button: string };

export function CallToAction({ cta }: { cta: CtaProps }) {
  const reduce = useReducedMotion();
  return (
    <section id="cta" className="relative isolate mx-auto flex min-h-[70vh] w-full max-w-5xl scroll-mt-28 flex-col items-center justify-center overflow-hidden px-6 py-32 text-center">
      <p className="chip mb-8 text-accent accent-glow">
        <span className="mr-2 select-none font-mono text-accent accent-glow">{">"}</span>
        {cta.eyebrow}
      </p>
      <motion.h2
        initial={reduce ? false : { opacity: 0, y: 26 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8, ease: EASE_OUT }}
        className="mx-auto max-w-3xl font-display text-[clamp(2.6rem,7vw,5.5rem)] leading-[0.98] tracking-tight"
        id="cta-heading"
      >
        {cta.title}
      </motion.h2>
      <Subtitle text={cta.subtitle} center className="mt-8" />
      <div className="mt-12">
        <ReachOut reduce={reduce} label={cta.button} />
      </div>
    </section>
  );
}
