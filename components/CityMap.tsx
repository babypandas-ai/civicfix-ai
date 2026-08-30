"use client";

import { useState } from "react";
import { MapPin, AlertTriangle, CheckCircle2, Clock, Navigation, Eye, Flame } from "lucide-react";

export interface MapIssue {
  id: string;
  category: string;
  description: string;
  severity: "high" | "medium" | "low";
  confirmations: number;
  status: "pending" | "in_progress" | "resolved";
  location: string;
  reportedAt: string;
  x: number;
  y: number;
}

interface CityMapProps {
  issues: MapIssue[];
  selectedIssueId?: string;
  onSelectIssue?: (issue: MapIssue) => void;
}

export function CityMap({ issues, selectedIssueId, onSelectIssue }: CityMapProps) {
  const [hoveredIssue, setHoveredIssue] = useState<MapIssue | null>(null);
  const [activeFilter, setActiveFilter] = useState<"all" | "high" | "pending" | "resolved">("all");

  const filteredIssues = issues.filter((issue) => {
    if (activeFilter === "high") return issue.severity === "high";
    if (activeFilter === "pending") return issue.status === "pending";
    if (activeFilter === "resolved") return issue.status === "resolved";
    return true;
  });

  return (
    <div className="relative aspect-[16/10] md:aspect-[16/9] w-full rounded-2xl overflow-hidden border border-white/10 bg-[#0A0E1A] shadow-2xl">
      
      {/* City Grid Blueprint Background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-60" />
      
      {/* Simulated Map Arteries & Waterways (SVG Lines) */}
      <svg className="absolute inset-0 h-full w-full pointer-events-none opacity-40">
        {/* Highway Arteries */}
        <path d="M 0 120 Q 200 180, 450 140 T 900 220" fill="none" stroke="#334155" strokeWidth="6" />
        <path d="M 150 0 Q 300 250, 420 500 T 700 800" fill="none" stroke="#334155" strokeWidth="5" />
        <path d="M 50 450 C 250 350, 550 400, 850 300" fill="none" stroke="#1E293B" strokeWidth="8" />
        {/* Secondary streets */}
        <line x1="10%" y1="20%" x2="90%" y2="20%" stroke="#1E293B" strokeWidth="1.5" strokeDasharray="4 4" />
        <line x1="10%" y1="45%" x2="90%" y2="45%" stroke="#1E293B" strokeWidth="1.5" strokeDasharray="4 4" />
        <line x1="10%" y1="70%" x2="90%" y2="70%" stroke="#1E293B" strokeWidth="1.5" strokeDasharray="4 4" />
        <line x1="30%" y1="10%" x2="30%" y2="90%" stroke="#1E293B" strokeWidth="1.5" strokeDasharray="4 4" />
        <line x1="60%" y1="10%" x2="60%" y2="90%" stroke="#1E293B" strokeWidth="1.5" strokeDasharray="4 4" />
        <line x1="85%" y1="10%" x2="85%" y2="90%" stroke="#1E293B" strokeWidth="1.5" strokeDasharray="4 4" />
        {/* Lake / Park polygon */}
        <circle cx="75%" cy="30%" r="45" fill="#0E2A3A" opacity="0.5" />
        <circle cx="25%" cy="75%" r="60" fill="#0C251C" opacity="0.4" />
      </svg>

      {/* Map Header & Controls Overlay */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        <div className="flex items-center gap-2 bg-[#0C101D]/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10 text-xs font-mono text-slate-300 pointer-events-auto">
          <Navigation className="h-3.5 w-3.5 text-emerald-400" />
          <span className="font-bold text-white">BANGALORE CENTRAL METRO GRID</span>
          <span className="text-slate-500">|</span>
          <span className="text-emerald-400">{filteredIssues.length} Pins</span>
        </div>

        {/* Quick Map Filter Chips */}
        <div className="flex items-center gap-1.5 bg-[#0C101D]/90 backdrop-blur-md p-1 rounded-xl border border-white/10 pointer-events-auto text-xs">
          {(["all", "high", "pending", "resolved"] as const).map((filterKey) => (
            <button
              key={filterKey}
              onClick={() => setActiveFilter(filterKey)}
              className={`px-2.5 py-1 rounded-lg font-medium capitalize transition ${
                activeFilter === filterKey
                  ? "bg-emerald-500 text-slate-950 font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {filterKey === "high" ? "Critical" : filterKey}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Issue Pins */}
      {filteredIssues.map((issue) => {
        const isSelected = selectedIssueId === issue.id;
        const isHigh = issue.severity === "high";
        const isResolved = issue.status === "resolved";
        const isPending = issue.status === "pending";

        const pinColor = isResolved
          ? "bg-emerald-500 border-emerald-300 text-slate-950"
          : isHigh
          ? "bg-rose-500 border-rose-300 text-white"
          : isPending
          ? "bg-amber-500 border-amber-300 text-slate-950"
          : "bg-blue-500 border-blue-300 text-white";

        const ringColor = isResolved
          ? "bg-emerald-400"
          : isHigh
          ? "bg-rose-500"
          : isPending
          ? "bg-amber-400"
          : "bg-blue-400";

        return (
          <div
            key={issue.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform duration-200 z-10 hover:z-30 hover:scale-125"
            style={{ left: `${issue.x}%`, top: `${issue.y}%` }}
            onClick={() => onSelectIssue && onSelectIssue(issue)}
            onMouseEnter={() => setHoveredIssue(issue)}
            onMouseLeave={() => setHoveredIssue(null)}
          >
            {/* Pulsing Radar Ring */}
            <span className="relative flex h-8 w-8 items-center justify-center">
              {!isResolved && (
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${ringColor}`} />
              )}
              <span
                className={`relative inline-flex h-6 w-6 items-center justify-center rounded-full border-2 shadow-lg text-[10px] font-bold ${pinColor} ${
                  isSelected ? "ring-4 ring-white" : ""
                }`}
              >
                {isHigh ? "!" : isResolved ? "✓" : "●"}
              </span>
            </span>

            {/* Micro label for critical */}
            {isHigh && (
              <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-rose-950/90 px-1.5 py-0.5 text-[9px] font-mono font-bold text-rose-300 border border-rose-500/40">
                CRITICAL
              </span>
            )}
          </div>
        );
      })}

      {/* Floating Hover/Inspection Popup Card */}
      {hoveredIssue && (
        <div
          className="absolute z-40 w-64 -translate-x-1/2 rounded-2xl bg-[#0F1424]/95 p-4 shadow-2xl border border-white/20 backdrop-blur-xl pointer-events-none transition-all"
          style={{
            left: `${Math.min(Math.max(hoveredIssue.x, 20), 80)}%`,
            top: hoveredIssue.y > 60 ? `${hoveredIssue.y - 30}%` : `${hoveredIssue.y + 12}%`,
          }}
        >
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-xs font-bold text-white font-mono">{hoveredIssue.category}</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-mono font-bold ${
                hoveredIssue.status === "resolved"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : hoveredIssue.severity === "high"
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                  : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
              }`}
            >
              {hoveredIssue.status.replace("_", " ").toUpperCase()}
            </span>
          </div>

          <p className="text-xs text-slate-300 line-clamp-2 leading-snug">{hoveredIssue.description}</p>

          <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
            <span className="truncate max-w-[120px]">{hoveredIssue.location}</span>
            <span className="flex items-center gap-1 text-amber-400 font-mono">
              <Flame className="h-3 w-3" /> {hoveredIssue.confirmations}
            </span>
          </div>
        </div>
      )}

      {/* Bottom Map Legend */}
      <div className="absolute bottom-3 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none text-[11px] text-slate-400 font-mono">
        <div className="flex items-center gap-3 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-rose-500"></span> High Priority</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span> Pending Triage</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span> Resolved</span>
        </div>
        <div className="hidden sm:block bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-slate-400">
          Click any pin to inspect ticket
        </div>
      </div>
    </div>
  );
}
