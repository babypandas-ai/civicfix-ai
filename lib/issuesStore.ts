import { supabase } from "./supabaseClient";

export type Severity = "low" | "medium" | "high";
export type Status = "pending" | "in_progress" | "resolved";

export type Issue = {
  id: string;
  category: string;
  description: string;
  image_url: string;
  latitude: number;
  longitude: number;
  severity: Severity;
  report_count: number;
  status: Status;
  fixed_image_url?: string | null;
  created_at?: string;
  location_name?: string;
  merged_count?: number;
};

const STORAGE_KEY = "civicfix_issues_v1";

/**
 * Calculates distance between two geographic coordinates in meters using Haversine formula.
 */
export function getDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) *
    Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Groups nearby issues (distance <= 100m) of the same category (or <= 25m regardless)
 * into a single consolidated complaint, aggregating their total confirmation count (`report_count`).
 */
export function groupNearbyIssues(issues: Issue[]): Issue[] {
  if (!issues || issues.length <= 1) return issues || [];

  const grouped: Issue[] = [];
  const visited = new Set<string>();

  for (let i = 0; i < issues.length; i++) {
    const current = issues[i];
    if (visited.has(current.id)) continue;
    visited.add(current.id);

    let totalCount = current.report_count ?? 1;
    let mergedCount = 1;

    for (let j = i + 1; j < issues.length; j++) {
      const other = issues[j];
      if (visited.has(other.id)) continue;

      if (
        current.latitude != null &&
        current.longitude != null &&
        other.latitude != null &&
        other.longitude != null
      ) {
        const dist = getDistanceMeters(
          current.latitude,
          current.longitude,
          other.latitude,
          other.longitude
        );

        // Group if within 100 meters and same category, or within 25 meters
        if (dist <= 100 && (current.category === other.category || dist <= 25)) {
          visited.add(other.id);
          totalCount += other.report_count ?? 1;
          mergedCount += 1;
        }
      }
    }

    grouped.push({
      ...current,
      report_count: totalCount,
      merged_count: mergedCount,
    });
  }

  // Sort by report_count descending (highest reported issues at the top of leaderboard)
  return grouped.sort((a, b) => (b.report_count ?? 0) - (a.report_count ?? 0));
}

export const SAMPLE_BANGALORE_ISSUES = [
  {
    category: "Pothole & Road Hazard",
    description: "Deep 18cm crater across active traffic lane causing vehicle damage and two-wheeler skid hazards.",
    image_url: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80",
    latitude: 12.971598,
    longitude: 77.594566,
    severity: "high" as Severity,
    report_count: 24,
    status: "pending" as Status,
  },
  {
    category: "Water Supply & Leakage",
    description: "High-pressure mainline pipe burst leaking hundreds of liters of potable water onto pedestrian walkway.",
    image_url: "https://images.unsplash.com/photo-1541888946425-d0fbb1861593?auto=format&fit=crop&w=600&q=80",
    latitude: 12.978369,
    longitude: 77.640835,
    severity: "high" as Severity,
    report_count: 19,
    status: "in_progress" as Status,
  },
  {
    category: "Electrical & Streetlights",
    description: "Entire 200m stretch of sodium vapor streetlights dark since two days, compromising safety.",
    image_url: "https://images.unsplash.com/photo-1508873696983-2df57046475a?auto=format&fit=crop&w=600&q=80",
    latitude: 12.935211,
    longitude: 77.624512,
    severity: "medium" as Severity,
    report_count: 13,
    status: "pending" as Status,
  },
  {
    category: "Sanitation & Garbage",
    description: "Overflowing municipal dumpster spilling onto sidewalk, attracting stray animals and blocking pathway.",
    image_url: "https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=600&q=80",
    latitude: 12.981542,
    longitude: 77.608031,
    severity: "medium" as Severity,
    report_count: 9,
    status: "resolved" as Status,
  },
  {
    category: "Drainage & Sewage",
    description: "Blocked storm water drain causing foul water backflow and road overflow during evening showers.",
    image_url: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=600&q=80",
    latitude: 12.962045,
    longitude: 77.598014,
    severity: "high" as Severity,
    report_count: 16,
    status: "pending" as Status,
  },
  {
    category: "Footpath & Sidewalk",
    description: "Broken paver slabs and exposed rebar creating tripping hazards for elderly pedestrians.",
    image_url: "https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=600&q=80",
    latitude: 12.973412,
    longitude: 77.607421,
    severity: "low" as Severity,
    report_count: 5,
    status: "pending" as Status,
  },
];

function getStoredLocalIssues(): Issue[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn("Could not read local issues store:", e);
  }
  return [];
}

function saveStoredLocalIssues(issues: Issue[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(issues));
  } catch (e) {
    console.warn("Could not write to local issues store:", e);
  }
}

/**
 * Fetch all issues from Supabase.
 * If Supabase is connected, the Supabase database is the absolute source of truth.
 * If the user deletes rows in Supabase, this returns [] as expected.
 */
export async function getIssues(): Promise<{ issues: Issue[]; isFallback: boolean }> {
  try {
    const supabasePromise = supabase
      .from("issues")
      .select("*")
      .order("report_count", { ascending: false });

    const timeoutPromise = new Promise<{ data: null; error: Error }>((_, reject) =>
      setTimeout(() => reject(new Error("Supabase timeout")), 4000)
    );

    const { data, error } = (await Promise.race([supabasePromise, timeoutPromise])) as any;

    // Supabase connected successfully! Return exact Supabase rows (even if empty)
    if (!error && Array.isArray(data)) {
      saveStoredLocalIssues(data);
      return { issues: data, isFallback: false };
    }
    if (error) {
      console.warn("Supabase fetch returned error:", error);
    }
  } catch (err) {
    console.warn("Supabase unreachable, using local offline fallback:", err);
  }

  // Only fall back to local storage if Supabase failed to respond
  const localIssues = getStoredLocalIssues();
  return { issues: localIssues, isFallback: true };
}

/**
 * Add a new issue into Supabase table and Supabase storage bucket `issue-images`.
 * If an issue already exists nearby (within 100m) with the same category, groups it
 * and increments `report_count` instead of creating duplicate clutter.
 */
export async function addIssue(issueData: {
  category: string;
  description: string;
  imageFile?: File | null;
  image_url?: string;
  latitude: number;
  longitude: number;
  severity: Severity;
  status?: Status;
  report_count?: number;
}): Promise<Issue> {
  let finalImageUrl = issueData.image_url || "";

  // 1. Upload image to Supabase Storage bucket 'issue-images' if a File was provided
  if (issueData.imageFile) {
    try {
      const fileExt = issueData.imageFile.name.split(".").pop() || "jpg";
      const cleanFileName = `issue-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;

      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from("issue-images")
        .upload(cleanFileName, issueData.imageFile, {
          contentType: issueData.imageFile.type,
          upsert: false,
        });

      if (!uploadErr && uploadData) {
        const { data: urlData } = supabase.storage
          .from("issue-images")
          .getPublicUrl(cleanFileName);
        finalImageUrl = urlData.publicUrl;
        console.log("Uploaded image to Supabase Storage:", finalImageUrl);
      } else if (uploadErr) {
        console.error("Supabase Storage upload error:", uploadErr);
      }
    } catch (storageErr) {
      console.error("Storage upload exception:", storageErr);
    }
  }

  // 2. Check for nearby active issues (within 100 meters) to group complaints
  try {
    const { data: existingIssues } = await supabase
      .from("issues")
      .select("*")
      .neq("status", "resolved");

    if (Array.isArray(existingIssues) && existingIssues.length > 0) {
      for (const item of existingIssues) {
        if (item.latitude != null && item.longitude != null) {
          const dist = getDistanceMeters(
            issueData.latitude,
            issueData.longitude,
            Number(item.latitude),
            Number(item.longitude)
          );

          // If within 100m and same category, or within 25m: MERGE!
          if (dist <= 100 && (item.category === issueData.category || dist <= 25)) {
            console.log(`Nearby issue detected (${dist.toFixed(1)}m away). Merging with issue ID: ${item.id}`);

            const newReportCount = (item.report_count ?? 1) + 1;
            const { data: updatedRows, error: updateErr } = await supabase
              .from("issues")
              .update({ report_count: newReportCount })
              .eq("id", item.id)
              .select();

            if (!updateErr && updatedRows && updatedRows.length > 0) {
              const mergedIssue = updatedRows[0] as Issue;
              // Update local cache
              const current = getStoredLocalIssues();
              saveStoredLocalIssues(current.map((i) => (i.id === item.id ? mergedIssue : i)));
              return mergedIssue;
            }
          }
        }
      }
    }
  } catch (mergeErr) {
    console.warn("Could not check nearby issues for merge:", mergeErr);
  }

  // 3. No nearby duplicate found: insert new issue into Supabase
  const supabasePayload: Record<string, any> = {
    image_url: finalImageUrl || null,
    latitude: issueData.latitude,
    longitude: issueData.longitude,
    category: issueData.category || "Other",
    severity: issueData.severity || "low",
    description: issueData.description || "",
    status: issueData.status || "pending",
    report_count: issueData.report_count ?? 1,
  };

  let createdIssue: Issue = {
    id: `local-${Date.now()}`,
    image_url: finalImageUrl || "",
    latitude: issueData.latitude,
    longitude: issueData.longitude,
    category: issueData.category || "Other",
    severity: issueData.severity || "low",
    description: issueData.description || "",
    status: issueData.status || "pending",
    report_count: issueData.report_count ?? 1,
    created_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase
      .from("issues")
      .insert(supabasePayload)
      .select();

    if (!error && data && data.length > 0) {
      createdIssue = data[0] as Issue;
      console.log("Successfully inserted issue into Supabase table:", createdIssue);
    } else if (error) {
      console.error("Supabase table insert error:", error);
    }
  } catch (dbErr) {
    console.error("Supabase table insert exception:", dbErr);
  }

  // Update local cache
  const current = getStoredLocalIssues();
  const next = [createdIssue, ...current.filter((i) => i.id !== createdIssue.id)];
  saveStoredLocalIssues(next);

  return createdIssue;
}

/**
 * Update an existing issue in Supabase (e.g. status or report_count).
 */
export async function updateIssue(id: string, updates: Partial<Issue>): Promise<Issue | null> {
  const supabaseUpdates: Record<string, any> = {};
  if (updates.status) supabaseUpdates.status = updates.status;
  if (updates.category) supabaseUpdates.category = updates.category;
  if (updates.severity) supabaseUpdates.severity = updates.severity;
  if (updates.description) supabaseUpdates.description = updates.description;
  if (updates.report_count != null) supabaseUpdates.report_count = updates.report_count;
  if (updates.image_url) supabaseUpdates.image_url = updates.image_url;

  try {
    const { data, error } = await supabase
      .from("issues")
      .update(supabaseUpdates)
      .eq("id", id)
      .select();

    if (!error && data && data.length > 0) {
      console.log("Updated issue in Supabase:", data[0]);
    } else if (error) {
      console.error("Supabase update error:", error);
    }
  } catch (err) {
    console.error("Supabase update exception:", err);
  }

  // Update local store
  const current = getStoredLocalIssues();
  let updatedItem: Issue | null = null;
  const next = current.map((item) => {
    if (item.id === id) {
      updatedItem = { ...item, ...updates };
      return updatedItem;
    }
    return item;
  });
  saveStoredLocalIssues(next);

  return updatedItem;
}

/**
 * Seed sample Bangalore civic issues directly into the user's Supabase 'issues' table.
 */
export async function seedIssuesToSupabase(): Promise<Issue[]> {
  try {
    const { data, error } = await supabase
      .from("issues")
      .insert(SAMPLE_BANGALORE_ISSUES)
      .select();

    if (!error && data) {
      console.log("Seeded sample issues to Supabase:", data.length);
      saveStoredLocalIssues(data);
      return data as Issue[];
    } else if (error) {
      console.error("Error seeding issues to Supabase:", error);
    }
  } catch (err) {
    console.error("Exception seeding issues to Supabase:", err);
  }
  return [];
}

/**
 * Clear local storage cache.
 */
export function clearLocalCache() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
}
