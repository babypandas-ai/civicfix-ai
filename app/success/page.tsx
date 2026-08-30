"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  CheckCircle2, 
  MapPin, 
  Share2, 
  Copy, 
  ExternalLink, 
  ShieldCheck, 
  Sparkles, 
  Clock, 
  Radio, 
  ArrowRight,
  QrCode,
  Layers,
  Camera
} from "lucide-react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const ticketIdParam = searchParams.get("id") || "CF-1042";

  const [ticketData, setTicketData] = useState<{
    id: string;
    category: string;
    location: string;
    district: string;
    description: string;
    imageUrl: string;
    submittedAt: string;
    status: string;
  }>({
    id: ticketIdParam,
    category: "Road Hazard / Pothole",
    location: "12.971598, 77.594562",
    district: "MG Road Sector, Ward 12",
    description: "Deep cavity endangering two-wheeler commuters.",
    imageUrl: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80",
    submittedAt: new Date().toISOString(),
    status: "triaged",
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem("latest_ticket");
      if (stored) {
        const parsed = JSON.parse(stored);
        setTicketData((prev) => ({ ...prev, ...parsed }));
      }
    } catch (e) {
      console.warn("Could not read stored ticket:", e);
    }
  }, []);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="relative mx-auto max-w-3xl">
      
      {/* Celebration Header */}
      <div className="text-center mb-10 space-y-4">
        <div className="relative inline-flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-emerald-500/30 blur-2xl animate-pulse" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-600 text-slate-950 shadow-[0_0_40px_rgba(16,185,129,0.5)]">
            <CheckCircle2 className="h-10 w-10" />
          </div>
        </div>

        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3.5 py-1 text-xs font-mono text-emerald-400 border border-emerald-500/20 mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            INCIDENT OFFICIALLY TRANSMITTED
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Report Logged & Prioritized
          </h1>
          <p className="text-sm text-slate-400 max-w-md mx-auto mt-2">
            Thank you for making our city safer. Your report has been classified by AI and assigned to the municipal dispatch queue.
          </p>
        </div>
      </div>

      {/* Holographic Civic Ticket Card */}
      <div className="relative rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-[#0F1424] to-[#070912] p-6 sm:p-8 shadow-2xl backdrop-blur-2xl overflow-hidden mb-8">
        
        {/* Ambient glow */}
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />

        {/* Ticket Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6 mb-6">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">CIVIC TICKET PASSPORT</span>
            <div className="text-2xl font-bold font-mono text-emerald-400 mt-0.5">
              #{ticketData.id}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 rounded-xl bg-white/5 hover:bg-white/10 px-3 py-2 text-xs font-mono text-slate-300 border border-white/10 transition"
            >
              <Copy className="h-3.5 w-3.5" />
              <span>Copy Link</span>
            </button>
            <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-mono font-bold text-emerald-300 border border-emerald-500/30">
              ● PRIORITY QUEUED
            </span>
          </div>
        </div>

        {/* Ticket Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 text-xs">
          <div>
            <span className="text-slate-400 block font-mono text-[11px] mb-1">CLASSIFIED DEFECT</span>
            <span className="text-base font-bold text-white">{ticketData.category}</span>
          </div>

          <div>
            <span className="text-slate-400 block font-mono text-[11px] mb-1">GEO COORDINATES</span>
            <span className="text-sm font-mono text-emerald-300 flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> {ticketData.location}
            </span>
            <span className="text-[11px] text-slate-400">{ticketData.district}</span>
          </div>

          <div className="sm:col-span-2 bg-black/40 p-4 rounded-2xl border border-white/5">
            <span className="text-slate-400 block font-mono text-[11px] mb-1">REPORT OBSERVATION</span>
            <p className="text-slate-200 leading-relaxed font-sans">{ticketData.description}</p>
          </div>
        </div>

        {/* 4-Step Resolution Milestone Pipeline */}
        <div className="border-t border-white/10 pt-6">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block mb-4">
            Live Resolution Pipeline
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {[
              { step: "01", title: "AI Classified", status: "Done", active: true },
              { step: "02", title: "Geo-Deduped", status: "Done", active: true },
              { step: "03", title: "Ward Dispatch", status: "In Queue", active: true },
              { step: "04", title: "Crew Fix", status: "Pending", active: false },
            ].map((milestone, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border transition-all ${
                  milestone.active
                    ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300"
                    : "bg-white/[0.02] border-white/10 text-slate-500"
                }`}
              >
                <div className="flex items-center justify-between mb-1 text-[10px] font-mono">
                  <span className={milestone.active ? "text-emerald-400 font-bold" : "text-slate-600"}>
                    STEP {milestone.step}
                  </span>
                  {milestone.status === "Done" && (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  )}
                </div>
                <div className="font-bold text-xs">{milestone.title}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{milestone.status}</div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Action Triggers */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/dashboard"
          className="flex items-center justify-center gap-2 rounded-2xl bg-white/[0.05] hover:bg-white/[0.09] p-4 text-xs font-bold text-slate-200 border border-white/15 backdrop-blur-xl transition"
        >
          <Layers className="h-4 w-4 text-emerald-400" />
          <span>View on City Map</span>
        </Link>

        <Link
          href="/resolve"
          className="flex items-center justify-center gap-2 rounded-2xl bg-white/[0.05] hover:bg-white/[0.09] p-4 text-xs font-bold text-slate-200 border border-white/15 backdrop-blur-xl transition"
        >
          <ShieldCheck className="h-4 w-4 text-amber-400" />
          <span>Inspect in Ops Hub</span>
        </Link>

        <Link
          href="/report"
          className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 p-4 text-xs font-bold text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition"
        >
          <Camera className="h-4 w-4" />
          <span>Report Another Issue</span>
        </Link>
      </div>

    </div>
  );
}

export default function SuccessPage() {
  return (
    <main className="relative min-h-screen bg-[#08090E] text-slate-100 py-16 px-4 sm:px-6 lg:px-8 selection:bg-emerald-500/30">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-radial-glow pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />

      <Suspense fallback={<div className="text-center py-20 text-slate-400 font-mono">Loading ticket receipt...</div>}>
        <SuccessContent />
      </Suspense>
    </main>
  );
}