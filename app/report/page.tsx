"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Fraunces, Inter } from "next/font/google";
import { supabase } from "../../lib/supabaseClient";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-display",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
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
      // 1. Keep a permanent copy in Supabase Storage (bucket: issue-images)
      const fileName = Date.now() + "-" + image.name;
      const { error: uploadError } = await supabase.storage
        .from("issue-images")
        .upload(fileName, image);

      if (uploadError) throw uploadError;

      // 2. Convert the same image to Base64 for the Submit-issue function,
      //    which expects the raw image data, not a Storage URL.
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

      router.push("/success");
    } catch (err) {
      console.error(err);
      alert("Something went wrong submitting your report. Check the console for details.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main
      className={fraunces.variable + " " + inter.variable + " min-h-screen bg-[#FBF6EC] text-[#2B2B26]"}
      style={{ fontFamily: "var(--font-body)" }}
    >
      <div className="mx-auto max-w-3xl px-6 py-16">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="mb-10 text-sm text-[#8A6D3B] hover:text-[#2B2B26] transition inline-flex items-center gap-1"
        >
          <span aria-hidden>←</span> Back
        </button>

        <p className="text-xs tracking-[0.25em] uppercase text-[#8A6D3B] mb-4 font-medium">
          Report an issue
        </p>
        <h1
          className="text-4xl md:text-5xl leading-[1.05] mb-4 text-[#2B2B26]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Tell us what needs fixing.
        </h1>
        <p className="text-[#5C5647] leading-relaxed max-w-lg mb-16">
          A photo and your location are all we need. Our AI handles the classification, you just point and shoot.
        </p>

        <section className="mb-20">
          <p className="text-sm text-[#8A6D3B] italic mb-8 border-l-2 border-[#E7DCC4] pl-4 max-w-md">
            A few examples of what our little inspectors keep running into around the neighborhood.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            <IssueCard animal={<Rabbit />} label="Pothole" sub="Rabbit knows a bad road" />
            <IssueCard animal={<Turtle />} label="Streetlight" sub="Turtle waits in the dark" />
            <IssueCard animal={<Pig />} label="Overflowing bin" sub="Pig's least favorite smell" />
            <IssueCard animal={<Crow />} label="Water leak" sub="Crow never says no to a free drink" />
          </div>
        </section>

        <div className="rounded-3xl border border-[#E7DCC4] bg-white/70 p-6 md:p-10">
          <form onSubmit={handleSubmit} className="space-y-10">
            <div>
              <label
                className="mb-3 block text-lg text-[#2B2B26]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Photo
              </label>

              <label className="flex h-52 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-[#D9CBA3] bg-[#F3ECDC] transition hover:border-[#C9A227]">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <>
                    <div className="mb-3 text-4xl">📷</div>
                    <p className="font-medium text-[#5C5647]">Click to upload a photo</p>
                    <p className="mt-1 text-sm text-[#8A6D3B]">JPG, PNG or WEBP</p>
                  </>
                )}

                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
            </div>

            <div>
              <label
                className="mb-3 block text-lg text-[#2B2B26]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Location
              </label>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="flex flex-1 items-center rounded-xl border border-[#E7DCC4] bg-[#F3ECDC] px-4 py-3 text-[#5C5647] text-sm">
                  {location || "Location not detected"}
                </div>

                <button
                  type="button"
                  onClick={getLocation}
                  disabled={loadingLocation}
                  className="rounded-xl bg-[#2B2B26] px-6 py-3 font-medium text-[#FBF6EC] transition hover:bg-[#3F3B30] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loadingLocation ? "Detecting..." : "Fetch location"}
                </button>
              </div>

              <p className="mt-2 text-sm text-[#8A6D3B]">Helps us pin the exact spot for officials.</p>
            </div>

            <div>
              <label
                htmlFor="description"
                className="mb-3 block text-lg text-[#2B2B26]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Description
              </label>

              <textarea
                id="description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                required
                rows={5}
                placeholder="There is a large pothole near the main road..."
                className="w-full resize-none rounded-2xl border border-[#E7DCC4] bg-[#F3ECDC] px-4 py-4 text-[#2B2B26] outline-none transition placeholder:text-[#A79B7A] focus:border-[#C9A227] focus:bg-white"
              />
            </div>

            <div className="flex gap-4 rounded-2xl border border-[#E7DCC4] bg-[#F3ECDC] p-4">
              <div className="text-xl">🤖</div>
              <div>
                <h3 className="font-medium text-[#2B2B26] text-sm">AI will analyze your report</h3>
                <p className="mt-1 text-sm text-[#5C5647] leading-relaxed">
                  CivicFix classifies the issue automatically and checks for nearby duplicates before creating a new report.
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-2xl bg-[#2B2B26] py-4 text-base font-medium text-[#FBF6EC] transition hover:bg-[#3F3B30] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Submit report"}
            </button>
          </form>
        </div>

        <p className="mt-10 text-center text-sm text-[#8A6D3B] italic">
          Together, we can make our communities better.
        </p>
      </div>
    </main>
  );
}

function IssueCard({
  animal,
  label,
  sub,
}: {
  animal: React.ReactNode;
  label: string;
  sub: string;
}) {
  return (
    <div className="rounded-2xl border border-[#E7DCC4] bg-white/60 p-4 flex flex-col items-center text-center hover:border-[#C9A227] transition">
      <div className="w-full h-24 flex items-center justify-center mb-3">{animal}</div>
      <p className="text-sm font-medium text-[#2B2B26]">{label}</p>
      <p className="text-xs text-[#8A6D3B] italic mt-1">{sub}</p>
    </div>
  );
}

function Rabbit() {
  return (
    <svg viewBox="0 0 100 70" className="w-full h-full">
      <ellipse cx="50" cy="58" rx="28" ry="7" fill="#D9CBA3" />
      <ellipse cx="50" cy="57" rx="20" ry="5" fill="#3F3B30" />
      <g>
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0 0; 0 -14; 0 0"
          dur="1s"
          repeatCount="indefinite"
        />
        <ellipse cx="50" cy="44" rx="10" ry="8" fill="#F3ECDC" stroke="#8A6D3B" strokeWidth="1" />
        <circle cx="50" cy="33" r="7" fill="#F3ECDC" stroke="#8A6D3B" strokeWidth="1" />
        <ellipse cx="46" cy="20" rx="2.3" ry="10" fill="#F3ECDC" stroke="#8A6D3B" strokeWidth="1" />
        <ellipse cx="54" cy="20" rx="2.3" ry="10" fill="#F3ECDC" stroke="#8A6D3B" strokeWidth="1" />
        <circle cx="47.5" cy="32" r="1" fill="#2B2B26" />
        <circle cx="52.5" cy="32" r="1" fill="#2B2B26" />
      </g>
    </svg>
  );
}

function Turtle() {
  return (
    <svg viewBox="0 0 100 70" className="w-full h-full">
      <rect x="70" y="15" width="3" height="45" fill="#8A6D3B" />
      <ellipse cx="71.5" cy="15" rx="8" ry="5" fill="#C9A227" opacity="0.9">
        <animate attributeName="opacity" values="0.5;1;0.5" dur="1.6s" repeatCount="indefinite" />
      </ellipse>
      <ellipse cx="71.5" cy="60" rx="6" ry="2" fill="#D9CBA3" />
      <g>
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0 0; 3 0; 0 0"
          dur="2.4s"
          repeatCount="indefinite"
        />
        <ellipse cx="35" cy="52" rx="14" ry="9" fill="#8A6D3B" />
        <ellipse cx="35" cy="52" rx="10" ry="6" fill="#A9C08A" />
        <circle cx="47" cy="46" r="6" fill="#A9C08A" stroke="#8A6D3B" strokeWidth="1" />
        <circle cx="49.5" cy="44" r="0.9" fill="#2B2B26" />
      </g>
    </svg>
  );
}

function Pig() {
  return (
    <svg viewBox="0 0 100 70" className="w-full h-full">
      <rect x="55" y="30" width="24" height="28" rx="2" fill="#D9CBA3" stroke="#8A6D3B" strokeWidth="1" />
      <rect x="52" y="26" width="30" height="5" rx="1.5" fill="#8A6D3B" />
      <path d="M58 28 Q62 15 68 26 Q72 14 76 27" fill="none" stroke="#5C5647" strokeWidth="1.5" />
      <g>
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0 0; 0 -3; 0 0"
          dur="0.9s"
          repeatCount="indefinite"
        />
        <ellipse cx="28" cy="48" rx="13" ry="10" fill="#F0C9C9" stroke="#B98787" strokeWidth="1" />
        <circle cx="16" cy="42" r="6" fill="#F0C9C9" stroke="#B98787" strokeWidth="1" />
        <ellipse cx="14" cy="43" rx="2.6" ry="2" fill="#B98787" />
        <circle cx="17" cy="39" r="0.8" fill="#2B2B26" />
      </g>
    </svg>
  );
}

function Crow() {
  return (
    <svg viewBox="0 0 100 70" className="w-full h-full">
      <rect x="55" y="10" width="4" height="14" fill="#8A6D3B" />
      <rect x="50" y="8" width="14" height="4" rx="1" fill="#8A6D3B" />
      <circle cx="57" cy="30" r="2" fill="#7FA8C9">
        <animate attributeName="cy" values="26;42;26" dur="1.4s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="1;1;0" dur="1.4s" repeatCount="indefinite" />
      </circle>
      <g>
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0 0; 0 -2; 0 0"
          dur="0.7s"
          repeatCount="indefinite"
        />
        <ellipse cx="40" cy="50" rx="11" ry="8" fill="#3F3B30" />
        <circle cx="30" cy="45" r="6" fill="#3F3B30" />
        <path d="M24 45 L18 44 L24 47 Z" fill="#C9A227" />
        <circle cx="28" cy="43" r="0.9" fill="#FBF6EC" />
      </g>
    </svg>
  );
}