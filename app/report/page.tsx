"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Inter } from "next/font/google";
import { addIssue } from "../../lib/issuesStore";

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

export default function ReportPage() {
  const router = useRouter();
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [locationNote, setLocationNote] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchLocation = async () => {
    setLoadingLocation(true);
    setLocationNote(null);

    // Try browser geolocation with 6-second timeout
    if (navigator?.geolocation) {
      const getGpsPosition = () =>
        new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: false,
            timeout: 6000,
            maximumAge: 60000,
          });
        });

      try {
        const position = await getGpsPosition();
        const lat = position.coords.latitude.toFixed(6);
        const lng = position.coords.longitude.toFixed(6);
        setLocation(`${lat}, ${lng}`);
        setLocationNote("Accurate GPS location locked.");
        setLoadingLocation(false);
        return;
      } catch (gpsError) {
        console.warn("Browser GPS unavailable, trying IP lookup...", gpsError);
      }
    }

    // IP Geolocation fallback
    try {
      const ipRes = await fetch("https://ipapi.co/json/", { cache: "no-store" });
      if (ipRes.ok) {
        const ipData = await ipRes.json();
        if (ipData.latitude && ipData.longitude) {
          const lat = Number(ipData.latitude).toFixed(6);
          const lng = Number(ipData.longitude).toFixed(6);
          setLocation(`${lat}, ${lng}`);
          setLocationNote(`Approximated from IP (${ipData.city || "Network"}).`);
          setLoadingLocation(false);
          return;
        }
      }
    } catch (ipError) {
      console.warn("IP geolocation unavailable, falling back to municipal center.", ipError);
    }

    // City Center Default Fallback
    setLocation("12.971600, 77.594600");
    setLocationNote("Set to Bangalore Central Metro Grid (default). You can edit coordinates manually.");
    setLoadingLocation(false);
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!image && !imagePreview) {
      alert("Please upload a photo of the civic issue.");
      return;
    }

    if (!location.trim()) {
      alert("Please enter or fetch a location coordinate before submitting.");
      return;
    }

    setSubmitting(true);

    try {
      let imageDataUrl = imagePreview || "";
      if (image) {
        try {
          imageDataUrl = await fileToDataUrl(image);
        } catch {
          // fallback to object URL
        }
      }

      // Parse coordinates
      const parts = location.split(",").map((s) => parseFloat(s.trim()));
      const latitude = !isNaN(parts[0]) ? parts[0] : 12.9716;
      const longitude = !isNaN(parts[1]) ? parts[1] : 77.5946;

      // Call our API endpoint for AI classification and storage
      let aiResult: any = null;
      try {
        const response = await fetch("/api/submit-issue", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image: imageDataUrl,
            latitude,
            longitude,
            description,
          }),
        });

        if (response.ok) {
          aiResult = await response.json();
        }
      } catch (apiErr) {
        console.warn("API route failed, falling back to local store:", apiErr);
      }

      const category = aiResult?.category || "General Municipal Defect";
      const severity = aiResult?.severity || "medium";
      const status = "pending";

      // Persist directly into Supabase Storage & Supabase issues table
      const created = await addIssue({
        category,
        description,
        imageFile: image,
        image_url: imageDataUrl,
        latitude,
        longitude,
        severity,
        status,
      });

      const params = new URLSearchParams();
      params.set("category", category);
      params.set("severity", severity);
      params.set("location", `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
      params.set("status", status);

      router.push("/success?" + params.toString());
    } catch (err: any) {
      console.error("Submission failed:", err);
      alert("Something went wrong while submitting. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main
      className={inter.variable + " min-h-screen bg-[#FAFBFC] text-[#0F172A]"}
      style={{ fontFamily: "var(--font-body)" }}
    >
      <header className="border-b border-[#EEF1F5] bg-white">
        <div className="mx-auto max-w-3xl px-6 py-5 flex items-center justify-between">
          <Link href="/" className="text-xl font-extrabold tracking-tight">
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

      <div className="mx-auto max-w-2xl px-6 py-12">
        <div className="text-center mb-10">
          <span className="inline-block text-xs font-semibold tracking-wide text-[#16A34A] bg-[#ECFDF5] border border-[#BBF7D0] rounded-full px-3 py-1 mb-4">
            Citizen Telemetry
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">
            Report a Civic <span className="text-[#22C55E]">Problem</span>
          </h1>
          <p className="text-[#64748B]">
            Upload a photo, capture the GPS coordinates, and let our neural triage engine classify and route the issue.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-[#EEF1F5] p-6 sm:p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-7">
            {/* Step 1: Image Upload */}
            <FormBlock stepNumber={1} label="Upload Defect Photo">
              <label className="flex h-52 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-[#E2E8F0] bg-[#F8FAFC] transition hover:border-[#86EFAC] hover:bg-[#F0FDF4] relative group">
                {imagePreview ? (
                  <>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition text-white text-xs font-bold">
                      Click to replace photo
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-xl bg-[#ECFDF5] flex items-center justify-center text-2xl mb-3 shadow-xs">
                      📷
                    </div>
                    <p className="font-semibold text-[#0F172A] text-sm">
                      Click to upload photo or take picture
                    </p>
                    <p className="mt-1 text-xs text-[#94A3B8]">
                      JPG, PNG or WEBP (road hazard, pipe leak, etc.)
                    </p>
                  </>
                )}

                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
            </FormBlock>

            {/* Step 2: Location */}
            <FormBlock stepNumber={2} label="Incident Coordinates">
              <div className="space-y-2">
                <div className="flex flex-col gap-2.5 sm:flex-row">
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. 12.971600, 77.594600"
                    required
                    className="flex-1 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm text-[#0F172A] font-mono outline-none transition focus:border-[#86EFAC] focus:bg-white"
                  />

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={fetchLocation}
                      disabled={loadingLocation}
                      className="rounded-xl bg-[#0F172A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1E293B] disabled:cursor-not-allowed disabled:opacity-60 flex items-center gap-2 shrink-0 cursor-pointer"
                    >
                      {loadingLocation ? (
                        <>
                          <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Detecting...</span>
                        </>
                      ) : (
                        <>
                          <span>📍</span>
                          <span>Fetch Location</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setLocation("12.971600, 77.594600");
                        setLocationNote("Bangalore Central selected.");
                      }}
                      className="rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] px-3.5 py-3 text-xs font-semibold text-[#475569] transition cursor-pointer shrink-0"
                      title="Set to Bangalore Center"
                    >
                      Bangalore Center
                    </button>
                  </div>
                </div>

                {locationNote && (
                  <p className="text-xs text-[#16A34A] flex items-center gap-1.5 font-medium">
                    ✓ {locationNote}
                  </p>
                )}
              </div>
            </FormBlock>

            {/* Step 3: Description */}
            <FormBlock stepNumber={3} label="Describe Problem">
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                required
                rows={4}
                placeholder="Describe what's wrong (e.g. Deep pothole causing skids, high-pressure water pipe burst, dark streetlights...)"
                className="w-full resize-none rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3.5 text-sm text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-[#86EFAC] focus:bg-white"
              />
            </FormBlock>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-2xl bg-[#22C55E] hover:bg-[#16A34A] py-4 text-base font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-60 shadow-sm cursor-pointer"
            >
              {submitting ? "Analyzing & Submitting..." : "Submit Civic Report"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

function FormBlock({
  stepNumber,
  label,
  children,
}: {
  stepNumber: number;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2.5 mb-2.5">
        <span className="w-6 h-6 rounded-full bg-[#ECFDF5] text-[#16A34A] text-xs font-bold flex items-center justify-center">
          {stepNumber}
        </span>
        <label className="text-sm font-bold text-[#0F172A]">{label}</label>
      </div>
      {children}
    </div>
  );
}