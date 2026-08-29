"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

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

        setLocation(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
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
      const fileName = `${Date.now()}-${image.name}`;
      const { error: uploadError } = await supabase.storage
        .from("issue-photos")
        .upload(fileName, image);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("issue-photos")
        .getPublicUrl(fileName);

      const imageUrl = urlData.publicUrl;

      const [latitude, longitude] = location.split(",").map((s) => parseFloat(s.trim()));

      const response = await fetch(
        "https://oobrhmbjwuscwbrixikh.supabase.co/functions/v1/Submit-issue",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            image_url: imageUrl,
            latitude,
            longitude,
            description,
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
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 px-5 py-10">
      <div className="mx-auto max-w-3xl">

        {/* Header */}
        <div className="mb-8">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="mb-6 text-gray-500 transition hover:text-blue-600"
          >
            ← Back
          </button>

          <h1 className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            Report an Issue
          </h1>

          <p className="mt-3 text-gray-600">
            Help improve your community by reporting a civic issue.
          </p>
        </div>

        {/* Form */}
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl md:p-8">
          <form onSubmit={handleSubmit} className="space-y-8">

            {/* Image Upload */}
            <div>
              <label className="mb-3 block text-lg font-semibold text-gray-900">
                📸 Upload Image
              </label>

              <label className="flex h-52 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50 transition hover:border-blue-400 hover:bg-blue-100">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <>
                    <div className="mb-3 text-5xl">📷</div>
                    <p className="font-semibold text-gray-700">
                      Click to upload an image
                    </p>
                    <p className="mt-1 text-sm text-gray-400">
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
            </div>

            {/* Location */}
            <div>
              <label className="mb-3 block text-lg font-semibold text-gray-900">
                📍 Location
              </label>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="flex flex-1 items-center rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-600">
                  {location || "Location not detected"}
                </div>

                <button
                  type="button"
                  onClick={getLocation}
                  disabled={loadingLocation}
                  className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loadingLocation ? "Detecting..." : "📍 Fetch Location"}
                </button>
              </div>

              <p className="mt-2 text-sm text-gray-400">
                Your location helps identify where the issue is located.
              </p>
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="mb-3 block text-lg font-semibold text-gray-900"
              >
                📝 Describe the Issue
              </label>

              <textarea
                id="description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                required
                rows={6}
                placeholder="Example: There is a large pothole near the main road..."
                className="w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />

              <p className="mt-2 text-sm text-gray-400">
                Provide as much detail as possible.
              </p>
            </div>

            {/* AI Information */}
            <div className="flex gap-4 rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
              <div className="text-2xl">🤖</div>

              <div>
                <h3 className="font-semibold text-indigo-900">
                  AI will analyze your report
                </h3>
                <p className="mt-1 text-sm text-indigo-700">
                  CivicFix will automatically classify the issue and
                  identify possible duplicate reports.
                </p>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-2xl bg-blue-600 py-4 text-lg font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "🚀 Submit Issue Report"}
            </button>

          </form>
        </div>

        <p className="mt-8 text-center text-sm text-gray-400">
          Together, we can make our communities better.
        </p>

      </div>
    </main>
  );
}