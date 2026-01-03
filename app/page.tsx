"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import RoadAnimation from "@/app/components/RoadAnimation";
import Logo from "@/app/components/Logo";
import Beams from "@/app/components/Beams";

const NAVIGATE_DELAY = 1700;

export default function Home() {
  const router = useRouter();
  const [isFading, setIsFading] = useState(false);
  const timeouts = useRef<number[]>([]);

  useEffect(() => {
    router.prefetch?.("/simulate");
  }, [router]);

  useEffect(() => {
    return () => {
      timeouts.current.forEach((id) => window.clearTimeout(id));
      timeouts.current = [];
    };
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const className = "loading-nav-hidden";
    const root = document.documentElement;
    const body = document.body;
    if (isFading) {
      root.classList.add(className);
      body.classList.add(className);
    } else {
      root.classList.remove(className);
      body.classList.remove(className);
    }
    return () => {
      root.classList.remove(className);
      body.classList.remove(className);
    };
  }, [isFading]);

  const schedule = (callback: () => void, delay: number) => {
    const id = window.setTimeout(() => {
      timeouts.current = timeouts.current.filter((stored) => stored !== id);
      callback();
    }, delay);
    timeouts.current.push(id);
  };

  const handleStart = () => {
    if (isFading) return;

    if (typeof window !== "undefined") {
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
      if (prefersReducedMotion.matches) {
        router.push("/simulate");
        return;
      }
    }

    setIsFading(true);
    schedule(() => router.push("/simulate"), NAVIGATE_DELAY);
  };

  return (
    <section className="w-full flex-1 flex flex-col overflow-hidden">
      {/* <div className="absolute inset-0 z-0 pointer-events-none">
        <Beams
          beamWidth={2}
          beamHeight={120}
          beamNumber={12}
          lightColor="#ffffff"
          speed={1}
          noiseIntensity={2.35}
          scale={0.2}
          rotation={45}
        />
      </div> */}
      <div className="relative flex-1 flex items-center justify-center px-4 sm:px-6 z-10">
        <div className={`fade-pane ${isFading ? "fade-pane--out" : ""}`}>
          <div className="mx-auto max-w-6xl w-full text-center py-10 sm:py-16">
            <div className="full-bleed mb-6 pointer-events-none select-none" aria-hidden>
              <RoadAnimation variant="chaos" />
            </div>

            <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-[var(--foreground)]">
              traff-29
            </h1>
            <p className="mt-3 text-lg sm:text-xl text-[var(--text-secondary)]">
              turning chaos into motion
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleStart}
                disabled={isFading}
                className="px-5 py-2.5 rounded-md bg-[var(--primary)] text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-80"
              >
                Start simulation
              </button>
            </div>

            <div className="full-bleed mt-6 pointer-events-none select-none" aria-hidden>
              <RoadAnimation variant="smooth" />
            </div>
          </div>
        </div>

        <div className={`fade-pane fade-pane--logo ${isFading ? "fade-pane--in" : ""}`} aria-hidden={!isFading}>
          <span className="sr-only" role="status" aria-live="polite">
            Transitioning to simulation
          </span>
          <div className="logo-orbit" aria-hidden>
            <span className="logo-orbit__halo" />
            <span className="logo-orbit__track" />
            <span className="logo-orbit__track logo-orbit__track--inner" />
            <div className="logo-orbit__core">
              <Logo size={56} className="h-14 w-14" />
            </div>
          </div>
        </div>
      </div>

      <div className={`mx-auto w-full max-w-6xl px-4 sm:px-6 pt-12 sm:pt-16 pb-12 sm:pb-16 fade-pane ${isFading ? "fade-pane--out" : ""}`}>
        <div className="grid sm:grid-cols-3 gap-4 text-left">
          <FeatureCard title="Model" body="Adjust time, density, and mode to see flows and SEEP outcomes (commute time, emissions, stress proxies)." />
          <FeatureCard title="Explain" body="AI-written summaries translate patterns into clear stories for broader audiences." />
          <FeatureCard title="Reflect" body="Prompts nudge you to consider small shifts—like leaving 10 minutes earlier—that add up city-wide." />
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-[var(--card)] p-5">
      <h3 className="font-semibold text-[var(--foreground)]">{title}</h3>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">{body}</p>
    </div>
  );
}
