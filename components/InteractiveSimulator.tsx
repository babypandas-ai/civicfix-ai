"use client";

import { useState } from "react";
import { 
  Scan, 
  ShieldAlert, 
  CheckCircle2, 
  MapPin, 
  Layers, 
  Truck, 
  Sparkles, 
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Eye
} from "lucide-react";

interface Scenario {
  id: string;
  name: string;
  category: string;
  icon: string;
  image: string;
  severity: "CRITICAL" | "MODERATE" | "LOW";
  confidence: number;
  location: string;
  coordinates: string;
  duplicatesFound: number;
  department: string;
  eta: string;
  aiNotes: string;
  boundingBox: { top: string; left: string; width: string; height: string };
}

const SCENARIOS: Scenario[] = [
  {
    id: "pothole",
    name: "Deep Asphalt Pothole",
    category: "Road & Surface",
    icon: "🕳️",
    image: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80",
    severity: "CRITICAL",
    confidence: 99.2,
    location: "MG Road, near City Market Junction",
    coordinates: "12.9716° N, 77.5946° E",
    duplicatesFound: 14,
    department: "Dept. of Urban Transportation (Roads)",
    eta: "45 mins",
    aiNotes: "Grade IV cavity, 18cm depth detected. Poses immediate suspension damage risk to two-wheelers.",
    boundingBox: { top: "35%", left: "28%", width: "44%", height: "38%" },
  },
  {
    id: "water",
    name: "Burst Water Conduit",
    category: "Hydraulics & Drainage",
    icon: "💧",
    image: "https://images.unsplash.com/photo-1541888946425-d0fbb1861593?auto=format&fit=crop&w=800&q=80",
    severity: "CRITICAL",
    confidence: 97.8,
    location: "5th Cross, Indiranagar",
    coordinates: "12.9784° N, 77.6408° E",
    duplicatesFound: 6,
    department: "Municipal Water Supply & Sewerage",
    eta: "20 mins",
    aiNotes: "High pressure mainline joint failure. Estimated 120L/min potable water loss. Surface puddle expanding.",
    boundingBox: { top: "25%", left: "20%", width: "55%", height: "50%" },
  },
  {
    id: "light",
    name: "Darkened Streetlight Array",
    category: "Electrical & Grid",
    icon: "💡",
    image: "https://images.unsplash.com/photo-1508873696983-2df57046475a?auto=format&fit=crop&w=800&q=80",
    severity: "MODERATE",
    confidence: 98.4,
    location: "Park Avenue, Bus Stop #4",
    coordinates: "12.9352° N, 77.6245° E",
    duplicatesFound: 9,
    department: "City Power & Public Lighting Division",
    eta: "2.5 hours",
    aiNotes: "Sodium vapor fixture out of service. Pedestrian night vision reduced by 85% on walking corridor.",
    boundingBox: { top: "15%", left: "40%", width: "30%", height: "60%" },
  },
  {
    id: "waste",
    name: "Overflowing Smart Bin",
    category: "Sanitation & Health",
    icon: "🗑️",
    image: "https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80",
    severity: "MODERATE",
    confidence: 96.9,
    location: "Church Street, Commercial Hub",
    coordinates: "12.9750° N, 77.6050° E",
    duplicatesFound: 11,
    department: "Solid Waste Management Authority",
    eta: "1.2 hours",
    aiNotes: "Footpath obstruction and sanitation hazard. Bin volumetric capacity exceeded by 240%.",
    boundingBox: { top: "28%", left: "32%", width: "38%", height: "45%" },
  },
];

export function InteractiveSimulator() {
  const [selectedScenario, setSelectedScenario] = useState<Scenario>(SCENARIOS[0]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState<number>(3);

  const handleSelectScenario = (scenario: Scenario) => {
    setSelectedScenario(scenario);
    setIsScanning(true);
    setScanStep(1);

    setTimeout(() => setScanStep(2), 600);
    setTimeout(() => {
      setScanStep(3);
      setIsScanning(false);
    }, 1200);
  };

  return (
    <div className="relative rounded-3xl border border-white/10 bg-[#0C101C]/90 p-6 md:p-10 shadow-2xl backdrop-blur-2xl overflow-hidden">
      
      {/* Ambient background glow */}
      <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-emerald-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-amber-500/10 blur-[100px] pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-mono font-medium text-emerald-400 border border-emerald-500/20 mb-2">
            <Sparkles className="h-3 w-3 animate-spin" style={{ animationDuration: "6s" }} />
            LIVE AI VISION & SPATIAL TRIAGE SIMULATOR
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            See How CivicFix AI Triages in Real Time
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            Select any municipal scenario to test real-time neural bounding boxes, spatial deduplication, and automated dispatch.
          </p>
        </div>

        {/* Status ticker */}
        <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-2xl border border-white/10 shrink-0">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <div className="text-left">
            <div className="text-[10px] uppercase font-mono text-slate-400">Neural Engine</div>
            <div className="text-xs font-bold text-white font-mono">ONLINE · 0.8s INFERENCE</div>
          </div>
        </div>
      </div>

      {/* Scenario Selector Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {SCENARIOS.map((s) => {
          const isSelected = selectedScenario.id === s.id;
          return (
            <button
              key={s.id}
              onClick={() => handleSelectScenario(s)}
              className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all text-left group ${
                isSelected
                  ? "bg-emerald-500/15 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/30"
                  : "bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/[0.06]"
              }`}
            >
              <span className="text-2xl shrink-0 group-hover:scale-110 transition-transform">
                {s.icon}
              </span>
              <div className="min-w-0">
                <div className={`text-xs font-bold truncate ${isSelected ? "text-emerald-300" : "text-white"}`}>
                  {s.name}
                </div>
                <div className="text-[11px] text-slate-400 truncate">{s.category}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Simulation Stage: Dual Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Stage: Simulated Optical Camera & HUD Scan */}
        <div className="lg:col-span-7 relative">
          <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden border border-white/15 bg-black shadow-2xl">
            
            {/* Scene Image */}
            <img
              src={selectedScenario.image}
              alt={selectedScenario.name}
              className="h-full w-full object-cover filter brightness-[0.9] contrast-[1.05]"
            />

            {/* Dark Vignette Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />

            {/* Tech HUD Grid Overlay */}
            <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />

            {/* Top HUD Telemetry */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
              <div className="flex items-center gap-2 rounded-lg bg-black/70 px-3 py-1.5 backdrop-blur-md border border-white/10 text-[11px] font-mono text-emerald-400">
                <Scan className="h-3.5 w-3.5 animate-pulse" />
                <span>AI_INSPECT_NODE // {selectedScenario.id.toUpperCase()}</span>
              </div>
              <div className="rounded-lg bg-black/70 px-3 py-1.5 backdrop-blur-md border border-white/10 text-[11px] font-mono text-slate-300">
                GEO: {selectedScenario.coordinates}
              </div>
            </div>

            {/* Laser Scanline */}
            {isScanning && (
              <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10B981] animate-laser-scan pointer-events-none z-20" />
            )}

            {/* AI Bounding Box HUD */}
            <div
              className={`absolute border-2 rounded-lg transition-all duration-500 z-10 ${
                selectedScenario.severity === "CRITICAL"
                  ? "border-rose-500 bg-rose-500/10 shadow-[0_0_20px_rgba(244,63,94,0.3)]"
                  : "border-amber-500 bg-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.3)]"
              }`}
              style={{
                top: selectedScenario.boundingBox.top,
                left: selectedScenario.boundingBox.left,
                width: selectedScenario.boundingBox.width,
                height: selectedScenario.boundingBox.height,
                opacity: scanStep >= 2 ? 1 : 0,
                transform: scanStep >= 2 ? "scale(1)" : "scale(0.9)",
              }}
            >
              {/* Corner Reticles */}
              <div className="absolute -top-1.5 -left-1.5 h-3 w-3 border-t-2 border-l-2 border-white" />
              <div className="absolute -top-1.5 -right-1.5 h-3 w-3 border-t-2 border-r-2 border-white" />
              <div className="absolute -bottom-1.5 -left-1.5 h-3 w-3 border-b-2 border-l-2 border-white" />
              <div className="absolute -bottom-1.5 -right-1.5 h-3 w-3 border-b-2 border-r-2 border-white" />

              {/* Tag overlay */}
              <div className="absolute -top-7 left-0 flex items-center gap-1.5 rounded-md bg-black/90 px-2.5 py-1 text-[11px] font-mono font-bold text-white border border-white/20 shadow-lg whitespace-nowrap">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>{selectedScenario.name}</span>
                <span className="text-emerald-400">[{selectedScenario.confidence}%]</span>
              </div>
            </div>

            {/* Bottom HUD Bar */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white z-10">
              <div className="flex items-center gap-2 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                <span className="truncate max-w-[200px] sm:max-w-xs">{selectedScenario.location}</span>
              </div>

              <div className="flex items-center gap-2 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 font-mono text-[11px]">
                <span className="text-slate-400">STATUS:</span>
                <span className="text-emerald-400 font-bold">ANALYZED</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Stage: Real-time Neural Triage Telemetry */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Card 1: AI Neural Verdict */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5 text-emerald-400" /> Neural Classification
              </span>
              <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-mono font-bold text-emerald-400 border border-emerald-500/30">
                {selectedScenario.confidence}% CONFIDENCE
              </span>
            </div>

            <div className="text-lg font-bold text-white">{selectedScenario.name}</div>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed bg-black/30 p-3 rounded-xl border border-white/5">
              {selectedScenario.aiNotes}
            </p>

            <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-white/10 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Assessed Severity</span>
                <span className={`font-mono font-bold ${selectedScenario.severity === "CRITICAL" ? "text-rose-400" : "text-amber-400"}`}>
                  ● {selectedScenario.severity}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Category</span>
                <span className="font-semibold text-slate-200">{selectedScenario.category}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Spatial Deduplication Matrix */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-amber-400" /> Spatial Deduplication
              </span>
              <span className="text-xs font-mono text-amber-400 font-bold">
                {selectedScenario.duplicatesFound} REPORTS MERGED
              </span>
            </div>

            <div className="flex items-center gap-3 bg-amber-500/10 p-3 rounded-xl border border-amber-500/20 text-xs text-slate-300">
              <div className="flex -space-x-2 shrink-0">
                <div className="h-6 w-6 rounded-full bg-slate-800 border-2 border-[#0C101C] flex items-center justify-center text-[10px]">👤</div>
                <div className="h-6 w-6 rounded-full bg-slate-700 border-2 border-[#0C101C] flex items-center justify-center text-[10px]">👤</div>
                <div className="h-6 w-6 rounded-full bg-emerald-600 border-2 border-[#0C101C] flex items-center justify-center text-[10px] font-bold text-white">+{selectedScenario.duplicatesFound - 2}</div>
              </div>
              <div>
                <span className="font-semibold text-white">Clustered within 40m radius.</span>
                <p className="text-[11px] text-amber-200/80">
                  Merged into 1 priority ticket instead of flooding officials with duplicates.
                </p>
              </div>
            </div>
          </div>

          {/* Card 3: Automated Municipal Routing */}
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Truck className="h-3.5 w-3.5 text-emerald-400" /> Automated Dispatch Route
              </span>
              <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-mono text-emerald-300">
                ETA: {selectedScenario.eta}
              </span>
            </div>

            <div className="text-sm font-semibold text-white">{selectedScenario.department}</div>
            <div className="mt-2 flex items-center gap-2 text-xs text-emerald-300/80">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Work order automatically dispatched to field mobile terminals.</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
