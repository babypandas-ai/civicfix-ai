"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-body",
});

function SuccessContent() {
  const searchParams = useSearchParams();

  // Only real values passed from the actual Submit-issue response.
  // Nothing here is invented — if a field wasn't returned by the
  // backend, it simply won't render below.
  const category = searchParams.get("category");
  const severity = searchParams.get("severity");
  const location = searchParams.get("location");

  const hasAnyDetails = category || severity || location;

  return (
    <main
      className={inter.variable + " min-h-screen bg-white text-[#0F172A]"}
      style={{ fontFamily: "var(--font-body)" }}
    >
      <header className="border-b border-[#EEF1F5]">
        <div className="mx-auto max-w-3xl px-6 py-5 flex items-center justify-between">
          <Link href="/" className="text-lg font-extrabold tracking-tight">
            Civic<span className="text-[#22C55E]">Fix</span>
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-md px-6 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#ECFDF5] flex items-center justify-center text-3xl mx-auto mb-6">
          ✅
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight mb-3">
          Thank You!
        </h1>
        <p className="text-[#64748B] leading-relaxed mb-10">
          Your civic issue has been successfully reported and will be
          processed by our system.
        </p>

        {hasAnyDetails && (
          <div className="text-left rounded-2xl border border-[#EEF1F5] bg-[#F8FAFC] p-6 mb-10 space-y-4">
            {category && <DetailRow label="Category" value={category} />}
            {severity && <DetailRow label="Severity" value={severity} />}
            {location && <DetailRow label="Location" value={location} />}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Link
            href="/report"
            className="w-full inline-flex items-center justify-center gap-2 bg-[#22C55E] hover:bg-[#16A34A] text-white font-semibold px-7 py-3.5 rounded-xl transition shadow-sm"
          >
            Report Another Issue
          </Link>
         
        </div>
      </div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <SuccessContent />
    </Suspense>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3 last:border-b-0 last:pb-0">
      <span className="text-xs font-medium text-[#94A3B8] uppercase tracking-wide">
        {label}
      </span>
      <span className="text-sm font-semibold text-[#0F172A] text-right">
        {value}
      </span>
    </div>
  );
}