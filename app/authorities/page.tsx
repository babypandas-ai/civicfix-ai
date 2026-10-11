"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Inter } from "next/font/google";
import {
  getIssues,
  updateIssue,
  seedIssuesToSupabase,
  Issue,
  Severity,
  Status,
} from "../../lib/issuesStore";
import { supabase } from "../../lib/supabaseClient";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-body",
});

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function AuthoritiesPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyIssueId, setBusyIssueId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | Status>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchIssuesData();
  }, []);

  const fetchIssuesData = async () => {
    setLoading(true);
    try {
      const { issues: data } = await getIssues();
      // Ensure sorted by report_count descending (Leaderboard)
      const sorted = [...data].sort(
        (a, b) => (b.report_count ?? 0) - (a.report_count ?? 0)
      );
      setIssues(sorted);
    } catch (err) {
      console.warn("Could not load issues:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadFixedPhoto = async (issueId: string, file: File) => {
    setBusyIssueId(issueId);

    try {
      const dataUrl = await fileToDataUrl(file);
      let fixedImageUrl = dataUrl;

      // Upload fixed resolution photo to Supabase Storage bucket issue-images
      try {
        const fileExt = file.name.split(".").pop() || "jpg";
        const cleanName = `fixed-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
        const { data: uploadData, error: uploadErr } = await supabase.storage
          .from("issue-images")
          .upload(cleanName, file, { contentType: file.type });

        if (!uploadErr && uploadData) {
          const { data: urlData } = supabase.storage
            .from("issue-images")
            .getPublicUrl(cleanName);
          fixedImageUrl = urlData.publicUrl;
        }
      } catch (uploadError) {
        console.warn("Could not upload fixed image to Supabase Storage:", uploadError);
      }

      await updateIssue(issueId, {
        status: "in_progress",
      });

      setIssues((prev) =>
        prev.map((issue) =>
          issue.id === issueId
            ? { ...issue, fixed_image_url: fixedImageUrl, status: "in_progress" }
            : issue
        )
      );
    } catch (err) {
      console.error(err);
      alert("Could not update the fixed photo. Please try again.");
    } finally {
      setBusyIssueId(null);
    }
  };

  const handleCloseTicket = async (issueId: string) => {
    setBusyIssueId(issueId);

    try {
      await updateIssue(issueId, { status: "resolved" });

      setIssues((prev) =>
        prev.map((issue) =>
          issue.id === issueId ? { ...issue, status: "resolved" } : issue
        )
      );
    } catch (err) {
      console.error(err);
      alert("Could not close the ticket. Please try again.");
    } finally {
      setBusyIssueId(null);
    }
  };

  const handleSeedSupabase = async () => {
    if (confirm("Insert 6 sample Bangalore civic issues directly into your Supabase database?")) {
      setLoading(true);
      await seedIssuesToSupabase();
      await fetchIssuesData();
    }
  };

  const filteredIssues = issues.filter((issue) => {
    if (statusFilter !== "all" && issue.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCat = issue.category.toLowerCase().includes(q);
      const matchDesc = issue.description.toLowerCase().includes(q);
      const matchLoc = (issue.location_name || "").toLowerCase().includes(q);
      return matchCat || matchDesc || matchLoc;
    }
    return true;
  });

  return (
    <main
      className={inter.variable + " min-h-screen bg-[#FAFBFC] text-[#0F172A]"}
      style={{ fontFamily: "var(--font-body)" }}
    >
      <header className="border-b border-[#EEF1F5] bg-white sticky top-0 z-30">
        <div className="mx-auto max-w-5xl px-6 py-5 flex items-center justify-between">
          <Link href="/" className="text-2xl font-extrabold tracking-tight">
            Civic<span className="text-[#22C55E]">Fix</span>
          </Link>
          <div className="flex items-center gap-4">
            <button
              onClick={handleSeedSupabase}
              className="text-xs font-semibold text-[#16A34A] bg-[#ECFDF5] hover:bg-[#DCFCE7] transition px-3.5 py-1.5 rounded-lg border border-[#BBF7D0] cursor-pointer"
            >
              + Seed Demo to Supabase
            </button>
            <Link
              href="/"
              className="text-sm font-medium text-[#475569] hover:text-[#0F172A] transition"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <span className="inline-block text-xs font-semibold tracking-wide text-[#16A34A] bg-[#ECFDF5] border border-[#BBF7D0] rounded-full px-3 py-1 mb-2">
                Municipal Operations Portal
              </span>
              <h1 className="text-3xl font-extrabold tracking-tight">
                Civic Issue <span className="text-[#22C55E]">Leaderboard</span>
              </h1>
            </div>

            {/* Total counts badge */}
            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-[#EEF1F5] shadow-xs">
              <div className="text-center">
                <div className="text-lg font-black text-[#0F172A]">{issues.length}</div>
                <div className="text-[10px] text-[#64748B] font-medium uppercase tracking-wider">Total Reports</div>
              </div>
              <div className="h-6 w-[1px] bg-[#EEF1F5]" />
              <div className="text-center">
                <div className="text-lg font-black text-[#EF4444]">
                  {issues.filter((i) => i.status === "pending").length}
                </div>
                <div className="text-[10px] text-[#64748B] font-medium uppercase tracking-wider">Pending</div>
              </div>
              <div className="h-6 w-[1px] bg-[#EEF1F5]" />
              <div className="text-center">
                <div className="text-lg font-black text-[#16A34A]">
                  {issues.filter((i) => i.status === "resolved").length}
                </div>
                <div className="text-[10px] text-[#64748B] font-medium uppercase tracking-wider">Resolved</div>
              </div>
            </div>
          </div>

          <p className="text-[#64748B] text-sm">
            Problems ranked by citizen confirmation count. Most pressing community hazards appear at the top of the queue for priority dispatch.
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white rounded-2xl border border-[#EEF1F5] mb-8 shadow-xs">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
            {(
              [
                { id: "all", label: "All Tickets" },
                { id: "pending", label: "Pending" },
                { id: "in_progress", label: "In Progress" },
                { id: "resolved", label: "Resolved" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                  statusFilter === tab.id
                    ? "bg-[#0F172A] text-white font-bold"
                    : "text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search category or road..."
              className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-1.5 text-xs text-[#0F172A] outline-none transition focus:border-[#86EFAC] focus:bg-white"
            />
          </div>
        </div>

        {loading && (
          <div className="text-center py-20 text-[#64748B] text-sm flex items-center justify-center gap-2">
            <span className="h-4 w-4 border-2 border-[#16A34A] border-t-transparent rounded-full animate-spin" />
            Loading municipal leaderboard...
          </div>
        )}

        {!loading && filteredIssues.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-[#EEF1F5] text-[#94A3B8] text-sm">
            No issues match the current filter.
          </div>
        )}

        <div className="space-y-4">
          {filteredIssues.map((issue, index) => (
            <IssueCard
              key={issue.id}
              issue={issue}
              rank={index + 1}
              busy={busyIssueId === issue.id}
              onUploadFixedPhoto={handleUploadFixedPhoto}
              onCloseTicket={handleCloseTicket}
            />
          ))}
        </div>
      </div>
    </main>
  );
}

function IssueCard({
  issue,
  rank,
  busy,
  onUploadFixedPhoto,
  onCloseTicket,
}: {
  issue: Issue;
  rank: number;
  busy: boolean;
  onUploadFixedPhoto: (issueId: string, file: File) => void;
  onCloseTicket: (issueId: string) => void;
}) {
  const isResolved = issue.status === "resolved";
  const isInProgress = issue.status === "in_progress";

  const locationText =
    issue.location_name ||
    (issue.latitude != null && issue.longitude != null
      ? `${issue.latitude.toFixed(5)}, ${issue.longitude.toFixed(5)}`
      : "Location coordinates unavailable");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUploadFixedPhoto(issue.id, file);
    }
  };

  return (
    <div
      className={
        "rounded-2xl border bg-white p-6 transition shadow-xs " +
        (isResolved
          ? "border-[#BBF7D0] bg-[#F0FDF4]/50"
          : isInProgress
          ? "border-[#BFDBFE] bg-[#EFF6FF]/40"
          : "border-[#EEF1F5]")
      }
    >
      <div className="flex flex-col md:flex-row gap-6">
        {/* Rank & Confirmations */}
        <div className="flex md:flex-col items-center md:items-start gap-2 shrink-0 md:w-20">
          <span className="text-2xl font-black text-[#0F172A]">#{rank}</span>
          <span className="text-xs font-bold text-[#16A34A] bg-[#ECFDF5] px-2.5 py-1 rounded-full border border-[#BBF7D0]/60 whitespace-nowrap">
            🔥 {issue.report_count ?? 1} confirms
          </span>
        </div>

        {/* Reported Photo */}
        <div className="shrink-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] mb-1.5">
            Citizen Photo
          </p>
          {issue.image_url ? (
            <img
              src={issue.image_url}
              alt="Reported issue"
              className="w-32 h-32 object-cover rounded-xl border border-[#E2E8F0] shadow-xs"
            />
          ) : (
            <div className="w-32 h-32 rounded-xl border border-dashed border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-center text-xs text-[#94A3B8]">
              No photo
            </div>
          )}
        </div>

        {/* Issue Details & Actions */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h3 className="font-extrabold text-[#0F172A] text-base">
              {issue.category || "Uncategorized"}
            </h3>
            {issue.severity && <SeverityBadge severity={issue.severity} />}
            {issue.status && <StatusBadge status={issue.status} />}
          </div>

          <p className="text-sm text-[#475569] leading-relaxed mb-3">
            {issue.description || "No description provided."}
          </p>

          <p className="text-xs text-[#64748B] mb-4 flex items-center gap-1.5">
            <span>📍</span>
            <span>{locationText}</span>
          </p>

          {/* Action buttons */}
          {!isResolved && (
            <div className="flex flex-wrap items-center gap-3">
              <label className="text-xs font-semibold bg-white border border-[#CBD5E1] hover:border-[#10B981] hover:text-[#10B981] text-[#0F172A] px-3.5 py-2 rounded-xl cursor-pointer transition shadow-xs">
                {issue.fixed_image_url ? "Replace Fixed Photo" : "📷 Upload Fixed Photo"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={busy}
                  onChange={handleFileChange}
                />
              </label>

              <button
                type="button"
                onClick={() => onCloseTicket(issue.id)}
                disabled={busy}
                className="text-xs font-bold bg-[#0F172A] hover:bg-[#1E293B] text-white px-4 py-2 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed shadow-xs cursor-pointer"
              >
                {busy ? "Updating..." : "✓ Close Ticket"}
              </button>
            </div>
          )}

          {/* Fixed photo display */}
          {issue.fixed_image_url && (
            <div className="mt-4 pt-3 border-t border-[#EEF1F5]">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#16A34A] mb-1.5">
                Official Resolution Photo
              </p>
              <img
                src={issue.fixed_image_url}
                alt="Fixed issue"
                className="w-32 h-32 object-cover rounded-xl border border-[#BBF7D0] shadow-xs"
              />
            </div>
          )}

          {isResolved && (
            <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#16A34A] bg-[#DCFCE7] px-3 py-1 rounded-lg">
              ✓ Ticket Resolved & Work Order Closed
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SeverityBadge({ severity }: { severity: Severity }) {
  const styles: Record<Severity, string> = {
    high: "bg-[#FEE2E2] text-[#B91C1C] border border-[#FECACA]",
    medium: "bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]",
    low: "bg-[#ECFDF5] text-[#16A34A] border border-[#BBF7D0]",
  };
  return (
    <span className={"text-[10px] font-bold uppercase px-2 py-0.5 rounded-full " + styles[severity]}>
      {severity}
    </span>
  );
}

function StatusBadge({ status }: { status: Status }) {
  const styles: Record<Status, string> = {
    pending: "bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]",
    in_progress: "bg-[#DBEAFE] text-[#1D4ED8] border border-[#BFDBFE]",
    resolved: "bg-[#DCFCE7] text-[#16A34A] border border-[#BBF7D0]",
  };
  const labels: Record<Status, string> = {
    pending: "Pending Triage",
    in_progress: "In Progress",
    resolved: "Resolved",
  };
  return (
    <span className={"text-[10px] font-bold uppercase px-2 py-0.5 rounded-full " + styles[status]}>
      {labels[status]}
    </span>
  );
}