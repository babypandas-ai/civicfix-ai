"use client";

import { useState } from "react";
import { Radio, AlertTriangle, ShieldCheck, MapPin, Scan, Sparkles } from "lucide-react";

export function CityRadar() {
  const [activeNode, setActiveNode] = useState<number | null>(0);

  const radarNodes = [
    {
      id: 0,
      title: "MG Road Pothole",
      category: "Road Hazard",
      severity: "CRITICAL",
      confirmations: 14,
      x: 35,
      y: 28,
      color: "rose",
    },
    {
      id: 1,
      title: "5th Cross Water Leak",
      category: "Hydraulics",
      severity: "CRITICAL",
      confirmations: 6,
      x: 72,
      y: 42,
      color: "rose",
    },
    {
      id: 2,
      title: "Park Ave Streetlight",
      category: "Electrical",
      severity: "MEDIUM",
      confirmations: 9,
      x: 60,
      y: 78,
      color: "amber",
    },
    {
      id: 3,
      title: "Church St Bin",
      category: "Sanitation",
      severity: "MEDIUM",
      confirmations: 11,
      x: 25,
      y: 65,
      color: "amber",
    },
  ];

  return (
    <div className="relative w-full max-w-lg mx-auto aspect-square rounded-3xl border border-white/15 bg-gradient-to-b from-[#0F1424]/90 to-[#070910]/95 p-6 shadow-2xl backdrop-blur-2xl overflow-hidden flex items-center justify-center">
      
      {/* Background Radar Grid Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />

      {/* Concentric Radar Rings */}
      <div className="absolute h-full w-full rounded-full border border-emerald-500/10 pointer-events-none" />
      <div className="absolute h-[75%] w-[75%] rounded-full border border-emerald-500/15 pointer-events-none" />
      <div className="absolute h-[50%] w-[50%] rounded-full border border-emerald-500/20 pointer-events-none" />
      <div className="absolute h-[25%] w-[25%] rounded-full border border-emerald-500/30 pointer-events-none" />

      {/* Crosshairs */}
      <div className="absolute h-full w-[1px] bg-emerald-500/15 pointer-events-none" />
      <div className="absolute w-full h-[1px] bg-emerald-500/15 pointer-events-none" />

      {/* Rotating Sonar Radar Sweep Beam */}
      <div className="absolute inset-0 pointer-events-none animate-radar-sweep origin-center">
        <div
          className="h-1/2 w-1/2 origin-bottom-right"
          style={{
            background: "conic-gradient(from 0deg at 100% 100%, rgba(16, 185, 129, 0.35) 0deg, transparent 75deg)",
          }}
        />
      </div>

      {/* Center Beacon (Radar Hub) */}
      <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 border-2 border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.5)]">
        <Radio className="h-6 w-6 text-emerald-300 animate-pulse" />
        <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-400 animate-ping"></span>
      </div>

      {/* Dynamic Radar Nodes */}
      {radarNodes.map((node) => {
        const isActive = activeNode === node.id;
        const isRose = node.color === "rose";

        return (
          <button
            key={node.id}
            onClick={() => setActiveNode(node.id)}
            className="absolute z-20 group -translate-x-1/2 -translate-y-1/2 transition-transform duration-300 hover:scale-125 focus:outline-none"
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
          >
            <span className="relative flex h-8 w-8 items-center justify-center">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-60 ${
                  isRose ? "bg-rose-500" : "bg-amber-400"
                }`}
              />
              <span
                className={`relative inline-flex h-6 w-6 items-center justify-center rounded-full border-2 text-[10px] font-bold shadow-lg transition-all ${
                  isRose
                    ? "bg-rose-600 border-rose-300 text-white"
                    : "bg-amber-500 border-amber-200 text-slate-950"
                } ${isActive ? "ring-4 ring-white" : ""}`}
              >
                {node.id + 1}
              </span>
            </span>
          </button>
        );
      })}

      {/* Floating Active Node Telemetry Card */}
      {activeNode !== null && (
        <div className="absolute bottom-4 left-4 right-4 z-30 rounded-2xl bg-[#090D18]/90 p-3.5 border border-white/20 backdrop-blur-xl shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400"></span>
              <span className="text-xs font-bold text-white font-mono">
                {radarNodes[activeNode].title}
              </span>
            </div>
            <span
              className={`rounded px-1.5 py-0.5 text-[10px] font-mono font-bold ${
                radarNodes[activeNode].color === "rose"
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                  : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
              }`}
            >
              {radarNodes[activeNode].severity}
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
            <span>{radarNodes[activeNode].category}</span>
            <span className="font-mono text-emerald-400 font-medium">
              {radarNodes[activeNode].confirmations} citizen reports merged
            </span>
          </div>
        </div>
      )}

      {/* Top Left Telemetry Tag */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 rounded-xl bg-black/60 px-3 py-1.5 backdrop-blur-md border border-white/10 text-[11px] font-mono text-emerald-400">
        <Scan className="h-3.5 w-3.5 animate-pulse" />
        <span>SPATIAL_RADAR // ACTIVE</span>
      </div>

      {/* Top Right Live Telemetry */}
      <div className="absolute top-4 right-4 z-20 rounded-xl bg-black/60 px-3 py-1.5 backdrop-blur-md border border-white/10 text-[11px] font-mono text-slate-300">
        RADIUS: 4.8 KM
      </div>
    </div>
  );
}
