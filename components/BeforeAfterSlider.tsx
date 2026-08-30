"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Sparkles, ArrowLeftRight, CheckCircle2, AlertOctagon } from "lucide-react";

interface ComparisonItem {
  id: string;
  title: string;
  location: string;
  beforeLabel: string;
  afterLabel: string;
  beforeImage: string;
  afterImage: string;
  daysToResolve: number;
}

const COMPARISONS: ComparisonItem[] = [
  {
    id: "pothole-repair",
    title: "Hazardous MG Road Junction Fissure",
    location: "MG Road, Ward 12",
    beforeLabel: "Reported: 18cm Cavity (High Risk)",
    afterLabel: "Resolved: Cold-Mix Asphalt Resurfacing",
    beforeImage: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=1200&q=80",
    afterImage: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=1200&q=80",
    daysToResolve: 1.2,
  },
  {
    id: "water-pipe",
    title: "High-Pressure Mainline Pipe Burst",
    location: "5th Cross, Indiranagar",
    beforeLabel: "Reported: 120L/min Potable Leak",
    afterLabel: "Resolved: High-Density Polyethylene Sleeve",
    beforeImage: "https://images.unsplash.com/photo-1541888946425-d0fbb1861593?auto=format&fit=crop&w=1200&q=80",
    afterImage: "https://images.unsplash.com/photo-1590496793929-36417d3117de?auto=format&fit=crop&w=1200&q=80",
    daysToResolve: 0.6,
  }
];

export function BeforeAfterSlider() {
  const [activeTab, setActiveTab] = useState(0);
  const [sliderPosition, setSliderPosition] = useState(50); // percentage (0-100)
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const current = COMPARISONS[activeTab];

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let percentage = (x / rect.width) * 100;
    if (percentage < 5) percentage = 5;
    if (percentage > 95) percentage = 95;
    setSliderPosition(percentage);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      handleMove(e.touches[0].clientX);
    }
  }, [handleMove]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      handleMove(e.clientX);
    }
  }, [isDragging, handleMove]);

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, []);

  return (
    <div className="relative rounded-3xl border border-white/10 bg-[#0C101C]/80 p-6 md:p-10 shadow-2xl backdrop-blur-2xl overflow-hidden">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-mono text-emerald-400 border border-emerald-500/20 mb-3">
            <Sparkles className="h-3 w-3" />
            MEASURABLE URBAN IMPACT
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Before & After Civic Fixes
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            Drag the interactive slider to reveal how citizen reports become completed public works.
          </p>
        </div>

        {/* Tab selection */}
        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-2xl border border-white/10 shrink-0">
          {COMPARISONS.map((comp, idx) => (
            <button
              key={comp.id}
              onClick={() => {
                setActiveTab(idx);
                setSliderPosition(50);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeTab === idx
                  ? "bg-emerald-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Case #{idx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Slider Frame */}
      <div
        ref={containerRef}
        onMouseDown={() => setIsDragging(true)}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        className="relative aspect-[16/9] md:aspect-[21/9] w-full rounded-2xl overflow-hidden select-none cursor-ew-resize border border-white/15 shadow-2xl bg-black"
      >
        {/* AFTER (Full background) */}
        <img
          src={current.afterImage}
          alt={current.afterLabel}
          className="absolute inset-0 h-full w-full object-cover pointer-events-none"
        />

        {/* AFTER Label Tag */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 rounded-xl bg-emerald-950/80 backdrop-blur-md px-3.5 py-1.5 border border-emerald-500/30 text-xs font-bold text-emerald-300 shadow-lg">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
          <span>{current.afterLabel}</span>
        </div>

        {/* BEFORE (Clipped overlay) */}
        <div
          className="absolute inset-y-0 left-0 overflow-hidden pointer-events-none"
          style={{ width: `${sliderPosition}%` }}
        >
          <img
            src={current.beforeImage}
            alt={current.beforeLabel}
            className="absolute inset-0 h-full w-full object-cover max-w-none"
            style={{
              width: containerRef.current ? `${containerRef.current.clientWidth}px` : "100%",
            }}
          />
          {/* Darker tint for before */}
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* BEFORE Label Tag */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 rounded-xl bg-rose-950/80 backdrop-blur-md px-3.5 py-1.5 border border-rose-500/30 text-xs font-bold text-rose-300 shadow-lg">
          <AlertOctagon className="h-3.5 w-3.5 text-rose-400" />
          <span>{current.beforeLabel}</span>
        </div>

        {/* Drag Divider Bar */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)] z-20 transition-transform"
          style={{ left: `${sliderPosition}%`, transform: "translateX(-50%)" }}
        >
          {/* Circular Handle */}
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-900 shadow-2xl border-2 border-emerald-500">
            <ArrowLeftRight className="h-4 w-4" />
          </div>
        </div>

        {/* Bottom meta banner */}
        <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-2 bg-black/70 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-xs text-white">
          <span className="font-semibold">{current.title} · <span className="text-slate-400">{current.location}</span></span>
          <span className="font-mono text-emerald-400 font-bold">Resolved in {current.daysToResolve} days</span>
        </div>
      </div>
    </div>
  );
}
