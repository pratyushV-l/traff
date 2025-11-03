"use client";

import Link from "next/link";
import { useState } from "react";
import ThemeToggle from "@/app/components/ThemeToggle";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="w-full border-b border-black/10 dark:border-white/10 bg-[var(--background)]/80 backdrop-blur supports-[backdrop-filter]:bg-[var(--background)]/70">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-lg font-semibold tracking-tight text-[var(--foreground)] hover:opacity-90">
            traff-29
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-6">
          <NavLinks />
          <ThemeToggle />
        </div>

        {/* Mobile controls */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            aria-label="Toggle navigation menu"
            aria-expanded={open}
            onClick={() => setOpen(v => !v)}
            className="inline-flex items-center justify-center rounded-md p-2 hover:bg-black/5 dark:hover:bg-white/10"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {open ? (
                <path d="M18 6 6 18M6 6l12 12" />
              ) : (
                <path d="M3 12h18M3 6h18M3 18h18" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-black/10 dark:border-white/10">
          <div className="mx-auto max-w-6xl px-4 py-3 flex flex-col gap-3">
            <Link className="text-[var(--foreground)] hover:text-[var(--primary)]" href="/">Home</Link>
            <Link className="text-[var(--foreground)] hover:text-[var(--primary)]" href="/about">About</Link>
            <Link className="text-[var(--foreground)] hover:text-[var(--primary)]" href="/data-limits">Data & Limits</Link>
            <Link className="text-[var(--foreground)] hover:text-[var(--primary)]" href="/contact">Contact</Link>
          </div>
        </div>
      )}
    </nav>
  );
}

function NavLinks() {
  return (
    <div className="flex items-center gap-6 text-sm">
      <Link className="text-[var(--foreground)] hover:text-[var(--primary)]" href="/">Home</Link>
      <Link className="text-[var(--foreground)] hover:text-[var(--primary)]" href="/about">About</Link>
      <Link className="text-[var(--foreground)] hover:text-[var(--primary)]" href="/data-limits">Data & Limits</Link>
      <Link className="text-[var(--foreground)] hover:text-[var(--primary)]" href="/contact">Contact</Link>
    </div>
  );
}
