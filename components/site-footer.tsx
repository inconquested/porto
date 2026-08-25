"use client";

import { motion, useReducedMotion, type MotionProps } from "framer-motion";
import { Subtitle, EASE_OUT } from "@/components/section";
import { CSRDefer } from "@/components/render-mode";
import { FooterGrid } from "@/components/footer-grid";
import { ArrowUp, GithubLogo, LinkedinLogo, EnvelopeSimple, XLogo, type Icon as PhosphorIcon } from "@phosphor-icons/react";

const WORDMARK = "Magicworks";
const FOOTER_NAV = [
  { key: "home", href: "#home" },
  { key: "about", href: "#about" },
  { key: "experience", href: "#experience" },
  { key: "project", href: "#project" },
  { key: "skill", href: "#skill" },
  { key: "education", href: "#education" },
  { key: "cta", href: "#cta" },
] as const;

const FOOTER_SOCIALS: { label: string; href: string; Icon: PhosphorIcon }[] = [
  { label: "GitHub", href: "https://github.com/inconquested", Icon: GithubLogo },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/muhamad-revan-aulia", Icon: LinkedinLogo },
  { label: "Email", href: "mailto:hello@magicworks.dev", Icon: EnvelopeSimple },
  { label: "X", href: "https://x.com/magicworks.dev", Icon: XLogo },
];

function ColLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
      <span aria-hidden className="text-accent">{"// "}</span>
      {children}
    </h3>
  );
}

export type FooterProps = {
  tagline: string;
  sitemap: string;
  connect: string;
  colophon: string;
  colophonText: string;
  location: string;
  rights: string;
  backToTop: string;
  header: Record<string, string>;
};

export function Footer({ footer }: { footer: FooterProps }) {
  const reduce = useReducedMotion();

  const toTop = () => window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });

  const reveal = (delay = 0): MotionProps =>
    reduce ? {} : { initial: { opacity: 0, y: 22, filter: "blur(6px)" }, whileInView: { opacity: 1, y: 0, filter: "blur(0px)" }, viewport: { once: true, margin: "-60px" }, transition: { duration: 0.75, ease: EASE_OUT, delay } };

  const bandHalf = (
    <span className="flex items-center overflow-y-visible">
      {Array.from({ length: 4 }).map((_, i) => (
        <span key={i} className="flex select-none items-center font-display leading-[0.9] tracking-tight text-foreground/90 text-[clamp(3.5rem,15vw,13rem)] overflow-y-visible">
          {WORDMARK}
          <span aria-hidden className="mx-[0.28em] text-[0.32em] text-accent accent-glow">
            &#10033;
          </span>
        </span>
      ))}
    </span>
  );

  return (
    <footer id="footer" className="footer-shell relative z-[2] w-full font-sans">
      <CSRDefer>
        <FooterGrid />
      </CSRDefer>
      <div className="relative z-[1] mx-auto w-full max-w-6xl px-6 pt-20 md:pt-28">
        <motion.div {...reveal()} className="flex items-center justify-between gap-4">
          <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">[ EOF ]</span>
        </motion.div>
      </div>

      <div className="relative z-[1] my-12 md:my-20">
        <h2 className="sr-only overflow-visible">{WORDMARK}</h2>
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 grid place-items-center">
          <div className="footer-glow h-[36vh] w-[62vw] rounded-full blur-3xl" style={{ background: "radial-gradient(circle, color-mix(in oklab, var(--accent) 22%, transparent) 0%, transparent 70%)" }} />
        </div>
        <div className="footer-marquee overflow-y-visible" aria-hidden>
          <div className="footer-marquee__track overflow-y-visible">
            {bandHalf}
            {bandHalf}
          </div>
        </div>
      </div>

      <div className="relative z-[1] mx-auto w-full max-w-6xl px-6 pb-20 md:pb-28">
        <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-12 lg:gap-x-10">
          <motion.div {...reveal()} className="sm:col-span-2 lg:col-span-4">
            <Subtitle text={footer.tagline} className="mt-0" />
          </motion.div>

          <motion.nav {...reveal(0.05)} aria-label={footer.sitemap} className="lg:col-span-2 lg:col-start-6">
            <ColLabel>{footer.sitemap}</ColLabel>
            <ul className="mt-6 flex flex-col gap-3.5">
              {FOOTER_NAV.map(({ key, href }) => (
                <li key={key}>
                  <a href={href} className="group inline-flex items-center gap-2 font-mono text-sm uppercase tracking-wide text-foreground/70 transition-colors duration-200 hover:text-foreground">
                    <span aria-hidden className="text-accent">[</span>
                    <span>{footer.header[key] ?? key}</span>
                    <span aria-hidden className="text-accent">]</span>
                    <span aria-hidden className="cursor ml-0.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      &nbsp;
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </motion.nav>

          <motion.div {...reveal(0.1)} className="lg:col-span-2 lg:col-start-8">
            <ColLabel>{footer.connect}</ColLabel>
            <ul className="mt-6 flex flex-col gap-3.5">
              {FOOTER_SOCIALS.map(({ label, href, Icon }) => {
                const external = href.startsWith("http");
                return (
                  <li key={label}>
                    <a href={href} {...(external ? { target: "_blank", rel: "noreferrer" } : {})} className="group inline-flex items-center gap-3 font-mono text-sm text-foreground/70 transition-colors duration-200 hover:text-foreground">
                      <span aria-hidden className="text-accent transition-transform duration-200 group-hover:translate-x-0.5">
                        {">"}
                      </span>
                      <Icon size={18} weight="regular" aria-hidden className="shrink-0 text-muted-foreground transition-colors duration-200 group-hover:text-accent" />
                      <span>{label}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </motion.div>

          <motion.div {...reveal(0.15)} className="lg:col-span-3 lg:col-start-10">
            <ColLabel>{footer.colophon}</ColLabel>
            <p className="mt-6 max-w-[34ch] font-light leading-relaxed text-muted-foreground">{footer.colophonText}</p>
            <p className="mt-5 font-mono text-[13px] tracking-wide text-accent">
              <span aria-hidden>{"// "}</span>
              {footer.location}
            </p>
          </motion.div>
        </div>

        <div className="mt-20 flex flex-col items-start justify-between gap-6 border-t border-line pt-8 sm:flex-row sm:items-center">
          <p className="font-mono text-[12px] tracking-wide text-muted-foreground">
            [ © {new Date().getFullYear()} Magicworks ] <span className="text-foreground/45">{footer.rights}</span>
          </p>
          <button type="button" onClick={toTop} className="group inline-flex items-center gap-2 font-mono text-[12px] uppercase tracking-wider text-muted-foreground transition-colors duration-200 hover:text-foreground">
            {footer.backToTop}
            <ArrowUp size={14} weight="bold" aria-hidden className="text-accent transition-transform duration-200 group-hover:-translate-y-0.5" />
          </button>
        </div>
      </div>
    </footer>
  );
}
