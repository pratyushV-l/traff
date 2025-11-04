"use client";

import { useMemo, useRef, useState } from "react";

type Seep = {
  commuteMinutes: number; // Estimated average commute duration
  emissionsKgCO2: number; // Rough emissions estimate
  stressIndex: number; // 0–100 proxy
};

export default function SimulatePage() {
  const [time, setTime] = useState(9); // 0–23
  const [density, setDensity] = useState(60); // 0–100
  const [mode, setMode] = useState<"car" | "bus" | "bike">("car");
  const canvasRef = useRef<HTMLDivElement>(null);

  const seep: Seep = useMemo(() => {
    // Very rough placeholder logic; replace with API/AI integration.
    const rushHour = time >= 8 && time <= 10 || time >= 17 && time <= 19;
    const base = rushHour ? 1.3 : 1.0;
    const densityFactor = 0.7 + density / 100;
    const modeFactor = mode === "car" ? 1.0 : mode === "bus" ? 0.9 : 0.8;
    return {
      commuteMinutes: Math.round(35 * base * densityFactor * modeFactor),
      emissionsKgCO2: Number((0.18 * base * densityFactor * (mode === "car" ? 1 : mode === "bus" ? 0.5 : 0.1)).toFixed(2)),
      stressIndex: Math.min(100, Math.round(densityFactor * (rushHour ? 80 : 55))),
    };
  }, [time, density, mode]);

  const story = useMemo(() => {
    // Placeholder NLG; to be replaced by an AI service
    const when = `${time.toString().padStart(2, "0")}:00`;
    const crowd = density < 30 ? "light" : density < 70 ? "moderate" : "heavy";
    return `At ${when}, ${crowd} flow leads to an average commute of ~${seep.commuteMinutes} minutes. ` +
      `Estimated emissions are ${seep.emissionsKgCO2} kg CO₂ per trip; stress proxies rise to ${seep.stressIndex}/100. ` +
      `Small shifts—like leaving 10 minutes earlier or taking the bus—can materially flatten peaks.`;
  }, [time, density, seep]);

  return (
    <section className="mx-auto max-w-6xl">
      <h1 className="text-3xl font-bold text-[var(--foreground)]">Interactive Simulation</h1>
      <p className="mt-2 text-[var(--text-secondary)]">Adjust variables to see SEEP impacts. Map is a placeholder until a key is configured.</p>

      <div className="mt-6 grid lg:grid-cols-[1.2fr_1fr] gap-5">
        {/* Left: Map/Canvas */}
        <div ref={canvasRef} id="simulation-canvas" className="rounded-lg border border-black/10 dark:border-white/10 bg-[var(--card)] p-4 min-h-[320px]">
          <div className="h-[260px] flex items-center justify-center text-sm text-[var(--text-secondary)] border border-dashed border-black/10 dark:border-white/10 rounded">Map / flow visualisation will render here</div>
          <p className="mt-3 text-xs text-[var(--text-secondary)]">Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to enable live maps.</p>
        </div>

        {/* Right: Controls + SEEP */}
        <div className="rounded-lg border border-black/10 dark:border-white/10 bg-[var(--card)] p-4">
          <h2 className="font-semibold">Controls</h2>
          <div className="mt-3 grid gap-4">
            <label className="grid gap-2">
              <span className="text-sm">Time of day: {time}:00</span>
              <input type="range" min={0} max={23} value={time} onChange={(e) => setTime(Number(e.target.value))} />
            </label>
            <label className="grid gap-2">
              <span className="text-sm">Traffic density: {density}%</span>
              <input type="range" min={0} max={100} value={density} onChange={(e) => setDensity(Number(e.target.value))} />
            </label>
            <div className="flex gap-2">
              {(["car", "bus", "bike"] as const).map(m => (
                <button key={m} onClick={() => setMode(m)} className={`px-3 py-1.5 rounded border text-sm ${mode === m ? "bg-[var(--primary)] text-white border-transparent" : "border-black/10 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/10"}`}>{m}</button>
              ))}
            </div>
          </div>

          <h2 className="mt-5 font-semibold">SEEP metrics</h2>
          <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
            <Metric label="Commute" value={`${seep.commuteMinutes} min`} />
            <Metric label="Emissions" value={`${seep.emissionsKgCO2} kg CO₂`} />
            <Metric label="Stress" value={`${seep.stressIndex}/100`} />
          </div>

          <h2 className="mt-5 font-semibold">Explanation</h2>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">{story}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            <ReflectionButton />
            <SnapshotButton targetId="simulation-canvas" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-black/10 dark:border-white/10 p-3 bg-white/50 dark:bg-white/5">
      <div className="text-[var(--text-secondary)] text-xs">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}

function ReflectionButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className="px-3 py-1.5 rounded-md border border-black/10 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/10 text-sm">
        Reflect
      </button>
      {open && (
        <div role="dialog" aria-modal className="fixed inset-0 z-50 grid place-items-center p-4 bg-black/40">
          <div className="max-w-md w-full rounded-lg border border-black/10 dark:border-white/10 bg-[var(--card)] p-5">
            <h3 className="font-semibold">Reflection</h3>
            <ul className="mt-2 list-disc pl-5 text-sm text-[var(--text-secondary)]">
              <li>What if everyone left 10 minutes earlier or later?</li>
              <li>What if public transport usage increased by 20%?</li>
              <li>Which small change could you commit to this week?</li>
            </ul>
            <div className="mt-4 flex justify-end">
              <button onClick={() => setOpen(false)} className="px-3 py-1.5 rounded-md bg-[var(--primary)] text-white text-sm">Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function SnapshotButton({ targetId }: { targetId: string }) {
  const [saving, setSaving] = useState(false);

  const onSnap = async () => {
    const node = document.getElementById(targetId);
    if (!node) return;
    setSaving(true);
    try {
      // Lazy-load to avoid impacting initial bundle
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(node, { backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--background') || '#ffffff' });
      const link = document.createElement("a");
      link.download = `traff29-snapshot-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error(e);
      alert("Could not capture snapshot on this device.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <button onClick={onSnap} disabled={saving} className="px-3 py-1.5 rounded-md border border-black/10 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/10 text-sm disabled:opacity-60">
      {saving ? "Saving…" : "Share snapshot"}
    </button>
  );
}
