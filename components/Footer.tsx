"use client";

import Link from "next/link";
import { Radio, Cpu, ShieldCheck, MapPin, CheckCircle2 } from "lucide-react";

export function Footer() {
  const liveDispatches = [
    { location: "Indiranagar 5th Cross", action: "Water Leak Repaired", time: "12m ago", status: "Resolved" },
    { location: "MG Road Junction", action: "Deep Asphalt Resurfaced", time: "34m ago", status: "Resolved" },
    { location: "Church Street Bin #12", action: "Waste Clearance Dispatched", time: "52m ago", status: "In Progress" },
    { location: "Park Avenue Stop 4", action: "LED Luminaire Replaced", time: "1h ago", status: "Resolved" },
    { location: "Lakeview Outer Ring", action: "Fissure Sealed", time: "2h ago", status: "Resolved" },
  ];

  return (
    <footer className="relative border-t border-white/10 bg-[#06070B] text-slate-400 overflow-hidden">
      
      {/* Live Civic Dispatch Marquee */}
      <div className="border-b border-white/10 bg-white/[0.02] py-3 overflow-hidden">
        <div className="flex items-center gap-6 animate-marquee whitespace-nowrap">
          {[...liveDispatches, ...liveDispatches].map((d, i) => (
            <div key={i} className="inline-flex items-center gap-2.5 text-xs text-slate-300">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400"></span>
              <span className="font-semibold text-white flex items-center gap-1">
                <MapPin className="h-3 w-3 text-emerald-400" />
                {d.location}
              </span>
              <span className="text-slate-400">— {d.action}</span>
              <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-mono text-emerald-400 border border-emerald-500/20">
                {d.status}
              </span>
              <span className="text-[11px] text-slate-500">({d.time})</span>
              <span className="text-slate-700 ml-4">•</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Col 1: Brand */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <Radio className="h-4.5 w-4.5 text-emerald-400" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                CivicFix<span className="text-emerald-400 font-mono text-sm ml-0.5">.AI</span>
              </span>
            </div>
            
            <p className="text-sm text-slate-400 leading-relaxed max-w-md">
              Autonomous civic reporting & urban infrastructure triage platform. Transforming citizen photos into prioritized, verified municipal work-orders in sub-minute neural pipelines.
            </p>

            <div className="flex flex-wrap gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-2.5 py-1 text-xs text-slate-300 border border-white/10">
                <Cpu className="h-3 w-3 text-emerald-400" /> Neural Vision Triage
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-2.5 py-1 text-xs text-slate-300 border border-white/10">
                <ShieldCheck className="h-3 w-3 text-amber-400" /> Spatial Deduplication
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-2.5 py-1 text-xs text-slate-300 border border-white/10">
                <CheckCircle2 className="h-3 w-3 text-blue-400" /> 100% Open Data
              </span>
            </div>
          </div>

          {/* Col 2: Fast Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-200 mb-4 font-mono">
              Platform
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/" className="hover:text-emerald-400 transition">
                  Overview & Vision
                </Link>
              </li>
              <li>
                <Link href="/report" className="hover:text-emerald-400 transition flex items-center gap-1">
                  Report Hazard <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1 rounded">Live</span>
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-emerald-400 transition">
                  Public City Pulse Map
                </Link>
              </li>
              <li>
                <Link href="/resolve" className="hover:text-emerald-400 transition">
                  City Command Center
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Community & Protocol */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-200 mb-4 font-mono">
              Civic Protocol
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center justify-between text-slate-400">
                <span>AI Confidence:</span>
                <span className="text-emerald-400 font-mono text-xs">99.4%</span>
              </li>
              <li className="flex items-center justify-between text-slate-400">
                <span>Avg Triage Time:</span>
                <span className="text-emerald-400 font-mono text-xs">0.82s</span>
              </li>
              <li className="flex items-center justify-between text-slate-400">
                <span>Deduplication:</span>
                <span className="text-amber-400 font-mono text-xs">48h Geo-Cluster</span>
              </li>
              <li className="flex items-center justify-between text-slate-400">
                <span>Public Nodes:</span>
                <span className="text-slate-300 font-mono text-xs">Bangalore Central</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} CivicFix AI Platform. Built for cleaner, safer cities.</span>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1 text-slate-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              All Municipal Services Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
