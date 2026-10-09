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
};

const STORAGE_KEY = "civicfix_issues_v1";

export const INITIAL_ISSUES: Issue[] = [
  {
    id: "CF-2026-001",
    category: "Pothole & Road Hazard",
    description: "Deep 18cm crater across active traffic lane causing vehicle damage and two-wheeler skid hazards.",
    image_url: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80",
    latitude: 12.971598,
    longitude: 77.594566,
    severity: "high",
    report_count: 24,
    status: "pending",
    fixed_image_url: null,
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    location_name: "MG Road, near Metro Pillar 128",
  },
  {
    id: "CF-2026-002",
    category: "Water Supply & Leakage",
    description: "High-pressure mainline pipe burst leaking hundreds of liters of potable water onto pedestrian walkway.",
    image_url: "https://images.unsplash.com/photo-1541888946425-d0fbb1861593?auto=format&fit=crop&w=600&q=80",
    latitude: 12.978369,
    longitude: 77.640835,
    severity: "high",
    report_count: 19,
    status: "in_progress",
    fixed_image_url: "https://images.unsplash.com/photo-1590496793929-36417d3117de?auto=format&fit=crop&w=600&q=80",
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    location_name: "5th Cross, 100ft Road, Indiranagar",
  },
  {
    id: "CF-2026-003",
    category: "Electrical & Streetlights",
    description: "Entire 200m stretch of sodium vapor streetlights dark since two days, compromising safety.",
    image_url: "https://images.unsplash.com/photo-1508873696983-2df57046475a?auto=format&fit=crop&w=600&q=80",
    latitude: 12.935211,
    longitude: 77.624512,
    severity: "medium",
    report_count: 13,
    status: "pending",
    fixed_image_url: null,
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    location_name: "Koramangala 4th Block, 80ft Road",
  },
  {
    id: "CF-2026-004",
    category: "Sanitation & Garbage",
    description: "Overflowing municipal dumpster spilling onto sidewalk, attracting stray animals and blocking pathway.",
    image_url: "https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=600&q=80",
    latitude: 12.981542,
    longitude: 77.608031,
    severity: "medium",
    report_count: 9,
    status: "resolved",
    fixed_image_url: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80",
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    location_name: "Commercial Street, Cross Junction",
  },
  {
    id: "CF-2026-005",
    category: "Drainage & Sewage",
    description: "Blocked storm water drain causing foul water backflow and road overflow during evening showers.",
    image_url: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=600&q=80",
    latitude: 12.962045,
    longitude: 77.598014,
    severity: "high",
    report_count: 16,
    status: "pending",
    fixed_image_url: null,
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
    location_name: "Richmond Road Flyover Approach",
  },
  {
    id: "CF-2026-006",
    category: "Footpath & Sidewalk",
    description: "Broken paver slabs and exposed rebar creating tripping hazards for elderly pedestrians.",
    image_url: "https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=600&q=80",
    latitude: 12.973412,
    longitude: 77.607421,
    severity: "low",
    report_count: 5,
    status: "pending",
    fixed_image_url: null,
    created_at: new Date(Date.now() - 3600000 * 30).toISOString(),
    location_name: "Brigade Road, opposite Rex Plaza",
  },
];

function getStoredLocalIssues(): Issue[] {
  if (typeof window === "undefined") return INITIAL_ISSUES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ISSUES));
      return INITIAL_ISSUES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (e) {
    console.warn("Could not read local issues store:", e);
  }
  return INITIAL_ISSUES;
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
 * Fetch all issues from Supabase if reachable, with seamless fallback to localStorage.
 */
export async function getIssues(): Promise<{ issues: Issue[]; isFallback: boolean }> {
  try {
    // Attempt query with 3s timeout to avoid hanging when remote host is unreachable
    const supabasePromise = supabase
      .from("issues")
      .select("*")
      .order("report_count", { ascending: false });

    const timeoutPromise = new Promise<{ data: null; error: Error }>((_, reject) =>
      setTimeout(() => reject(new Error("Supabase timeout")), 3000)
    );

    const { data, error } = (await Promise.race([supabasePromise, timeoutPromise])) as any;

    if (!error && Array.isArray(data) && data.length > 0) {
      // Merge any locally added issues that might not be synced to Supabase yet
      const local = getStoredLocalIssues();
      const existingIds = new Set(data.map((d: any) => d.id));
      const newlyAddedLocally = local.filter((item) => !existingIds.has(item.id));
      const merged = [...newlyAddedLocally, ...data];
      return { issues: merged, isFallback: false };
    }
  } catch (err) {
    // Graceful fallback on network/DNS failure
  }

  const localIssues = getStoredLocalIssues();
  return { issues: localIssues, isFallback: true };
}

/**
 * Add a new issue to the store (local store and Supabase if accessible).
 */
export async function addIssue(
  issueData: Omit<Issue, "id" | "created_at" | "report_count"> & {
    id?: string;
    report_count?: number;
    created_at?: string;
  }
): Promise<Issue> {
  const newIssue: Issue = {
    id: issueData.id || `CF-${Date.now().toString(36).toUpperCase()}`,
    category: issueData.category || "General Civic Issue",
    description: issueData.description || "",
    image_url: issueData.image_url || "",
    latitude: issueData.latitude,
    longitude: issueData.longitude,
    severity: issueData.severity || "medium",
    report_count: issueData.report_count ?? 1,
    status: issueData.status || "pending",
    fixed_image_url: issueData.fixed_image_url || null,
    created_at: issueData.created_at || new Date().toISOString(),
    location_name: issueData.location_name || `${issueData.latitude.toFixed(5)}, ${issueData.longitude.toFixed(5)}`,
  };

  // Save locally first for guaranteed immediate availability
  const current = getStoredLocalIssues();
  const updated = [newIssue, ...current];
  saveStoredLocalIssues(updated);

  // Attempt async sync to Supabase in background
  try {
    await supabase.from("issues").insert([newIssue]);
  } catch (err) {
    console.info("Supabase sync skipped, stored locally.", err);
  }

  return newIssue;
}

/**
 * Update an existing issue (e.g. status or fixed_image_url).
 */
export async function updateIssue(id: string, updates: Partial<Issue>): Promise<Issue | null> {
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

  // Attempt sync to Supabase in background
  try {
    await supabase.from("issues").update(updates).eq("id", id);
  } catch (err) {
    console.info("Supabase update skipped, updated locally.", err);
  }

  return updatedItem;
}

/**
 * Reset local storage back to default seed data.
 */
export function resetSeed(): Issue[] {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ISSUES));
  }
  return INITIAL_ISSUES;
}
