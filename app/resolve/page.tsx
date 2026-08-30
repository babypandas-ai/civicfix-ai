"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  MapPin, 
  Flame, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon, 
  Search, 
  Filter, 
  Layers, 
  LayoutList, 
  Map as MapIcon, 
  SlidersHorizontal,
  ChevronRight,
  Sparkles,
  ArrowUpDown,
  RefreshCw,
  Eye,
  Truck,
  Printer
} from "lucide-react";
import { CityMap, MapIssue } from "../../components/CityMap";

type Severity = "low" | "medium" | "high";
type Status = "pending" | "in_progress" | "resolved";

interface Issue extends MapIssue {
  department: string;
  assignedCrew?: string;
  aiConfidence: number;
}

const INITIAL_ISSUES: Issue[] = [
  {
    id: "CF-1042",
    category: "Pothole",
    description: "Large 18cm asphalt cavity blocking half the lane near the market junction. Serious collision risk for two-wheelers.",
    severity: "high",
    confirmations: 14,
    status: "pending",
    location: "MG Road, near City Market Junction",
    reportedAt: "2026-08-27",
    x: 42,
    y: 38,
    department: "Road Infrastructure Authority",
    assignedCrew: "Road Maintenance Crew #4",
    aiConfidence: 99.2,
  },
  {
    id: "CF-1039",
    category: "Water Leak",
    description: "High-pressure continuous leak from main pipe joint, forming a large street puddle and flooding sidewalk.",
    severity: "high",
    confirmations: 6,
    status: "in_progress",
    location: "5th Cross, Indiranagar",
    reportedAt: "2026-08-26",
    x: 75,
    y: 45,
    department: "Water Supply & Sewerage Board",
    assignedCrew: "Emergency Hydraulic Rapid Unit #2",
    aiConfidence: 97.8,
  },
  {
    id: "CF-1051",
    category: "Streetlight",
    description: "Sodium luminaire array flickering and now dark throughout entire 100m pedestrian walking corridor.",
    severity: "medium",
    confirmations: 9,
    status: "pending",
    location: "Park Avenue, near Bus Stop 4",
    reportedAt: "2026-08-28",
    x: 58,
    y: 75,
    department: "Public Electrical & Grid Services",
    assignedCrew: "Electrical Line Crew #1",
    aiConfidence: 98.4,
  },
  {
    id: "CF-1033",
    category: "Garbage",
    description: "Commercial bin overflowing for 3+ days, waste spilling onto public footpath creating bio-hazard.",
    severity: "medium",
    confirmations: 11,
    status: "pending",
    location: "Church Street commercial junction",
    reportedAt: "2026-08-25",
    x: 32,
    y: 62,
    department: "Solid Waste Management Authority",
    assignedCrew: "Sanitation Rapid Van #7",
    aiConfidence: 96.9,
  },
  {
    id: "CF-1058",
    category: "Pothole",
    description: "Minor asphalt erosion forming near curb, not yet a critical hazard but recommended for preventive sealing.",
    severity: "low",
    confirmations: 2,
    status: "pending",
    location: "Lakeview Road, Ward 14",
    reportedAt: "2026-08-29",
    x: 82,
    y: 25,
    department: "Road Infrastructure Authority",
    assignedCrew: "Preventive Pavement Team",
    aiConfidence: 95.1,
  },
  {
    id: "CF-1020",
    category: "Water Leak",
    description: "Minor valve dripping at municipal water distribution point. Resolved with replacement gasket.",
    severity: "low",
    confirmations: 4,
    status: "resolved",
    location: "Koramangala 4th Block",
    reportedAt: "2026-08-24",
    x: 65,
    y: 85,
    department: "Water Supply & Sewerage Board",
    assignedCrew: "Local Ward Plumber Unit",
    aiConfidence: 98.0,
  }
];

const SEVERITY_WEIGHT: Record<Severity, number> = {
  low: 1,
  medium: 2,
  high: 3,
};

function getPriorityScore(issue: Issue): number {
  return SEVERITY_WEIGHT[issue.severity] * issue.confirmations;
}

export default function ResolvePage() {
  const [issues, setIssues] = useState<Issue[]>(INITIAL_ISSUES);
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [severityFilter, setSeverityFilter] = useState<Severity | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(INITIAL_ISSUES[0]);

  const updateStatus = (issueId: string, newStatus: Status) => {
    setIssues((prev) =>
      prev.map((issue) =>
        issue.id === issueId ? { ...issue, status: newStatus } : issue
      )
    );

    if (selectedIssue && selectedIssue.id === issueId) {
      setSelectedIssue((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  const handleUpvote = (issueId: string) => {
    setIssues((prev) =>
      prev.map((issue) =>
        issue.id === issueId
          ? { ...issue, confirmations: issue.confirmations + 1 }
          : issue
      )
    );

    if (selectedIssue && selectedIssue.id === issueId) {
      setSelectedIssue((prev) =>
        prev ? { ...prev, confirmations: prev.confirmations + 1 } : null
      );
    }
  };

  const filteredAndSortedIssues = useMemo(() => {
    return issues
      .filter((issue) => {
        if (statusFilter !== "all" && issue.status !== statusFilter) return false;
        if (severityFilter !== "all" && issue.severity !== severityFilter) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return (
            issue.id.toLowerCase().includes(q) ||
            issue.category.toLowerCase().includes(q) ||
            issue.location.toLowerCase().includes(q) ||
            issue.description.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => getPriorityScore(b) - getPriorityScore(a));
  }, [issues, statusFilter, severityFilter, searchQuery]);

  const criticalCount = issues.filter((i) => i.severity === "high" && i.status !== "resolved").length;
  const inProgressCount = issues.filter((i) => i.status === "in_progress").length;
  const resolvedCount = issues.filter((i) => i.status === "resolved").length;
  const totalConfirmations = issues.reduce((acc, curr) => acc + curr.confirmations, 0);

  return (
    <main className="relative min-h-screen bg-[#08090E] text-slate-100 py-10 px-4 sm:px-6 lg:px-8 selection:bg-emerald-500/30">
      
      {/* Background Grid */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-radial-glow pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />

      <div className="relative mx-auto max-w-7xl">
        
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-8 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-3.5 py-1 text-xs font-mono text-amber-400 border border-amber-500/20 mb-2">
              <ShieldCheck className="h-3.5 w-3.5" />
              MUNICIPAL TRIAGE & DISPATCH COMMAND
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              City Operations Center
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-xl">
              Real-time deduplicated incident queue. Triaged by neural severity scoring and citizen confirmation weight.
            </p>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-2 bg-white/5 p-1 rounded-2xl border border-white/10 shrink-0">
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                viewMode === "list"
                  ? "bg-emerald-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <LayoutList className="h-4 w-4" />
              <span>Command List</span>
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                viewMode === "map"
                  ? "bg-emerald-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <MapIcon className="h-4 w-4" />
              <span>Spatial Grid</span>
            </button>
          </div>
        </div>

        {/* 4 Metric Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/[0.04] p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between text-xs font-mono text-rose-400 mb-2">
              <span>CRITICAL HAZARDS</span>
              <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping"></span>
            </div>
            <div className="text-3xl font-extrabold font-mono text-white">{criticalCount}</div>
            <div className="text-[11px] text-slate-400 mt-1">Requires immediate dispatch</div>
          </div>

          <div className="rounded-2xl border border-blue-500/30 bg-blue-500/[0.04] p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between text-xs font-mono text-blue-400 mb-2">
              <span>IN-PROGRESS CREWS</span>
              <Truck className="h-4 w-4 text-blue-400" />
            </div>
            <div className="text-3xl font-extrabold font-mono text-white">{inProgressCount}</div>
            <div className="text-[11px] text-slate-400 mt-1">Active field work-orders</div>
          </div>

          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.04] p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between text-xs font-mono text-emerald-400 mb-2">
              <span>RESOLVED TICKETS</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-extrabold font-mono text-white">{resolvedCount}</div>
            <div className="text-[11px] text-slate-400 mt-1">Public works completed</div>
          </div>

          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/[0.04] p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between text-xs font-mono text-amber-400 mb-2">
              <span>CITIZEN SIGNALS</span>
              <Flame className="h-4 w-4 text-amber-400" />
            </div>
            <div className="text-3xl font-extrabold font-mono text-white">{totalConfirmations}</div>
            <div className="text-[11px] text-slate-400 mt-1">Cluster deduplication weight</div>
          </div>

        </div>

        {/* Filter & Search Bar */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 backdrop-blur-xl mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ticket ID, street, category, or description..."
              className="w-full rounded-xl border border-white/10 bg-black/40 pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none transition focus:border-emerald-500/50"
            />
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            
            {/* Status Filter */}
            <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10">
              <span className="text-slate-400 px-2 text-[11px] font-mono">STATUS:</span>
              {(["all", "pending", "in_progress", "resolved"] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-2.5 py-1 rounded-lg font-medium capitalize transition ${
                    statusFilter === status
                      ? "bg-emerald-500 text-slate-950 font-bold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {status === "all" ? "All" : status.replace("_", " ")}
                </button>
              ))}
            </div>

            {/* Severity Filter */}
            <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10">
              <span className="text-slate-400 px-2 text-[11px] font-mono">SEVERITY:</span>
              {(["all", "high", "medium", "low"] as const).map((sev) => (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev)}
                  className={`px-2.5 py-1 rounded-lg font-medium capitalize transition ${
                    severityFilter === sev
                      ? "bg-amber-500 text-slate-950 font-bold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {sev === "all" ? "All" : sev === "high" ? "Critical" : sev}
                </button>
              ))}
            </div>

          </div>
        </div>

        {/* Main Stage: Dual View (List vs Map) + Detail Drawer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main View Area */}
          <div className="lg:col-span-7 space-y-4">
            
            {viewMode === "map" ? (
              <CityMap
                issues={filteredAndSortedIssues}
                selectedIssueId={selectedIssue?.id}
                onSelectIssue={(issue) => setSelectedIssue(issue as Issue)}
              />
            ) : (
              <div className="space-y-3">
                {filteredAndSortedIssues.length === 0 ? (
                  <div className="text-center py-16 rounded-2xl border border-white/10 bg-white/[0.02]">
                    <p className="text-slate-400 font-mono text-sm">No civic incidents match your current filter parameters.</p>
                  </div>
                ) : (
                  filteredAndSortedIssues.map((issue, idx) => {
                    const isSelected = selectedIssue?.id === issue.id;
                    const priorityScore = getPriorityScore(issue);

                    return (
                      <div
                        key={issue.id}
                        onClick={() => setSelectedIssue(issue)}
                        className={`group relative rounded-2xl border p-5 backdrop-blur-xl transition-all cursor-pointer ${
                          isSelected
                            ? "bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/30"
                            : "bg-[#0C101D]/80 border-white/10 hover:border-white/20 hover:bg-[#0E1424]"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          
                          {/* Rank / Score */}
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10 font-mono font-bold text-white text-sm">
                              #{idx + 1}
                            </div>
                            
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm font-bold text-white font-mono">
                                  {issue.id}
                                </span>
                                <span className="text-xs font-semibold text-slate-200">
                                  {issue.category}
                                </span>

                                {/* Severity Badge */}
                                <span
                                  className={`rounded-full px-2 py-0.5 text-[10px] font-mono font-bold ${
                                    issue.severity === "high"
                                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                      : issue.severity === "medium"
                                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                      : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                  }`}
                                >
                                  {issue.severity.toUpperCase()}
                                </span>

                                {/* Status Badge */}
                                <span
                                  className={`rounded-full px-2 py-0.5 text-[10px] font-mono font-bold ${
                                    issue.status === "resolved"
                                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                      : issue.status === "in_progress"
                                      ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                      : "bg-white/10 text-slate-300 border border-white/15"
                                  }`}
                                >
                                  {issue.status.replace("_", " ").toUpperCase()}
                                </span>
                              </div>

                              <p className="text-xs text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                                {issue.description}
                              </p>
                            </div>
                          </div>

                          {/* Priority Score Tag */}
                          <div className="shrink-0 text-right">
                            <div className="inline-flex items-center gap-1 rounded-xl bg-amber-500/10 px-2.5 py-1 text-xs font-mono font-bold text-amber-400 border border-amber-500/30">
                              <Flame className="h-3.5 w-3.5" />
                              <span>Score: {priorityScore}</span>
                            </div>
                          </div>

                        </div>

                        {/* Location & Meta Footer */}
                        <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 font-mono">
                          <span className="flex items-center gap-1 text-slate-300">
                            <MapPin className="h-3 w-3 text-emerald-400" />
                            {issue.location}
                          </span>
                          <div className="flex items-center gap-3">
                            <span>{issue.confirmations} Confirmations</span>
                            <span>Reported: {issue.reportedAt}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

          </div>

          {/* Right Stage: Issue Detail & Dispatch Drawer */}
          <div className="lg:col-span-5">
            {selectedIssue ? (
              <div className="sticky top-24 rounded-3xl border border-white/15 bg-[#0C101F]/95 p-6 shadow-2xl backdrop-blur-2xl space-y-6">
                
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                      INCIDENT DOSSIER
                    </span>
                    <h3 className="text-xl font-bold font-mono text-white mt-0.5">
                      #{selectedIssue.id} // {selectedIssue.category}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleUpvote(selectedIssue.id)}
                      className="flex items-center gap-1 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 px-3 py-1.5 text-xs font-mono font-bold text-amber-300 border border-amber-500/30 transition"
                      title="Add citizen confirmation"
                    >
                      <Flame className="h-3.5 w-3.5" /> +1 Confirm
                    </button>
                  </div>
                </div>

                {/* Status Action Buttons */}
                <div>
                  <span className="text-[11px] font-mono uppercase text-slate-400 block mb-2">
                    Update Operational Status
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => updateStatus(selectedIssue.id, "pending")}
                      disabled={selectedIssue.status === "pending"}
                      className="px-3 py-2 rounded-xl text-xs font-bold transition border border-white/10 text-slate-300 hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Pending
                    </button>

                    <button
                      type="button"
                      onClick={() => updateStatus(selectedIssue.id, "in_progress")}
                      disabled={selectedIssue.status === "in_progress"}
                      className="px-3 py-2 rounded-xl text-xs font-bold transition bg-blue-500/20 text-blue-300 border border-blue-500/40 hover:bg-blue-500/30 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      In Progress
                    </button>

                    <button
                      type="button"
                      onClick={() => updateStatus(selectedIssue.id, "resolved")}
                      disabled={selectedIssue.status === "resolved"}
                      className="px-3 py-2 rounded-xl text-xs font-bold transition bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Resolved
                    </button>
                  </div>
                </div>

                {/* Description */}
                <div className="bg-black/40 p-4 rounded-2xl border border-white/5 space-y-2">
                  <span className="text-[10px] font-mono uppercase text-slate-400">Incident Details</span>
                  <p className="text-xs text-slate-200 leading-relaxed font-sans">
                    {selectedIssue.description}
                  </p>
                </div>

                {/* Dispatch Department Info */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-mono text-[11px]">ASSIGNED DEPARTMENT</span>
                    <span className="text-emerald-400 font-mono text-[11px]">{selectedIssue.aiConfidence}% AI Match</span>
                  </div>
                  <div className="font-bold text-white">{selectedIssue.department}</div>
                  <div className="flex items-center gap-2 text-slate-400 text-[11px] pt-1">
                    <Truck className="h-3.5 w-3.5 text-blue-400" />
                    <span>{selectedIssue.assignedCrew || "Crew #4 Standby"}</span>
                  </div>
                </div>

                {/* Location & Geohash Telemetry */}
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 bg-black/40 p-3 rounded-xl border border-white/5">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                    {selectedIssue.location}
                  </span>
                </div>

                {/* Priority Score Formula */}
                <div className="p-3.5 rounded-2xl bg-amber-500/[0.06] border border-amber-500/20 text-xs text-slate-300">
                  <div className="flex items-center justify-between font-mono text-[11px] text-amber-400 mb-1">
                    <span>TRIAGE FORMULA</span>
                    <span>Score = {getPriorityScore(selectedIssue)}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Severity Weight ({SEVERITY_WEIGHT[selectedIssue.severity]}) × {selectedIssue.confirmations} Confirmations
                  </p>
                </div>

              </div>
            ) : (
              <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 text-center text-slate-400 font-mono text-xs">
                Select an incident from the queue to inspect details.
              </div>
            )}
          </div>

        </div>

      </div>
    </main>
  );
}