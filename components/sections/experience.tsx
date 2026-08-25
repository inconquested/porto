"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { Corners, DecodeText, EASE_OUT, SectionHead, SectionShell } from "@/components/section";
import { cn } from "@/lib/utils";

type Service = { title: string; subtitle: string; description: string };

function Timeline({ items, reduce }: { items: Service[]; reduce: boolean | null }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 65%", "end 60%"] });
  const fill = useSpring(scrollYProgress, { stiffness: 80, damping: 24 });
  const dropletY = useTransform(fill, [0, 1], ["0%", "100%"]);

  return (
    <div ref={ref} className="relative mt-16 md:mt-20">
      <div className="absolute bottom-0 left-4 top-0 w-px bg-line md:left-1/2 md:-translate-x-1/2">
        <motion.div style={{ scaleY: reduce ? 1 : fill }} className="h-full w-full origin-top bg-accent/70" />
        {!reduce && (
          <motion.span style={{ top: dropletY }} className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 font-mono text-lg text-accent accent-glow" aria-hidden>
            *
          </motion.span>
        )}
      </div>
      <div className="flex flex-col gap-14 md:gap-20">
        {items.map((item, i) => {
          const left = i % 2 === 0;
          return (
            <div key={item.title} className="relative grid grid-cols-[auto_1fr] gap-x-8 md:grid-cols-2 md:gap-x-16">
              <span className="absolute left-4 top-4 z-10 -translate-x-1/2 font-mono text-accent accent-glow md:left-1/2" aria-hidden>
                [+]
              </span>
              <motion.div
                initial={reduce ? false : { opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-90px" }}
                transition={{ duration: 0.7, ease: EASE_OUT }}
                className={cn("relative col-start-2", left ? "md:col-start-1" : "md:col-start-2")}
              >
                <Corners />
                <div className="bezel">
                  <div className={cn("glass rounded-xl p-6 md:p-7", left ? "md:text-right" : "")}>
                    <h3 className="font-display text-2xl leading-none tracking-tight">
                      <DecodeText text={item.title} />
                    </h3>
                    <p className="mt-2 font-mono text-[13px] tracking-wide text-accent">{item.subtitle}</p>
                    <p className="mt-4 font-light leading-relaxed text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export type ExperienceProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  lists: Service[];
};

export function ExperienceSection({ experience }: { experience: ExperienceProps }) {
  const reduce = useReducedMotion();
  return (
    <SectionShell id="experience">
      <SectionHead title={experience.title} subtitle={experience.subtitle} eyebrow={experience.eyebrow} id="experience-heading" />
      <Timeline items={experience.lists} reduce={reduce} />
    </SectionShell>
  );
}
