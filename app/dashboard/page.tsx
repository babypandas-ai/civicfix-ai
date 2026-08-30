"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  LayoutDashboard, 
  MapPin, 
  Activity, 
  CheckCircle2, 
  TrendingUp, 
  Layers, 
  ShieldCheck, 
  Flame, 
  Clock, 
  Camera, 
  Sparkles,
  BarChart3,
  ExternalLink
} from "lucide-react";
import { CityMap, MapIssue } from "../../components/CityMap";

const SAMPLE_PUBLIC_ISSUES: MapIssue[] = [
  {
    id: "CF-1042",
    category: "Pothole",
    description: "Large 18cm asphalt cavity blocking half the lane near the market junction.",
    severity: "high",
    confirmations: 14,
    status: "pending",
    location: "MG Road, near City Market",
    reportedAt: "2026-08-27",
    x: 42,
    y: 38,
  },
  {
    id: "CF-1039",
    category: "Water Leak",
    description: "Continuous high pressure leak from broken main pipe joint.",
    severity: "high",
    confirmations: 6,
    status: "in_progress",
    location: "5th Cross, Indiranagar",
    reportedAt: "2026-08-26",
    x: 75,
    y: 45,
  },
  {
    id: "CF-1051",
    category: "Streetlight",
    description: "Sodium luminaire array flickering and now dark.",
    severity: "medium",
    confirmations: 9,
    status: "pending",
    location: "Park Avenue Corridor",
    reportedAt: "2026-08-28",
    x: 58,
    y: 75,
  },
  {
    id: "CF-1033",
    category: "Garbage",
    description: "Commercial bin overflowing with municipal waste spill.",
    severity: "medium",
    confirmations: 11,
    status: "pending",
    location: "Church Street commercial junction",
    reportedAt: "2026-08-25",
    x: 32,
    y: 62,
  },
  {
    id: "CF-1020",
    category: "Water Leak",
    description: "Minor valve dripping at municipal water point (Resolved).",
    severity: "low",
    confirmations: 4,
    status: "resolved",
    location: "Koramangala 4th Block",
    reportedAt: "2026-08-24",
    x: 65,
    y: 85,
  },
  {
    id: "CF-1011",
    category: "Pothole",
    description: "Cavity resurfaced with cold-mix asphalt.",
    severity: "high",
    confirmations: 18,
    status: "resolved",
    location: "Richmond Road flyover",
    reportedAt: "2026-08-22",
    x: 20,
    y: 28,
  }
];

export default function DashboardPage() {
  const [issues] = useState<MapIssue[]>(SAMPLE_PUBLIC_ISSUES);
  const [selectedIssue, setSelectedIssue] = useState<MapIssue | null>(SAMPLE_PUBLIC_ISSUES[0]);

  const departments = [
    { name: "Road Infrastructure Authority", resolved: 432, pending: 28, efficiency: 94, icon: "🛣️" },
    { name: "Water Supply & Sewerage Board", resolved: 318, pending: 12, efficiency: 97, icon: "💧" },
    { name: "Public Electrical & Grid", resolved: 380, pending: 19, efficiency: 91, icon: "⚡" },
    { name: "Solid Waste Management", resolved: 290, pending: 8, efficiency: 98, icon: "♻️" },
  ];

  return (
    <main className="relative min-h-screen bg-[#08090E] text-slate-100 py-12 px-4 sm:px-6 lg:px-8 selection:bg-emerald-500/30">
      
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-radial-glow pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />

      <div className="relative mx-auto max-w-7xl space-y-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3.5 py-1 text-xs font-mono text-emerald-400 border border-emerald-500/20 mb-3">
              <Activity className="h-3.5 w-3.5" />
              PUBLIC MUNICIPAL TRANSPARENCY
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
              City Health & Infrastructure Radar
            </h1>
            <p className="text-sm sm:text-base text-slate-400 max-w-2xl mt-2 leading-relaxed">
              100% open public transparency. Live telemetry on urban defects, repair velocity, and municipal department performance.
            </p>
          </div>

          <Link
            href="/report"
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3 text-xs font-bold text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition shrink-0"
          >
            <Camera className="h-4 w-4" />
            <span>Report New Defect</span>
          </Link>
        </div>

        {/* Top Summary Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10">
            <div className="text-xs font-mono text-emerald-400">TOTAL SOLVED</div>
            <div className="text-3xl font-extrabold font-mono text-white mt-1">1,420</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Across 18 City Wards</div>
          </div>

          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10">
            <div className="text-xs font-mono text-amber-400">ACTIVE IN TRIAGE</div>
            <div className="text-3xl font-extrabold font-mono text-white mt-1">39</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Assigned to field crews</div>
          </div>

          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10">
            <div className="text-xs font-mono text-blue-400">AVG REPAIR TIME</div>
            <div className="text-3xl font-extrabold font-mono text-white mt-1">4.2h</div>
            <div className="text-[11px] text-slate-400 mt-0.5">High-severity response</div>
          </div>

          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10">
            <div className="text-xs font-mono text-purple-400">COMMUNITY SIGNALS</div>
            <div className="text-3xl font-extrabold font-mono text-white mt-1">4,892</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Citizen photo confirmations</div>
          </div>
        </div>

        {/* Live Spatial Map Stage */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Live City Hazard Map</h2>
              <p className="text-xs text-slate-400">Interactive spatial tracking with real-time severity clusters.</p>
            </div>
            <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
              Live Geohash Feed
            </span>
          </div>

          <CityMap
            issues={issues}
            selectedIssueId={selectedIssue?.id}
            onSelectIssue={(issue) => setSelectedIssue(issue)}
          />
        </div>

        {/* Department Performance Leaderboards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Department Cards */}
          <div className="lg:col-span-8 space-y-4">
            <h2 className="text-xl font-bold text-white">Municipal Department Scorecard</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {departments.map((dept, i) => (
                <div key={i} className="p-5 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl">{dept.icon}</span>
                    <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-mono text-emerald-400 border border-emerald-500/20 font-bold">
                      {dept.efficiency}% SLA
                    </span>
                  </div>

                  <h3 className="font-bold text-white text-sm">{dept.name}</h3>

                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-white/10 text-xs">
                    <div>
                      <span className="text-slate-400 text-[11px] block">Resolved</span>
                      <span className="font-mono font-bold text-white">{dept.resolved} fixes</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px] block">In Progress</span>
                      <span className="font-mono font-bold text-amber-400">{dept.pending} active</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Citizen Impact Callout */}
          <div className="lg:col-span-4 rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-[#0F1424] to-[#070912] p-6 backdrop-blur-xl space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 mb-4 border border-emerald-500/30">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Community Driven Fixing</h3>
              <p className="text-xs text-slate-300 leading-relaxed mt-2">
                Every photo you submit feeds into our autonomous triage neural network, directly triggering ward engineer work-orders.
              </p>
            </div>

            <div className="pt-4 border-t border-white/10 space-y-2">
              <Link
                href="/report"
                className="flex items-center justify-center gap-2 w-full rounded-xl bg-emerald-500 py-3 text-xs font-bold text-slate-950 shadow-lg hover:bg-emerald-400 transition"
              >
                <Camera className="h-4 w-4" />
                <span>Snap a Hazard Now</span>
              </Link>
            </div>
          </div>

        </div>

      </div>
    </main>
  );
}

