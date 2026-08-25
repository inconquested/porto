"use client";

import { useRef } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, type MotionProps } from "framer-motion";
import { DitherImage, DitherImageContent, DitherImageFrame } from "@/components/ui/dither-image";
import { TechLogo } from "@/components/tech-logo";
import { Corners, EASE_OUT, Prompt, SectionHead, SectionShell, SectionTitle, TypeParagraph } from "@/components/section";
import { GithubLogo, LinkedinLogo, XLogo, EnvelopeSimple } from "@phosphor-icons/react";
import type { Icon as PhosphorIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

// Local socials reused in footer/cta but kept here for about's anchor row
const ABOUT_SOCIALS = [
  { label: "GitHub", href: "https://github.com/inconquested", Icon: GithubLogo },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/muhamad-revan-aulia", Icon: LinkedinLogo },
  { label: "X", href: "https://x.com/magicworks.dev", Icon: XLogo },
  { label: "Email", href: "mailto:hello@magicworks.dev", Icon: EnvelopeSimple },
] as const;

function SocialAnchors({ reduce }: { reduce: boolean | null }) {
  return (
    <div className="mt-9">
      <p className="chip mb-4 text-accent accent-glow">
        <Prompt />
        connect
      </p>
      <ul className="flex flex-wrap gap-2.5">
        {ABOUT_SOCIALS.map((s, i) => {
          const external = s.href.startsWith("http");
          return (
            <motion.li
              key={s.label}
              initial={reduce ? false : { opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, ease: EASE_OUT, delay: i * 0.06 }}
            >
              <a
                href={s.href}
                {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
                aria-label={s.label}
                className={cn(
                  "group inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 font-mono text-[12px] tracking-wide text-foreground/75",
                  "transition-colors duration-200 hover:border-accent/50 hover:bg-accent/5 hover:text-foreground",
                )}
              >
                <s.Icon size={16} weight="regular" aria-hidden className="shrink-0 text-muted-foreground transition-colors group-hover:text-accent" />
                <span aria-hidden className="text-accent">
                  [
                </span>
                <span>{s.label}</span>
                <span aria-hidden className="text-accent">
                  ]
                </span>
              </a>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}

function PortraitTerminal({ reduce }: { reduce: boolean | null }) {
  const ref = useRef<HTMLDivElement>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 150, damping: 15 });
  const sry = useSpring(ry, { stiffness: 150, damping: 15 });

  const onMove = (e: React.MouseEvent) => {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    ry.set(px * 12);
    rx.set(-py * 12);
  };
  const reset = () => {
    rx.set(0);
    ry.set(0);
  };

  return (
    <div className="relative w-[min(80vw,360px)]">
      <Corners />
      <motion.div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={reset}
        style={reduce ? undefined : { rotateX: srx, rotateY: sry, transformPerspective: 1000 }}
        className="bezel [transform-style:preserve-3d]"
      >
        <div className="glass rounded-xl p-3">
          <div className="mb-2 flex items-center justify-between px-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            <span>revan@magicworks</span>
            <span className="text-accent">~/portrait</span>
          </div>
          <div className="mask-arch overflow-hidden" style={{ transform: "translateZ(30px)" }}>
            <DitherImage className="w-full">
              <DitherImageFrame aspectRatio="portrait" size="md" rounded={false} contrast={150} invertOnLight>
                <DitherImageContent src="/images/scenery_1.png" alt="Muhamad Revan Aulia, software developer and founder of Magicworks" fill sizes="360px" priority />
              </DitherImageFrame>
            </DitherImage>
          </div>
          <p className="mt-3 px-1 font-mono text-[11px] text-muted-foreground" style={{ transform: "translateZ(20px)" }}>
            <span className="text-accent">&gt;</span> Muhamad Revan {"//"} Magicworks, Indonesia
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export type AboutProps = {
  eyebrow: string;
  title: string;
  lede: string;
  detail: string;
  facts: { label: string; value: string }[];
};

export function AboutSection({ about }: { about: AboutProps }) {
  const reduce = useReducedMotion();
  const reveal = (delay = 0): MotionProps =>
    reduce ? {} : { initial: { opacity: 0, y: 24, filter: "blur(8px)" }, whileInView: { opacity: 1, y: 0, filter: "blur(0px)" }, viewport: { once: true, margin: "-80px" }, transition: { duration: 0.85, ease: EASE_OUT, delay } };

  return (
    <SectionShell id="about">
      <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
        <div>
          <p className="chip mb-6 text-accent accent-glow">
            <Prompt />
            {about.eyebrow}
          </p>
          <SectionTitle id="about-heading">{about.title}</SectionTitle>
          <p className="mt-8 max-w-[38ch] font-display text-2xl leading-snug tracking-tight text-foreground/90 md:text-[26px]">
            <TypeParagraph text={about.lede} reduce={reduce} />
          </p>
          <dl className="mt-9 grid gap-x-10 gap-y-4 sm:grid-cols-2">
            {about.facts.map((f) => (
              <div key={f.label} className="flex items-baseline gap-3">
                <dt className="shrink-0 font-mono text-[11px] uppercase tracking-[0.15em] text-accent">{f.label}</dt>
                <dd className="font-light text-[15px] text-foreground/85">{f.value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-8 max-w-[52ch] font-light leading-relaxed text-muted-foreground">{about.detail}</p>
          <SocialAnchors reduce={reduce} />
        </div>
        <motion.div {...reveal(0.1)} className="justify-self-center">
          <PortraitTerminal reduce={reduce} />
        </motion.div>
      </div>
    </SectionShell>
  );
}
