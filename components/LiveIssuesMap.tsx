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
import { supabase } from "../lib/supabaseClient";

type Severity = "low" | "medium" | "high";

type MapIssueRow = {
  id: string;
  category: string | null;
  severity: Severity | null;
  latitude: number | null;
  longitude: number | null;
  status: string | null;
};

const SEVERITY_COLOR: Record<Severity, string> = {
  high: "#DC2626",
  medium: "#F59E0B",
  low: "#22C55E",
};

const FALLBACK_CENTER: [number, number] = [12.9716, 77.5946];
const FALLBACK_ZOOM = 12;

function FitToMarkers({ points }: { points: [number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (points.length === 0) return;

    if (points.length === 1) {
      map.setView(points[0], 15);
      return;
    }

    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
  }, [points, map]);

  return null;
}

export default function LiveIssuesMap() {
  const [issues, setIssues] = useState<MapIssueRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIssues = async () => {
      setLoading(true);
      setLoadError(null);

      const { data, error } = await supabase
        .from("issues")
        .select("id, category, severity, latitude, longitude, status");

      if (error) {
        console.error(error);
        setLoadError(error.message);
        setIssues([]);
      } else {
        setIssues((data as MapIssueRow[]) || []);
      }

      setLoading(false);
    };

    fetchIssues();
  }, []);

  const plottableIssues = issues.filter(
    (issue) => issue.latitude != null && issue.longitude != null
  );

  const points: [number, number][] = plottableIssues.map((issue) => [
    issue.latitude as number,
    issue.longitude as number,
  ]);

  return (
    <div className="rounded-2xl border border-[#EEF1F5] overflow-hidden bg-white">
      <div className="h-[420px] w-full relative">
        {loading && (
          <div className="absolute inset-0 z-[500] flex items-center justify-center bg-white/70 text-sm text-[#94A3B8]">
            Loading live map...
          </div>
        )}

        {!loading && loadError && (
          <div className="absolute inset-0 z-[500] flex items-center justify-center bg-white text-sm text-[#B91C1C] px-6 text-center">
            Could not load issues: {loadError}
          </div>
        )}

        {!loading && !loadError && plottableIssues.length === 0 && (
          <div className="absolute inset-0 z-[500] flex items-center justify-center bg-white text-sm text-[#94A3B8] px-6 text-center">
            No issues with a location yet. Reports will appear here once submitted.
          </div>
        )}

        <MapContainer
          center={FALLBACK_CENTER}
          zoom={FALLBACK_ZOOM}
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <FitToMarkers points={points} />

          {plottableIssues.map((issue) => {
            const severity = issue.severity || "medium";
            return (
              <CircleMarker
                key={issue.id}
                center={[issue.latitude as number, issue.longitude as number]}
                radius={10}
                pathOptions={{
                  color: SEVERITY_COLOR[severity],
                  fillColor: SEVERITY_COLOR[severity],
                  fillOpacity: 0.8,
                  weight: 2,
                }}
              >
                <Popup>
                  <div className="text-xs">
                    <p className="font-bold mb-0.5">
                      {issue.category || "Uncategorized"}
                    </p>
                    <p className="text-[#64748B]">
                      Severity: {severity} · Status: {issue.status || "pending"}
                    </p>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>

      <div className="flex items-center gap-5 px-5 py-3.5 border-t border-[#EEF1F5] text-xs text-[#64748B]">
        <LegendDot color={SEVERITY_COLOR.high} label="High" />
        <LegendDot color={SEVERITY_COLOR.medium} label="Medium" />
        <LegendDot color={SEVERITY_COLOR.low} label="Low" />
        <span className="ml-auto text-[#94A3B8]">
          {plottableIssues.length} active reports
        </span>
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        className="w-2.5 h-2.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}