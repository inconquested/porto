"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion, type MotionProps } from "framer-motion";
import { GithubActivity } from "@/components/github-activity";
import { TechLogo, formatCategory } from "@/components/tech-logo";
import { Corners, EASE_OUT, SectionHead, SectionShell } from "@/components/section";
import { cn } from "@/lib/utils";
import { CaretDown, Stack, TreeStructure, Brain, RocketLaunch, type Icon as PhosphorIcon } from "@phosphor-icons/react";

type Service = { title: string; subtitle: string; description: string };

const BENTO_SPAN = ["md:col-span-4", "md:col-span-2", "md:col-span-2", "md:col-span-4"];
const SERVICE_ICONS: PhosphorIcon[] = [Stack, TreeStructure, Brain, RocketLaunch];

function BentoTile({ service, index, reduce }: { service: Service; index: number; reduce: boolean | null }) {
  const Icon = SERVICE_ICONS[index % SERVICE_ICONS.length];
  const wide = BENTO_SPAN[index % BENTO_SPAN.length].includes("col-span-4");
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 26, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: EASE_OUT, delay: index * 0.08 }}
      className={cn("group/tile relative", BENTO_SPAN[index % BENTO_SPAN.length])}
    >
      <Corners />
      <div className="bezel h-full">
        <div className={cn("glass relative flex h-full flex-col justify-between gap-8 overflow-hidden rounded-xl p-7", "transition-[transform,opacity] duration-300 will-change-transform", "group-hover/bento:opacity-40 hover:!opacity-100")}>
          {wide && <span aria-hidden className="pointer-events-none absolute -right-12 -top-12 size-44 rounded-full opacity-70 blur-2xl" style={{ background: "radial-gradient(circle, var(--accent-glow) 0%, transparent 68%)" }} />}
          <div className="relative flex items-center justify-between">
            <span className="grid size-12 place-items-center rounded-xl border border-line bg-surface-2/70 text-accent accent-glow transition-transform duration-300 group-hover/tile:-translate-y-0.5 group-hover/tile:scale-105">
              <Icon size={24} weight="duotone" aria-hidden />
            </span>
            <span aria-hidden className="font-mono text-sm text-accent/50">
              {"[*]"}
            </span>
          </div>
          <div className="relative min-w-0">
            <h3 className="font-display text-2xl leading-none tracking-tight [overflow-wrap:anywhere] [hyphens:auto]">{service.title}</h3>
            <p className="mt-2 min-w-0 font-mono text-[13px] tracking-wide text-accent [overflow-wrap:anywhere]">{service.subtitle}</p>
            <p className="mt-4 font-light leading-relaxed text-muted-foreground [overflow-wrap:anywhere]">{service.description}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

const CIRCUIT_NODES = [
  { top: "10%", side: "right" },
  { top: "37%", side: "left" },
  { top: "60%", side: "right" },
  { top: "85%", side: "left" },
] as const;

function CircuitRail() {
  return (
    <aside aria-hidden className="relative hidden w-[120px] shrink-0 select-none font-mono lg:flex lg:flex-col">
      <div className="flex justify-between gap-1.5 pb-8">
        <span className="rotate-180 text-[10px] uppercase tracking-[0.25em] text-muted-foreground [writing-mode:vertical-rl]">build:stable</span>
        <span className="rotate-180 text-[10px] uppercase tracking-[0.25em] text-accent/60 [writing-mode:vertical-rl]">v1.0.0</span>
        <span className="rotate-180 text-[10px] uppercase tracking-[0.25em] text-accent accent-glow [writing-mode:vertical-rl]">./skills</span>
      </div>
      <div className="relative min-h-[320px] flex-1">
        <div className="circuit-trunk absolute left-1/2 top-0 h-full w-px -translate-x-1/2" />
        <span className="circuit-pulse absolute left-1/2 top-0 size-1.5 -translate-x-1/2 rounded-full bg-accent accent-glow" />
        {CIRCUIT_NODES.map((n, i) => (
          <div key={i} className="absolute left-1/2 -translate-y-1/2" style={{ top: n.top }}>
            <span className="absolute left-0 top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent" />
            <span className={cn("absolute top-1/2 h-px w-8 -translate-y-1/2 bg-accent/40", n.side === "right" ? "left-0" : "right-0")} />
            <span className={cn("circuit-node absolute top-1/2 grid size-3.5 -translate-y-1/2 place-items-center rounded-full border border-accent/60 bg-background", n.side === "right" ? "left-8 -translate-x-1/2" : "right-8 translate-x-1/2")}>
              <span className="size-1.5 rounded-full bg-accent" />
            </span>
          </div>
        ))}
      </div>
      <div className="pt-8 text-[11px] tracking-[0.15em] text-accent">└─ ready</div>
    </aside>
  );
}

function TechStackGrid({ techStack, reduce, reveal }: { techStack: Record<string, string[]>; reduce: boolean | null; reveal: (d?: number) => MotionProps }) {
  const entries = Object.entries(techStack);
  const primary = entries.slice(0, 4);
  const secondary = entries.slice(4);
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-20 lg:grid lg:grid-cols-[auto_1fr] lg:gap-12">
      <CircuitRail />
      <div>
        <div className="grid gap-x-12 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
          {primary.map(([cat, techs], i) => (
            <motion.div key={cat} {...reveal(Math.min(i, 3) * 0.05)} className="min-w-0">
              <h3 className="chip uppercase tracking-wider text-accent">
                <span aria-hidden>{"//"}</span>
                {formatCategory(cat)}
              </h3>
              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-3.5">
                {techs.map((tech) => (
                  <span key={tech} className="group/tech inline-flex items-center gap-2 font-mono text-sm text-foreground/75 transition-colors duration-200 hover:text-foreground [overflow-wrap:anywhere]">
                    <TechLogo tech={tech} />
                    <span className="min-w-0 break-words">{tech}</span>
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
        {secondary.length > 0 && (
          <>
            <AnimatePresence initial={false}>
              {open && (
                <motion.div initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }} animate={reduce ? { opacity: 1 } : { height: "auto", opacity: 1 }} exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }} transition={{ duration: 0.32, ease: EASE_OUT }} className="overflow-hidden">
                  <div className="mt-10 grid gap-x-12 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
                    {secondary.map(([cat, techs], i) => (
                      <motion.div key={cat} {...reveal(Math.min(i, 3) * 0.05)} className="min-w-0">
                        <h3 className="chip uppercase tracking-wider text-accent">
                          <span aria-hidden>{"//"}</span>
                          {formatCategory(cat)}
                        </h3>
                        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-3.5">
                          {techs.map((tech) => (
                            <span key={tech} className="group/tech inline-flex items-center gap-2 font-mono text-sm text-foreground/75 transition-colors duration-200 hover:text-foreground [overflow-wrap:anywhere]">
                              <TechLogo tech={tech} />
                              <span className="min-w-0 break-words">{tech}</span>
                            </span>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="mt-10 flex">
              <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="group inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 font-mono text-[12px] tracking-wide text-foreground/70 transition-colors hover:border-accent/40 hover:text-foreground">
                <span aria-hidden className="text-accent">
                  {open ? "[-]" : "[+]"}
                </span>
                {open ? "Show less" : `Show ${secondary.length} more stacks`}
                <CaretDown size={12} weight="bold" aria-hidden className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export type SkillsProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  lists: Service[];
  techStack: Record<string, string[]>;
};

export function SkillsSection({ skills }: { skills: SkillsProps }) {
  const reduce = useReducedMotion();
  const reveal = (delay = 0): MotionProps =>
    reduce ? {} : { initial: { opacity: 0, y: 24, filter: "blur(8px)" }, whileInView: { opacity: 1, y: 0, filter: "blur(0px)" }, viewport: { once: true, margin: "-80px" }, transition: { duration: 0.85, ease: EASE_OUT, delay } };

  return (
    <SectionShell id="skill">
      <SectionHead title={skills.title} subtitle={skills.subtitle} eyebrow={skills.eyebrow} id="skill-heading" />
      <div className="group/bento mt-16 grid gap-4 md:grid-cols-6">
        {skills.lists.map((s, i) => (
          <BentoTile key={s.title} service={s} index={i} reduce={reduce} />
        ))}
      </div>
      <TechStackGrid techStack={skills.techStack} reduce={reduce} reveal={reveal} />
      <div className="mt-14">
        <GithubActivity />
      </div>
    </SectionShell>
  );
}
