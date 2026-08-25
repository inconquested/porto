"use client";
import { createContext, useContext, useEffect, useState } from "react";

const Ctx = createContext(false); // true = CSR (mobile / poor perf / poor net)

/**
 * RenderModeProvider — single source of truth for SSR vs CSR.
 * Server seeds initialCSR from UA (bot->false, mobile->true).
 * Client then upgrades to media-query + network + memory heuristic so
 * a desktop that resizes to narrow, or a mobile on save-data, flips to CSR.
 */
export function RenderModeProvider({
  initialCSR,
  children,
}: {
  initialCSR: boolean;
  children: React.ReactNode;
}) {
  const [isCSR, setIsCSR] = useState(initialCSR);

  useEffect(() => {
    const nav = navigator as unknown as {
      connection?: { saveData?: boolean; effectiveType?: string };
      deviceMemory?: number;
      hardwareConcurrency?: number;
    };
    const check = () => {
      const m = window.matchMedia("(max-width: 768px), (pointer: coarse)").matches;
      const saveData = nav.connection?.saveData;
      const et = nav.connection?.effectiveType;
      const slowNet = et === "slow-2g" || et === "2g" || !!saveData;
      const lowMem =
        (typeof nav.deviceMemory === "number" && nav.deviceMemory <= 4) ||
        (typeof nav.hardwareConcurrency === "number" && nav.hardwareConcurrency <= 4);
      // mobile OR poor network OR low-end device -> CSR (defer heavy visuals)
      setIsCSR(m || slowNet || lowMem);
    };
    check();
    const mq = window.matchMedia("(max-width: 768px)");
    const coarse = window.matchMedia("(pointer: coarse)");
    const onChange = () => check();
    // modern browsers
    mq.addEventListener?.("change", onChange);
    coarse.addEventListener?.("change", onChange);
    // fallback
    mq.addListener?.(onChange as never);
    coarse.addListener?.(onChange as never);
    // also watch saveData changes if connection API exists
    return () => {
      mq.removeEventListener?.("change", onChange);
      coarse.removeEventListener?.("change", onChange);
      mq.removeListener?.(onChange as never);
      coarse.removeListener?.(onChange as never);
    };
  }, []);

  return <Ctx.Provider value={isCSR}>{children}</Ctx.Provider>;
}

export const useIsCSR = () => useContext(Ctx);

/**
 * CSRDefer — ponytail: content SSR everywhere, heavy decor CSR on mobile.
 * SSR path (desktop/bot): children render immediately (no defer).
 * CSR path (mobile/poor): children mount after idle so paint of text
 * happens first and RAF/canvas don't block the main thread.
 */
export function CSRDefer({
  children,
  fallback = null,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const isCSR = useIsCSR();
  const [ready, setReady] = useState(!isCSR);

  useEffect(() => {
    if (!isCSR) {
      setReady(true);
      return;
    }
    let id: unknown;
    const cb = () => setReady(true);
    const ric = (window as unknown as { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number })
      .requestIdleCallback;
    if (ric) id = ric(cb, { timeout: 900 });
    else id = window.setTimeout(cb, 80);
    return () => {
      const cic = (window as unknown as { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback;
      if (cic && typeof id === "number") cic(id as number);
      else clearTimeout(id as number & NodeJS.Timeout);
    };
  }, [isCSR]);

  if (!isCSR) return <>{children}</>;
  return ready ? <>{children}</> : <>{fallback}</>;
}
