"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Inter } from "next/font/google";
import { supabase } from "../../lib/supabaseClient";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-body",
});

type Severity = "low" | "medium" | "high";
type Status = "pending" | "in_progress" | "resolved";

type IssueRow = {
  id: string;
  category: string | null;
  description: string | null;
  image_url: string | null;
  latitude: number | null;
  longitude: number | null;
  severity: Severity | null;
  report_count: number | null;
  status: Status | null;
  fixed_image_url: string | null;
  created_at?: string | null;
};

export default function AuthoritiesPage() {
  const [issues, setIssues] = useState<IssueRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busyIssueId, setBusyIssueId] = useState<string | null>(null);

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    setLoading(true);
    setLoadError(null);

    // NOTE: adjust "issues" and column names below if your real
    // Supabase schema differs from what's assumed here.
    const { data, error } = await supabase
      .from("issues")
      .select("*")
      .order("report_count", { ascending: false });

    if (error) {
      console.error(error);
      setLoadError(error.message);
      setIssues([]);
    } else {
      setIssues((data as IssueRow[]) || []);
    }

    setLoading(false);
  };

  const handleUploadFixedPhoto = async (issueId: string, file: File) => {
    setBusyIssueId(issueId);

    try {
      const fileName = "fixed-" + Date.now() + "-" + file.name;
      const { error: uploadError } = await supabase.storage
        .from("fixed-photos")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("fixed-photos")
        .getPublicUrl(fileName);

      const fixedImageUrl = urlData.publicUrl;

      const { error: updateError } = await supabase
        .from("issues")
        .update({ fixed_image_url: fixedImageUrl, status: "in_progress" })
        .eq("id", issueId);

      if (updateError) throw updateError;

      setIssues((prev) =>
        prev.map((issue) =>
          issue.id === issueId
            ? { ...issue, fixed_image_url: fixedImageUrl, status: "in_progress" }
            : issue
        )
      );
    } catch (err) {
      console.error(err);
      alert("Could not upload the fixed photo. Check the console for details.");
    } finally {
      setBusyIssueId(null);
    }
  };

  const handleCloseTicket = async (issueId: string) => {
    setBusyIssueId(issueId);

    try {
      const { error } = await supabase
        .from("issues")
        .update({ status: "resolved" })
        .eq("id", issueId);

      if (error) throw error;

      setIssues((prev) =>
        prev.map((issue) =>
          issue.id === issueId ? { ...issue, status: "resolved" } : issue
        )
      );
    } catch (err) {
      console.error(err);
      alert("Could not close the ticket. Check the console for details.");
    } finally {
      setBusyIssueId(null);
    }
  };

  return (
    <main
      className={inter.variable + " min-h-screen bg-[#FAFBFC] text-[#0F172A]"}
      style={{ fontFamily: "var(--font-body)" }}
    >
      <header className="border-b border-[#EEF1F5] bg-white">
        <div className="mx-auto max-w-5xl px-6 py-5 flex items-center justify-between">
          <Link href="/" className="text-2xl font-extrabold tracking-tight">
            Civic<span className="text-[#22C55E]">Fix</span>
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-[#475569] hover:text-[#0F172A] transition"
          >
            ← Back to Home
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-14">
        <div className="mb-10">
          <span className="inline-block text-xs font-semibold tracking-wide text-[#16A34A] bg-[#ECFDF5] border border-[#BBF7D0] rounded-full px-3 py-1 mb-4">
            Authorities Only
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">
            Issue <span className="text-[#22C55E]">Leaderboard</span>
          </h1>
          <p className="text-[#64748B]">
            Ranked by how many citizens confirmed each issue. Most reported problems appear first.
          </p>
        </div>

        {loading && (
          <div className="text-center py-16 text-[#94A3B8] text-sm">
            Loading issues...
          </div>
        )}

        {loadError && (
          <div className="rounded-2xl border border-[#FECACA] bg-[#FEF2F2] p-5 text-sm text-[#B91C1C] mb-8">
            Could not load issues: {loadError}
            <br />
            <span className="text-xs text-[#DC2626]">
              Check that your Supabase table is named "issues" with the expected columns.
            </span>
          </div>
        )}

        {!loading && !loadError && issues.length === 0 && (
          <div className="text-center py-16 text-[#94A3B8] text-sm">
            No issues found yet.
          </div>
        )}

        <div className="space-y-5">
          {issues.map((issue, index) => (
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
  issue: IssueRow;
  rank: number;
  busy: boolean;
  onUploadFixedPhoto: (issueId: string, file: File) => void;
  onCloseTicket: (issueId: string) => void;
}) {
  const isResolved = issue.status === "resolved";
  const locationText =
    issue.latitude != null && issue.longitude != null
      ? issue.latitude.toFixed(5) + ", " + issue.longitude.toFixed(5)
      : "Location unavailable";

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUploadFixedPhoto(issue.id, file);
    }
  };

  return (
    <div
      className={
        "rounded-2xl border bg-white p-6 transition " +
        (isResolved ? "border-[#BBF7D0] bg-[#F0FDF4]" : "border-[#EEF1F5]")
      }
    >
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex md:flex-col items-center md:items-start gap-2 shrink-0 md:w-20">
          <span className="text-2xl font-extrabold text-[#0F172A]">#{rank}</span>
          <span className="text-xs font-semibold text-[#16A34A] bg-[#ECFDF5] px-2 py-1 rounded-full">
            {issue.report_count ?? 0} confirms
          </span>
        </div>

        <div className="shrink-0">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#94A3B8] mb-1.5">
            Reported photo
          </p>
          {issue.image_url ? (
            <img
              src={issue.image_url}
              alt="Reported issue"
              className="w-32 h-32 object-cover rounded-xl border border-[#E2E8F0]"
            />
          ) : (
            <div className="w-32 h-32 rounded-xl border border-dashed border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-center text-xs text-[#94A3B8]">
              No photo
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h3 className="font-bold text-[#0F172A]">
              {issue.category || "Uncategorized"}
            </h3>
            {issue.severity && <SeverityBadge severity={issue.severity} />}
            {issue.status && <StatusBadge status={issue.status} />}
          </div>

          <p className="text-sm text-[#64748B] leading-relaxed mb-2">
            {issue.description || "No description provided."}
          </p>

          <p className="text-xs text-[#94A3B8] mb-4">📍 {locationText}</p>

          {!isResolved && (
            <div className="flex flex-wrap items-center gap-3">
              <label className="text-xs font-semibold bg-white border border-[#E2E8F0] hover:border-[#86EFAC] text-[#0F172A] px-3.5 py-2 rounded-xl cursor-pointer transition">
                {issue.fixed_image_url ? "Replace Fixed Photo" : "Upload Fixed Photo"}
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
                className="text-xs font-bold bg-[#0F172A] hover:bg-[#1E293B] text-white px-4 py-2 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {busy ? "Working..." : "Close Ticket"}
              </button>
            </div>
          )}

          {issue.fixed_image_url && (
            <div className="mt-4">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#94A3B8] mb-1.5">
                Fixed photo
              </p>
              <img
                src={issue.fixed_image_url}
                alt="Fixed issue"
                className="w-32 h-32 object-cover rounded-xl border border-[#BBF7D0]"
              />
            </div>
          )}

          {isResolved && (
            <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#16A34A]">
              ✓ Ticket Closed
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SeverityBadge({ severity }: { severity: Severity }) {
  const styles: Record<Severity, string> = {
    high: "bg-[#FEE2E2] text-[#B91C1C]",
    medium: "bg-[#FEF3C7] text-[#B45309]",
    low: "bg-[#ECFDF5] text-[#16A34A]",
  };
  return (
    <span className={"text-[10px] font-bold uppercase px-2 py-0.5 rounded-full " + styles[severity]}>
      {severity}
    </span>
  );
}

function StatusBadge({ status }: { status: Status }) {
  const styles: Record<Status, string> = {
    pending: "bg-[#F1F5F9] text-[#475569]",
    in_progress: "bg-[#DBEAFE] text-[#1D4ED8]",
    resolved: "bg-[#ECFDF5] text-[#16A34A]",
  };
  const labels: Record<Status, string> = {
    pending: "Pending",
    in_progress: "In Progress",
    resolved: "Resolved",
  };
  return (
    <span className={"text-[10px] font-bold uppercase px-2 py-0.5 rounded-full " + styles[status]}>
      {labels[status]}
    </span>
  );
}