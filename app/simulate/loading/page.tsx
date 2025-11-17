"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import RoadAnimation from "@/app/components/RoadAnimation";
import Logo from "@/app/components/Logo";

type Stage = "spread" | "collapse" | "logo";

const COLLAPSE_DELAY = 450; // ms until the chaos begins collapsing
const LOGO_REVEAL_DELAY = 1700; // ms until the central logo becomes visible
const NAVIGATE_DELAY = 3000; // ms until we swap to the live simulator

export default function SimulationLoadingPage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("spread");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduceMotion.matches) {
      router.replace("/simulate");
      return;
    }

    // Sequence the animation: collapse lines, reveal logo, then enter the simulator
    const timers: number[] = [];
    timers.push(window.setTimeout(() => setStage("collapse"), COLLAPSE_DELAY));
    timers.push(window.setTimeout(() => setStage("logo"), LOGO_REVEAL_DELAY));
    timers.push(window.setTimeout(() => router.replace("/simulate"), NAVIGATE_DELAY));

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [router]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
      <span className="sr-only" role="status" aria-live="polite">
        Preparing the simulation experience
      </span>

      <div className="relative flex items-center justify-center">
        <div
          className="transition-[opacity,transform,filter] duration-[1200ms] ease-out"
          style={{
            transform:
              stage === "spread" ? "scale(1)" : stage === "collapse" ? "scale(0.22)" : "scale(0.12)",
            opacity: stage === "spread" ? 1 : stage === "collapse" ? 0.55 : 0,
            filter: stage === "spread" ? "blur(0px)" : stage === "collapse" ? "blur(0.6px)" : "blur(3px)",
          }}
        >
          <RoadAnimation variant="chaos" />
        </div>

        <div
          className={`absolute transition-opacity duration-700 ease-out ${stage === "logo" ? "opacity-100" : "opacity-0"}`}
          aria-hidden={stage !== "logo"}
        >
          <div className="loading-logo-pulse flex h-28 w-28 items-center justify-center rounded-full border border-black/10 bg-[var(--card)] shadow-[0_22px_44px_-24px_rgba(15,15,30,0.55)] dark:border-white/15">
            <Logo size={64} className="h-16 w-16" />
          </div>
        </div>
      </div>

      <p
        className={`mt-16 text-sm uppercase tracking-[0.4em] text-[var(--text-secondary)] transition-opacity duration-500 ${stage === "logo" ? "opacity-100" : "opacity-0"}`}
      >
        Preparing simulation
      </p>
    </div>
  );
}
