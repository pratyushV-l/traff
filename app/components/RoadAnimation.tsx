"use client";

// Decorative SVG road-like animation using the four accent colors from globals.css
// Colors used: --primary, --secondary, --success, --warning
// Respects reduced motion.

export default function RoadAnimation() {
  return (
    <div className="w-full" aria-hidden>
      <svg
        className="block w-full h-[160px] sm:h-[200px]"
        viewBox="0 0 1200 200"
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

          {/* Dash pattern for motion; adjusted by CSS animation via stroke-dashoffset */}
          <path id="lane1" d="M-20,150 C200,120 420,180 640,150 C860,120 1080,180 1220,150" />
          <path id="lane2" d="M-20,120 C200,90 420,150 640,120 C860,90 1080,150 1220,120" />
          <path id="lane3" d="M-20,90 C200,60 420,120 640,90 C860,60 1080,120 1220,90" />
          <path id="lane4" d="M-20,60 C200,30 420,90 640,60 C860,30 1080,90 1220,60" />
        </defs>

        {/* Flowing colored lanes */}
        <g filter="url(#glow)">
          <use href="#lane1" className="flow-line" stroke="var(--primary)" strokeWidth="6" fill="none" />
          <use href="#lane2" className="flow-line flow-slower" stroke="var(--secondary)" strokeWidth="6" fill="none" />
          <use href="#lane3" className="flow-line flow-fast" stroke="var(--success)" strokeWidth="6" fill="none" />
          <use href="#lane4" className="flow-line" stroke="var(--warning)" strokeWidth="6" fill="none" />
        </g>
      </svg>
    </div>
  );
}
