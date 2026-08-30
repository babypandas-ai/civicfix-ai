"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-body",
});

const LiveIssuesMap = dynamic(() => import("../components/LiveIssuesMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[420px] w-full rounded-2xl border border-[#EEF1F5] bg-white flex items-center justify-center text-sm text-[#94A3B8]">
      Loading live map...
    </div>
  ),
});

export default function HomePage() {
  return (
    <main
      className={inter.variable + " min-h-screen bg-[#FAFBFC] text-[#0F172A]"}
      style={{ fontFamily: "var(--font-body)" }}
    >
      <header className="border-b border-[#EEF1F5]">
        <div className="mx-auto max-w-6xl px-6 py-8 flex items-center justify-between">
          <span className="text-2xl font-extrabold tracking-tight">
            Civic<span className="text-[#22C55E]">Fix</span>
          </span>
          <nav className="flex items-center gap-3">
            <Link
              href="/authorities"
              className="text-sm font-semibold text-[#475569] hover:text-[#0F172A] transition px-4 py-2.5 rounded-xl border border-[#E2E8F0] hover:border-[#CBD5E1]"
            >
              Authorities Only
            </Link>
          </nav>
        </div>
      </header>

      <section className="px-6 pt-20 pb-24 text-center">
        <div className="mx-auto max-w-2xl">
          <span className="inline-block text-xs font-semibold tracking-wide text-[#16A34A] bg-[#ECFDF5] border border-[#BBF7D0] rounded-full px-3 py-1 mb-6">
            AI-powered civic reporting
          </span>

          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.1] mb-5">
            Make your city better,
            <br />
            <span className="text-[#22C55E]">one report at a time.</span>
          </h1>

          <p className="text-[#64748B] text-lg leading-relaxed mb-10 max-w-lg mx-auto">
            Snap a photo, tag the location, and let our AI route it to the
            right department — no forms, no follow-up calls.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/report"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#22C55E] hover:bg-[#16A34A] text-white font-semibold px-7 py-3.5 rounded-xl transition shadow-sm"
            >
              Report an Issue
            </Link>
            <Link
              href="/authorities"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-[#F8FAFC] text-[#0F172A] font-semibold px-7 py-3.5 rounded-xl border border-[#E2E8F0] transition"
            >
              View Issues
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 py-20 bg-white">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold mb-2">
              What's happening <span className="text-[#22C55E]">near you</span>
            </h2>
            <p className="text-[#64748B]">
              Live view of active civic issues reported by citizens.
            </p>
          </div>

          <LiveIssuesMap />
        </div>
      </section>

      <section className="px-6 py-20 bg-white">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-extrabold text-center mb-14">
            Why <span className="text-[#22C55E]">CivicFix</span>?
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <FeatureCard
              emoji="🧠"
              title="AI-Powered Detection"
              description="Automatically classifies issue type and severity from your photo."
            />
            <FeatureCard
              emoji="🛡️"
              title="Duplicate Prevention"
              description="Merges nearby reports instead of creating repeat noise."
            />
            <FeatureCard
              emoji="📍"
              title="Location Auto-Tagging"
              description="Your GPS position is captured automatically, no typing needed."
            />
            <FeatureCard
              emoji="⏱️"
              title="Real-time Tracking"
              description="Follow your report's status from submission to resolution."
            />
          </div>
        </div>
      </section>

      <section className="px-6 py-20 bg-[#F8FAFC]">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-extrabold text-center mb-16">
            How <span className="text-[#22C55E]">CivicFix</span> Works
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 relative">
            <StepItem
              emoji="📷"
              step="1. Snap"
              description="Capture a photo of the issue"
              showConnector
            />
            <StepItem
              emoji="🤖"
              step="2. AI Analysis"
              description="Our AI detects the issue type and severity"
              showConnector
            />
            <StepItem
              emoji="📍"
              step="3. Smart Check"
              description="We check for nearby similar reports"
              showConnector
            />
            <StepItem
              emoji="✅"
              step="4. Action"
              description="Your report is sent to the right department"
            />
          </div>
        </div>
      </section>

      <section className="px-6 py-20 text-center">
        <div className="mx-auto max-w-lg">
          <h2 className="text-2xl font-extrabold mb-3">
            Ready to report an issue?
          </h2>
          <p className="text-[#64748B] mb-8">
            It takes less than a minute. Your city will thank you.
          </p>
          <Link
            href="/report"
            className="inline-flex items-center justify-center gap-2 bg-[#22C55E] hover:bg-[#16A34A] text-white font-semibold px-8 py-3.5 rounded-xl transition shadow-sm"
          >
            Report an Issue
          </Link>
        </div>
      </section>

      <footer className="border-t border-[#EEF1F5] py-8 text-center text-sm text-[#94A3B8]">
        CivicFix — built for cities that listen.
      </footer>
    </main>
  );
}

function FeatureCard({
  emoji,
  title,
  description,
}: {
  emoji: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-[#EEF1F5] bg-white p-6 hover:shadow-md transition">
      <div className="w-12 h-12 rounded-xl bg-[#ECFDF5] flex items-center justify-center text-2xl mb-5">
        {emoji}
      </div>
      <h3 className="font-bold text-[#0F172A] mb-1.5">{title}</h3>
      <p className="text-sm text-[#64748B] leading-relaxed">{description}</p>
    </div>
  );
}

function StepItem({
  emoji,
  step,
  description,
  showConnector,
}: {
  emoji: string;
  step: string;
  description: string;
  showConnector?: boolean;
}) {
  return (
    <div className="relative flex flex-col items-center text-center">
      <div className="relative w-16 h-16 rounded-2xl bg-[#ECFDF5] flex items-center justify-center text-2xl mb-4 z-10">
        {emoji}
      </div>

      {showConnector && (
        <div
          className="hidden md:block absolute top-8 left-[calc(50%+32px)] w-[calc(100%-16px)] border-t-2 border-dashed border-[#BBF7D0]"
          aria-hidden
        />
      )}

      <h3 className="font-bold text-[#0F172A] text-sm mb-1.5">{step}</h3>
      <p className="text-xs text-[#64748B] leading-relaxed max-w-[150px]">
        {description}
      </p>
    </div>
  );
}