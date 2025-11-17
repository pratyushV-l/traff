"use client";

// Decorative SVG road-like animation using the four accent colors from globals.css
// Colors used: --primary, --secondary, --success, --warning
// Variants: "smooth" (uniform) and "chaos" (mixed speeds/dashes + slight jitter)

type Props = {
  variant?: "smooth" | "chaos";
  className?: string;
};

export default function RoadAnimation({ variant = "smooth", className }: Props) {
  const isChaos = variant === "chaos";
  const wrapperClass = className ? `w-full ${className}` : "w-full";
  return (
    <div className={wrapperClass} aria-hidden>
      <svg
        className={`block w-full ${isChaos ? "h-[200px] sm:h-[220px]" : "h-[160px] sm:h-[200px]"}`}
        viewBox="0 0 1200 220"
        role="img"
        aria-label=""
        preserveAspectRatio="none"
      >
        <defs>
          {/* Subtle glow */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Base lanes for smooth variant */}
          <path id="lane1" d="M-20,160 C200,130 420,190 640,160 C860,130 1080,190 1220,160" />
          <path id="lane2" d="M-20,130 C200,100 420,160 640,130 C860,100 1080,160 1220,130" />
          <path id="lane3" d="M-20,100 C200,70 420,130 640,100 C860,70 1080,130 1220,100" />
          <path id="lane4" d="M-20,70 C200,40 420,100 640,70 C860,40 1080,100 1220,70" />

          {/* More meandering lanes for chaos (still four lines) */}
          <path id="lane1c" d="M-20,165 C100,140 200,190 320,165 C440,140 560,190 680,165 C800,140 980,200 1220,165" />
          <path id="lane2c" d="M-20,135 C120,115 260,155 420,135 C580,115 780,170 980,140 C1120,120 1220,150 1220,135" />
          <path id="lane3c" d="M-20,105 C140,85 340,125 540,105 C700,90 860,120 1020,110 C1120,105 1180,120 1220,115" />
          <path id="lane4c" d="M-20,75 C160,55 300,95 460,75 C640,60 760,90 900,80 C1040,70 1160,95 1220,85" />
        </defs>

        <g filter="url(#glow)">
          {isChaos ? (
            <>
              <use href="#lane1c" className="flow-line flow-very-slow dash-tight jitter-slow" stroke="var(--primary)" strokeWidth="6" fill="none" />
              <use href="#lane2c" className="flow-line flow-very-slow dash-loose jitter" stroke="var(--secondary)" strokeWidth="6" fill="none" />
              <use href="#lane3c" className="flow-line flow-very-slow jitter" stroke="var(--success)" strokeWidth="6" fill="none" />
              <use href="#lane4c" className="flow-line flow-very-slow dash-tight jitter-slow" stroke="var(--warning)" strokeWidth="6" fill="none" />
            </>
          ) : (
            <>
              <use href="#lane1" className="flow-line" stroke="var(--primary)" strokeWidth="6" fill="none" />
              <use href="#lane2" className="flow-line flow-slower" stroke="var(--secondary)" strokeWidth="6" fill="none" />
              <use href="#lane3" className="flow-line flow-fast" stroke="var(--success)" strokeWidth="6" fill="none" />
              <use href="#lane4" className="flow-line" stroke="var(--warning)" strokeWidth="6" fill="none" />
            </>
          )}
        </g>
      </svg>
    </div>
  );
}
