"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion, type MotionProps } from "framer-motion";
import { DitherImage, DitherImageContent, DitherImageFrame } from "@/components/ui/dither-image";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { TechLogo } from "@/components/tech-logo";
import { Corners, EASE_OUT, SectionHead, SectionShell, SPRING_SOFT } from "@/components/section";
import { ArrowUpRight, GithubLogo, X } from "@phosphor-icons/react";

type CaseStudy = { problem: string; solution: string; highlights: string[] };
type Work = {
  title: string;
  subtitle: string;
  description: string;
  tech_stack?: string[];
  demo_url?: string;
  repo_url?: string;
  case_study?: CaseStudy;
};

const WORK_IMAGES = ["/images/scenery_1.png", "/images/scenery_2.png", "/images/scenery_1.png"];

export type ProjectProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  lists: Work[];
  study: { label: string; problem: string; solution: string; highlights: string; close: string };
};

export function WorksSection({ project }: { project: ProjectProps }) {
  const reduce = useReducedMotion();
  const [study, setStudy] = useState<Work | null>(null);
  const safeWorks = Array.isArray(project.lists) ? project.lists : [];
  if (safeWorks.length === 0) {
    return (
      <SectionShell id="project">
        <SectionHead title={project.title} subtitle={project.subtitle} eyebrow={project.eyebrow} id="project-heading" />
        <div className="plate mt-12 rounded-xl p-8 text-center">
          <p className="font-mono text-sm text-muted-foreground">No projects to show yet — check back soon.</p>
        </div>
      </SectionShell>
    );
  }
  return (
    <SectionShell id="project">
      <SectionHead title={project.title} subtitle={project.subtitle} eyebrow={project.eyebrow} id="project-heading" />
      <div className="mt-16 grid gap-x-10 gap-y-20 md:grid-cols-2">
        {safeWorks.map((w, i) => (
          <WorkCard key={`${w.title}-${i}`} work={w} image={WORK_IMAGES[i % WORK_IMAGES.length]} index={i} reduce={reduce} onStudy={setStudy} />
        ))}
      </div>
      <CaseStudyModal work={study} onClose={() => setStudy(null)} reduce={reduce} study={project.study} />
    </SectionShell>
  );
}

function WorkCard({ work, image, index, reduce, onStudy }: { work: Work; image: string; index: number; reduce: boolean | null; onStudy: (w: Work) => void }) {
  const title = (work.title || "Untitled").slice(0, 120);
  const subtitle = (work.subtitle || "").slice(0, 160);
  const description = (work.description || "").slice(0, 420);
  return (
    <motion.article
      initial={reduce ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.75, ease: EASE_OUT, delay: index * 0.08 }}
      className={cn("group flex min-w-0 flex-col", index % 2 === 1 && "md:mt-20")}
    >
      <motion.div whileHover={reduce ? undefined : { y: -8 }} transition={SPRING_SOFT} className="relative">
        <Corners />
        <div className="mask-squircle relative overflow-hidden bg-surface-2">
          <DitherImage className="w-full">
            <DitherImageFrame aspectRatio="video" size="lg" rounded={false} contrast={140} invertOnLight>
              <DitherImageContent src={image} alt={`${work.title}, ${work.subtitle}`} fill sizes="(max-width: 768px) 100vw, 50vw" />
            </DitherImageFrame>
          </DitherImage>
          <Image src={image} alt="" aria-hidden fill sizes="(max-width: 768px) 100vw, 50vw" className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-700 ease-out group-hover:opacity-100" />
          <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(120% 80% at 28% 0%, rgba(255,255,255,0.14), transparent 58%)" }} />
        </div>
      </motion.div>

      <div className="mt-7 flex min-w-0 items-baseline justify-between gap-4">
        <h3 className="min-w-0 flex-1 font-display text-3xl leading-none tracking-tight [overflow-wrap:anywhere] [hyphens:auto]">{title}</h3>
        <span className="shrink-0 font-mono text-sm text-muted-foreground transition-colors duration-300 group-hover:text-accent">{"->"}</span>
      </div>
      <p className="mt-2 min-w-0 font-mono text-[13px] tracking-wide text-accent [overflow-wrap:anywhere]">{subtitle}</p>
      <p className="mt-4 max-w-[52ch] font-light leading-relaxed text-muted-foreground [overflow-wrap:anywhere] [text-wrap:pretty]">{description}</p>
      {work.tech_stack?.length ? (
        <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-2.5">
          {work.tech_stack.map((tech) => (
            <li key={tech} className="group/tech inline-flex items-center gap-2 font-mono text-[12px] text-foreground/70 transition-colors duration-200 hover:text-foreground">
              <TechLogo tech={tech} />
              {tech}
            </li>
          ))}
        </ul>
      ) : null}
      {(work.demo_url || work.repo_url || work.case_study) && (
        <div className="mt-6 flex flex-wrap items-center gap-3">
          {work.demo_url && (
            <a href={work.demo_url} target="_blank" rel="noreferrer" className="group/link inline-flex items-center gap-2 rounded-full border border-accent px-4 py-2 font-mono text-[12px] tracking-wide text-foreground transition-colors duration-300 hover:bg-accent hover:text-accent-foreground">
              <span aria-hidden className="text-accent transition-colors group-hover/link:text-accent-foreground">
                {">"}
              </span>
              Live Demo
              <ArrowUpRight size={13} weight="bold" aria-hidden />
            </a>
          )}
          {work.repo_url && (
            <a href={work.repo_url} target="_blank" rel="noreferrer" className="group/link inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 font-mono text-[12px] tracking-wide text-foreground/75 transition-colors duration-300 hover:border-accent/50 hover:text-foreground">
              <GithubLogo size={14} aria-hidden />
              Source
            </a>
          )}
          {work.case_study && (
            <button type="button" onClick={() => onStudy(work)} className="group/link inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 font-mono text-[12px] tracking-wide text-foreground/75 transition-colors duration-300 hover:border-accent/50 hover:text-foreground">
              <span aria-hidden className="text-accent">
                {"[+"}
              </span>
              Case Study
              <span aria-hidden className="text-accent">
                {"]"}
              </span>
            </button>
          )}
        </div>
      )}
    </motion.article>
  );
}

function CaseStudyModal({ work, onClose, reduce, study }: { work: Work | null; onClose: () => void; reduce: boolean | null; study: ProjectProps["study"] }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  useEffect(() => {
    if (!work) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const raf = requestAnimationFrame(() => closeRef.current?.focus());
    return () => {
      document.removeEventListener("keydown", onKey);
      cancelAnimationFrame(raf);
    };
  }, [work, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {work?.case_study && (
        <motion.div className="fixed inset-0 z-[80] grid place-items-center p-4 sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" onClick={onClose} aria-hidden />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`${work.title}: ${study.label}`}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.97 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.24, ease: EASE_OUT }}
            className="glass relative flex max-h-[85dvh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-line px-7 py-5">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent">
                  <span aria-hidden>{"// "}</span>
                  {study.label}
                </p>
                <h3 className="mt-2 font-display text-3xl leading-none tracking-tight">{work.title}</h3>
                <p className="mt-1.5 font-mono text-[12px] tracking-wide text-muted-foreground">{work.subtitle}</p>
              </div>
              <button ref={closeRef} type="button" onClick={onClose} aria-label={study.close} className="grid size-8 shrink-0 place-items-center rounded-md border border-line text-muted-foreground transition-colors hover:border-accent/50 hover:text-foreground">
                <X size={16} aria-hidden />
              </button>
            </div>

            <div className="overflow-y-auto px-7 py-6">
              <dl className="flex flex-col gap-7">
                <div>
                  <dt className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
                    <span aria-hidden className="mr-2">[?]</span>
                    {study.problem}
                  </dt>
                  <dd className="mt-2 max-w-[62ch] font-light leading-relaxed text-foreground/85">{work.case_study.problem}</dd>
                </div>
                <div>
                  <dt className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
                    <span aria-hidden className="mr-2">[!]</span>
                    {study.solution}
                  </dt>
                  <dd className="mt-2 max-w-[62ch] font-light leading-relaxed text-foreground/85">{work.case_study.solution}</dd>
                </div>
                <div>
                  <dt className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
                    <span aria-hidden className="mr-2">[*]</span>
                    {study.highlights}
                  </dt>
                  <dd>
                    <ul className="mt-2 flex flex-col gap-2.5">
                      {work.case_study.highlights.map((h) => (
                        <li key={h} className="flex items-baseline gap-3 font-light leading-relaxed text-foreground/85">
                          <span aria-hidden className="font-mono text-sm text-accent">
                            {">"}
                          </span>
                          {h}
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
              </dl>

              {work.tech_stack?.length ? (
                <ul className="mt-8 flex flex-wrap gap-x-4 gap-y-2.5 border-t border-line pt-6">
                  {work.tech_stack.map((tech) => (
                    <li key={tech} className="group/tech inline-flex items-center gap-2 font-mono text-[12px] text-foreground/70 transition-colors duration-200 hover:text-foreground">
                      <TechLogo tech={tech} />
                      {tech}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            {work.demo_url && (
              <div className="border-t border-line px-7 py-4">
                <a href={work.demo_url} target="_blank" rel="noreferrer" className="group/link inline-flex items-center gap-2 rounded-full border border-accent px-4 py-2 font-mono text-[12px] tracking-wide text-foreground transition-colors duration-300 hover:bg-accent hover:text-accent-foreground">
                  <span aria-hidden className="text-accent transition-colors group-hover/link:text-accent-foreground">
                    {">"}
                  </span>
                  Live Demo
                  <ArrowUpRight size={13} weight="bold" aria-hidden />
                </a>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
