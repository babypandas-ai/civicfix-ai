"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Inter } from "next/font/google";
import { supabase } from "../../lib/supabaseClient";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-body",
});

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.split(",")[1];
      resolve(base64Data);
    };
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
  const [submitting, setSubmitting] = useState(false);

  const getLocation = () => {
    if (!navigator.geolocation) {
      alert("Location is not supported by your browser.");
      return;
    }

    setLoadingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        setLocation(latitude.toFixed(6) + ", " + longitude.toFixed(6));
        setLoadingLocation(false);
      },
      () => {
        alert("Please allow location access.");
        setLoadingLocation(false);
      }
    );
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

    if (!image) {
      alert("Please upload a photo of the issue.");
      return;
    }

    if (!location) {
      alert("Please fetch your location before submitting.");
      return;
    }

    setSubmitting(true);

    try {
      const fileName = Date.now() + "-" + image.name;
      const { error: uploadError } = await supabase.storage
        .from("issue-images")
        .upload(fileName, image);

      if (uploadError) throw uploadError;

      const imageBase64 = await fileToBase64(image);

      const parts = location.split(",").map((s) => parseFloat(s.trim()));
      const latitude = parts[0];
      const longitude = parts[1];

      const response = await fetch(
        "https://oobrhmbjwuscwbrixikh.supabase.co/functions/v1/Submit-issue",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
            Authorization: "Bearer " + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            image: imageBase64,
            latitude: latitude,
            longitude: longitude,
            description: description,
          }),
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText);
      }

      const result = await response.json();
      console.log("Submitted:", result);

      // Pass through whatever real fields the backend actually returned.
      // Field names here (category/severity/location/status) are best
      // guesses matching the original project spec — confirm the real
      // response shape with your backend teammate and adjust if needed.
      const params = new URLSearchParams();
      if (result.category) params.set("category", result.category);
      if (result.severity) params.set("severity", result.severity);
      if (result.location) {
        params.set("location", result.location);
      } else if (latitude && longitude) {
        params.set("location", latitude.toFixed(5) + ", " + longitude.toFixed(5));
      }
      if (result.status) params.set("status", result.status);

      router.push("/success?" + params.toString());
    } catch (err) {
      console.error(err);
      alert("Something went wrong submitting your report. Check the console for details.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main
      className={inter.variable + " min-h-screen bg-white text-[#0F172A]"}
      style={{ fontFamily: "var(--font-body)" }}
    >
      <header className="border-b border-[#EEF1F5]">
        <div className="mx-auto max-w-3xl px-6 py-5 flex items-center justify-between">
          <Link href="/" className="text-lg font-extrabold tracking-tight">
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

      <div className="mx-auto max-w-2xl px-6 py-14">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold tracking-tight mb-3">
            Report an <span className="text-[#22C55E]">Issue</span>
          </h1>
          <p className="text-[#64748B]">
            Upload a photo, share your location, and describe the problem.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <FormBlock stepNumber={1} label="Upload Photo">
            <label className="flex h-52 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-[#E2E8F0] bg-[#F8FAFC] transition hover:border-[#86EFAC] hover:bg-[#F0FDF4]">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <>
                  <div className="w-12 h-12 rounded-xl bg-[#ECFDF5] flex items-center justify-center text-2xl mb-3">
                    📷
                  </div>
                  <p className="font-semibold text-[#0F172A] text-sm">
                    Click to upload a photo
                  </p>
                  <p className="mt-1 text-xs text-[#94A3B8]">
                    JPG, PNG or WEBP
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

          <FormBlock stepNumber={2} label="Location">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex flex-1 items-center rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm text-[#475569]">
                {location || "Location not detected"}
              </div>

              <button
                type="button"
                onClick={getLocation}
                disabled={loadingLocation}
                className="rounded-xl bg-[#0F172A] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1E293B] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loadingLocation ? "Detecting..." : "📍 Fetch Location"}
              </button>
            </div>
          </FormBlock>

          <FormBlock stepNumber={3} label="Description">
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              required
              rows={5}
              placeholder="Describe the problem briefly..."
              className="w-full resize-none rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-4 text-sm text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-[#86EFAC] focus:bg-white"
            />
          </FormBlock>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-2xl bg-[#22C55E] py-4 text-base font-bold text-white transition hover:bg-[#16A34A] disabled:cursor-not-allowed disabled:opacity-60 shadow-sm"
          >
            {submitting ? "Submitting..." : "Submit Report"}
          </button>
        </form>
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
      <div className="flex items-center gap-2.5 mb-3">
        <span className="w-6 h-6 rounded-full bg-[#ECFDF5] text-[#16A34A] text-xs font-bold flex items-center justify-center">
          {stepNumber}
        </span>
        <label className="text-sm font-bold text-[#0F172A]">{label}</label>
      </div>
      {children}
    </div>
  );
}