"use client";

import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getIssues, groupNearbyIssues, Issue, Severity } from "../lib/issuesStore";

const SEVERITY_COLOR: Record<Severity, string> = {
  high: "#DC2626",
  medium: "#F59E0B",
  low: "#10B981",
};

const FALLBACK_CENTER: [number, number] = [12.9716, 77.5946];
const FALLBACK_ZOOM = 13;

function MapController({ points }: { points: [number, number][] }) {
  const map = useMap();

  useEffect(() => {
    // Invalidate size shortly after mount so tiles load cleanly without blank areas
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);
    return () => clearTimeout(timer);
  }, [map]);

  useEffect(() => {
    if (points.length === 0) return;

    if (points.length === 1) {
      map.setView(points[0], 15);
      return;
    }

    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
  }, [points, map]);

  return null;
}

export default function LiveIssuesMap() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "high" | "medium" | "low" | "pending">("all");

  useEffect(() => {
    const fetchIssuesData = async () => {
      setLoading(true);
      try {
        const { issues: data } = await getIssues();
        const grouped = groupNearbyIssues(data);
        setIssues(grouped);
      } catch (err) {
        console.warn("Could not load issues:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchIssuesData();
  }, []);

  const plottableIssues = issues.filter(
    (issue) => issue.latitude != null && issue.longitude != null
  );

  const filteredIssues = plottableIssues.filter((issue) => {
    if (filter === "high") return issue.severity === "high";
    if (filter === "medium") return issue.severity === "medium";
    if (filter === "low") return issue.severity === "low";
    if (filter === "pending") return issue.status === "pending";
    return true;
  });

  const points: [number, number][] = filteredIssues.map((issue) => [
    issue.latitude,
    issue.longitude,
  ]);

  return (
    <div className="rounded-2xl border border-[#EEF1F5] overflow-hidden bg-white shadow-sm">
      {/* Map Controls & Filter Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-[#EEF1F5] bg-[#F8FAFC]">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#10B981]"></span>
          </span>
          <span className="text-xs font-bold text-[#0F172A] tracking-tight uppercase">
            Live Bangalore Urban Grid
          </span>
          <span className="text-xs text-[#94A3B8]">·</span>
          <span className="text-xs font-semibold text-[#10B981]">
            {filteredIssues.length} Active Pins
          </span>
        </div>

        {/* Severity filter chips */}
        <div className="flex items-center gap-1.5 text-xs">
          {(
            [
              { id: "all", label: "All" },
              { id: "high", label: "Critical" },
              { id: "medium", label: "Medium" },
              { id: "low", label: "Low" },
              { id: "pending", label: "Pending" },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id)}
              className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                filter === item.id
                  ? "bg-[#0F172A] text-white font-bold shadow-xs"
                  : "bg-white text-[#64748B] hover:text-[#0F172A] border border-[#E2E8F0]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Map Container */}
      <div className="h-[460px] w-full relative">
        {loading && (
          <div className="absolute inset-0 z-[500] flex items-center justify-center bg-white/70 backdrop-blur-xs text-sm font-medium text-[#64748B]">
            <div className="flex items-center gap-2">
              <span className="h-4 w-4 border-2 border-[#10B981] border-t-transparent rounded-full animate-spin" />
              Loading live map pins...
            </div>
          </div>
        )}

        <MapContainer
          center={FALLBACK_CENTER}
          zoom={FALLBACK_ZOOM}
          scrollWheelZoom={false}
          className="h-full w-full z-10"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapController points={points} />

          {filteredIssues.map((issue) => {
            const severity = issue.severity || "medium";
            const color = SEVERITY_COLOR[severity];
            const isCritical = severity === "high";

            return (
              <CircleMarker
                key={issue.id}
                center={[issue.latitude, issue.longitude]}
                radius={isCritical ? 12 : 9}
                pathOptions={{
                  color: color,
                  fillColor: color,
                  fillOpacity: isCritical ? 0.85 : 0.7,
                  weight: isCritical ? 3 : 2,
                }}
              >
                <Popup className="civic-popup" minWidth={220}>
                  <div className="text-xs space-y-2 py-1">
                    <div className="flex items-center justify-between gap-2 border-b border-[#F1F5F9] pb-1.5">
                      <span className="font-bold text-[#0F172A] text-sm leading-tight">
                        {issue.category}
                      </span>
                      <span
                        className="px-2 py-0.5 rounded-full font-bold text-[10px] uppercase text-white"
                        style={{ backgroundColor: color }}
                      >
                        {severity}
                      </span>
                    </div>

                    {issue.image_url && (
                      <img
                        src={issue.image_url}
                        alt="Issue"
                        className="w-full h-24 object-cover rounded-lg border border-[#E2E8F0]"
                      />
                    )}

                    <p className="text-[#475569] text-xs leading-relaxed line-clamp-2">
                      {issue.description || "Reported municipal hazard."}
                    </p>

                    <div className="pt-1.5 border-t border-[#F1F5F9] flex items-center justify-between text-[11px] text-[#64748B]">
                      <span className="font-semibold text-[#16A34A]">
                        🔥 {issue.report_count ?? 1} confirms
                      </span>
                      {issue.merged_count && issue.merged_count > 1 ? (
                        <span className="text-[10px] font-bold text-[#1D4ED8] bg-[#EFF6FF] px-1.5 py-0.5 rounded">
                          {issue.merged_count} reports merged
                        </span>
                      ) : (
                        <span className="capitalize font-mono text-[#0F172A] bg-[#F1F5F9] px-2 py-0.5 rounded">
                          {issue.status.replace("_", " ")}
                        </span>
                      )}
                    </div>

                    {issue.location_name && (
                      <p className="text-[10px] text-[#94A3B8] truncate">
                        📍 {issue.location_name}
                      </p>
                    )}
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>

      {/* Map Legend Footer */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-3 border-t border-[#EEF1F5] text-xs text-[#64748B] bg-white">
        <div className="flex items-center gap-5">
          <LegendDot color={SEVERITY_COLOR.high} label="Critical Priority" />
          <LegendDot color={SEVERITY_COLOR.medium} label="Medium Severity" />
          <LegendDot color={SEVERITY_COLOR.low} label="Low / Minor" />
        </div>
        <span className="text-[#94A3B8]">
          Click any pin on the map to inspect ticket details
        </span>
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        className="w-2.5 h-2.5 rounded-full ring-2 ring-white shadow-xs"
        style={{ backgroundColor: color }}
      />
      <span className="font-medium text-[#334155]">{label}</span>
    </span>
  );
}