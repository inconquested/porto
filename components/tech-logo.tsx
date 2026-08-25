"use client";

import { cn } from "@/lib/utils";
import { TECH_LOGOS } from "@/lib/tech-logos";

export function formatCategory(key: string) {
  return key
    .replace(/_and_/g, " & ")
    .replace(/_/g, " ")
    .replace(/\bai\b/i, "AI")
    .replace(/\bui\b/i, "UI")
    .replace(/\bapi\b/i, "API")
    .replace(/\bml\b/i, "ML")
    .replace(/\borm\b/i, "ORM")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function TechLogo({ tech }: { tech: string }) {
  const logo = TECH_LOGOS[tech];
  const cls = "size-[18px] shrink-0 object-contain transition-transform duration-200 group-hover/tech:scale-110";

  if (!logo) {
    return (
      <span aria-hidden className="grid size-[18px] shrink-0 place-items-center rounded-[4px] border border-line font-mono text-[9px] leading-none text-muted-foreground">
        {tech.replace(/[^A-Za-z0-9]/g, "").slice(0, 2).toUpperCase()}
      </span>
    );
  }

  if (logo.themed) {
    return (
      <span className="relative grid size-[18px] shrink-0 place-items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/logos/${logo.slug}-light.svg`}
          alt=""
          aria-hidden
          width={18}
          height={18}
          loading="lazy"
          decoding="async"
          className={cn(cls, "absolute inset-0 opacity-100 transition-opacity duration-500 ease-out will-change-[opacity] motion-reduce:transition-none dark:opacity-0")}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/logos/${logo.slug}-dark.svg`}
          alt=""
          aria-hidden
          width={18}
          height={18}
          loading="lazy"
          decoding="async"
          className={cn(cls, "absolute inset-0 opacity-0 transition-opacity duration-500 ease-out will-change-[opacity] motion-reduce:transition-none dark:opacity-100")}
        />
      </span>
    );
  }

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`/logos/${logo.slug}.svg`} alt="" aria-hidden width={18} height={18} loading="lazy" className={cls} />
    </>
  );
}
