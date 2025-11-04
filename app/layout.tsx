import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/app/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "traff-29 — turning chaos into motion",
    template: "%s | traff-29",
  },
  description:
    "AI-powered traffic awareness project from Bengaluru — modelling, visualising, and communicating the patterns behind congestion.",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    title: "traff-29 — turning chaos into motion",
    description:
      "An interactive AI-powered platform to model and visualise urban traffic patterns and their social impact.",
    siteName: "traff-29",
  },
  twitter: {
    card: "summary_large_image",
    title: "traff-29 — turning chaos into motion",
    description:
      "An interactive AI-powered platform to model and visualise urban traffic patterns and their social impact.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.className} ${geistSans.variable} ${geistMono.variable} antialiased`}>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-[var(--card)] focus:text-[var(--foreground)] focus:px-3 focus:py-2 focus:rounded-md">
          Skip to content
        </a>
        <div className="min-h-screen flex flex-col">
          <header className="w-full">
            <Navbar />
          </header>
          <main id="main-content" className="flex-1 px-4 sm:px-6 py-8">
            {children}
          </main>
          <footer className="w-full py-6 text-center text-sm text-[var(--text-secondary)]">
            © {new Date().getFullYear()} traff-29 — built for awareness, not navigation
          </footer>
        </div>
      </body>
    </html>
  );
}
