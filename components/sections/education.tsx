"use client";

import { motion, useReducedMotion, type MotionProps } from "framer-motion";
import { Corners, EASE_OUT, SectionHead, SectionShell } from "@/components/section";

export type EducationProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  lists: { title: string; subtitle: string; description: string };
};

export function EducationSection({ education }: { education: EducationProps }) {
  const reduce = useReducedMotion();
  const reveal = (delay = 0): MotionProps =>
    reduce ? {} : { initial: { opacity: 0, y: 24, filter: "blur(8px)" }, whileInView: { opacity: 1, y: 0, filter: "blur(0px)" }, viewport: { once: true, margin: "-80px" }, transition: { duration: 0.85, ease: EASE_OUT, delay } };

  return (
    <SectionShell id="education">
      <SectionHead title={education.title} subtitle={education.subtitle} eyebrow={education.eyebrow} id="education-heading" />
      <motion.div {...reveal(0.1)} className="relative mt-14">
        <Corners />
        <div className="bezel">
          <div className="glass rounded-xl p-8 md:p-12">
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-accent accent-glow">[+]</span>
              <h3 className="font-display text-3xl leading-none tracking-tight md:text-4xl">{education.lists.title}</h3>
            </div>
            <p className="mt-3 font-mono text-[13px] tracking-wide text-accent">{education.lists.subtitle}</p>
            <p className="mt-6 max-w-[62ch] font-light leading-relaxed text-muted-foreground">{education.lists.description}</p>
          </div>
        </div>
      </motion.div>
    </SectionShell>
  );
}
