import Link from "next/link";
import RoadAnimation from "@/app/components/RoadAnimation";

export default function Home() {
  return (
    <section className="w-full">
      <div className="mx-auto max-w-6xl text-center py-10 sm:py-16">
        {/* Full-bleed animated lines above title */}
        <div className="full-bleed mb-6 pointer-events-none select-none" aria-hidden>
          <RoadAnimation />
        </div>

        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-[var(--foreground)]">
          traff-29
        </h1>
        <p className="mt-3 text-lg sm:text-xl text-[var(--text-secondary)]">
          turning chaos into motion
        </p>

        {/* Full-bleed animated lines below title */}
        <div className="full-bleed mt-6 pointer-events-none select-none" aria-hidden>
          <RoadAnimation />
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/simulate" className="px-5 py-2.5 rounded-md bg-[var(--primary)] text-white hover:opacity-90">
              Start simulation
            </Link>
        </div>

        <div className="mt-12 grid sm:grid-cols-3 gap-4 text-left">
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
    <div className="rounded-lg border border-black/10 dark:border-white/10 bg-[var(--card)] p-5">
      <h3 className="font-semibold text-[var(--foreground)]">{title}</h3>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">{body}</p>
    </div>
  );
}
