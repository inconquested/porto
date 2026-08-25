"use client";

import { useState, useTransition } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  GitCommit,
  CaretDown,
  ArrowSquareOut,
  ArrowClockwise,
  GithubLogo,
} from "@phosphor-icons/react";
import {cn} from "@/lib/utils"
import { getGithubActivity, type GithubActivityResult } from "@/app/actions";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

/** Compact relative time ("3h", "2d"), terminal-log style. Client-only, so no
 *  hydration risk — the list is fetched after the panel is first opened. */
function relTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.round(diff / 60000);
  if (min < 1) return "now";
  if (min < 60) return `${min}m`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h`;
  const day = Math.round(hr / 24);
  if (day < 7) return `${day}d`;
  const wk = Math.round(day / 7);
  if (wk < 5) return `${wk}w`;
  return `${Math.round(day / 30)}mo`;
}

/**
 * GitHub activity panel (Task: "collapsible tab connected to my github").
 * Hidden until the terminal trigger is clicked; on first open it lazily calls
 * the `getGithubActivity` server action and renders the recent commits as a
 * `git log`. Handles loading / empty / error states. Reduced-motion safe.
 */
export function GithubActivity() {
  const t = useTranslations("Github");
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<GithubActivityResult | null>(null);
  const [pending, startTransition] = useTransition();

  const load = () => {
    startTransition(async () => {
      const res = await getGithubActivity();
      setData(res);
    });
  };

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next && !data && !pending) load();
  };

  const retry = () => {
    setData(null);
    load();
  };

  const commits = data?.ok ? data.commits : [];
  const failed = data != null && (!data.ok || data.commits.length === 0);

  return (
    <div className="relative">
      {/* Terminal trigger — the collapsible only exists once clicked */}
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-controls="github-activity-panel"
        className={cn(
          "glass group flex w-full items-center justify-between gap-4 rounded-xl px-5 py-4 text-left",
          "transition-colors duration-200 hover:border-accent/40",
        )}
      >
        <span className="flex min-w-0 items-center gap-3 font-mono text-[13px]">
          <GitCommit
            size={18}
            weight="bold"
            aria-hidden
            className="shrink-0 text-accent accent-glow"
          />
          <span aria-hidden className="text-accent">
            $
          </span>
          <span className="truncate text-foreground/85">{t("trigger")}</span>
        </span>
        <span className="flex shrink-0 items-center gap-3">
          {open && pending && (
            <ArrowClockwise
              size={15}
              aria-hidden
              className="animate-spin text-muted-foreground"
            />
          )}
          <CaretDown
            size={15}
            weight="bold"
            aria-hidden
            className={cn(
              "text-muted-foreground transition-transform duration-300 group-hover:text-accent",
              open && "rotate-180",
            )}
          />
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id="github-activity-panel"
            initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={reduce ? { opacity: 1 } : { height: "auto", opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: EASE_OUT }}
            className="overflow-hidden"
          >
            <div className="mt-3">
              <div className="plate rounded-xl p-3">
                {/* Panel header — reads as a comment line in the log */}
                <div className="flex items-center justify-between px-2 pb-2 pt-1">
                  <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                    <span aria-hidden className="text-accent">
                      {"// "}
                    </span>
                    {t("title")}
                  </span>
                  {data?.profileUrl && (
                    <a
                      href={data.profileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="group/link inline-flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground transition-colors hover:text-accent"
                    >
                      <GithubLogo size={13} aria-hidden />
                      {t("profile")}
                      <ArrowSquareOut
                        size={11}
                        aria-hidden
                        className="transition-transform group-hover/link:translate-x-0.5"
                      />
                    </a>
                  )}
                </div>

                {/* Loading skeleton — matches the commit row layout */}
                {pending && commits.length === 0 && (
                  <ul className="flex flex-col gap-1" aria-hidden>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-3 rounded-lg px-2 py-2.5"
                      >
                        <span className="h-3 w-14 shrink-0 animate-pulse rounded bg-line" />
                        <span
                          className="h-3 flex-1 animate-pulse rounded bg-line"
                          style={{ maxWidth: `${70 - i * 6}%` }}
                        />
                      </li>
                    ))}
                  </ul>
                )}

                {/* Error / empty state */}
                {!pending && failed && (
                  <div className="flex flex-col items-start gap-3 px-2 py-4">
                    <p className="font-mono text-[13px] text-muted-foreground">
                      <span aria-hidden className="text-destructive">
                        {"! "}
                      </span>
                      {data && !data.ok ? t("error") : t("empty")}
                    </p>
                    <button
                      type="button"
                      onClick={retry}
                      className="inline-flex items-center gap-2 rounded-full border border-line px-3.5 py-1.5 font-mono text-[12px] text-foreground/80 transition-colors hover:border-accent/50 hover:text-accent"
                    >
                      <ArrowClockwise size={13} aria-hidden />
                      {t("retry")}
                    </button>
                  </div>
                )}

                {/* Commit log */}
                {commits.length > 0 && (
                  <ul className="flex flex-col">
                    {commits.map((c) => (
                      <li key={c.id}>
                        <a
                          href={c.url}
                          target="_blank"
                          rel="noreferrer"
                          className={cn(
                            "group/row grid grid-cols-[auto_1fr_auto] items-baseline gap-3 rounded-lg px-2 py-2.5 outline-none",
                            "transition-colors duration-200 hover:bg-accent/5 focus-visible:bg-accent/5",
                          )}
                        >
                          <span className="font-mono text-[12px] text-accent">
                            {c.sha}
                          </span>
                          <span className="flex min-w-0 flex-col">
                            <span className="truncate text-sm text-foreground/85 transition-colors group-hover/row:text-foreground">
                              {c.message}
                            </span>
                            <span className="truncate font-mono text-[11px] text-muted-foreground">
                              {c.repo}
                              <span aria-hidden className="mx-1.5 text-accent/50">
                                ·
                              </span>
                              {relTime(c.date)}
                            </span>
                          </span>
                          <ArrowSquareOut
                            size={14}
                            aria-hidden
                            className="mt-0.5 shrink-0 text-muted-foreground opacity-0 transition-all duration-200 group-hover/row:translate-x-0.5 group-hover/row:text-accent group-hover/row:opacity-100"
                          />
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <p className="mt-3 px-1 font-mono text-[11px] text-muted-foreground">
                <span aria-hidden className="text-accent">
                  {"> "}
                </span>
                {t("caption")}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
