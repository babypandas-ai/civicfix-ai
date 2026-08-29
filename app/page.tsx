"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gradient-to-br from-white-50 via-white to-white-100 flex items-center justify-center px-6">
      <div className="w-full max-w-4xl text-center">

        {/* Logo / Brand */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white-00 text-white text-3xl shadow-lg mb-5">
            🏙️
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 tracking-tight">
            Civic<span className="text-blue-600">Fix</span>
          </h1>

          <p className="mt-4 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Report civic issues in your area and help make your community
            cleaner, safer, and better.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">

          <button
            onClick={() => router.push("/report")}
            className="group px-8 py-4 rounded-xl bg-blue-600 text-white font-semibold text-lg shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all duration-200 hover:-translate-y-1"
          >
            <span className="mr-2">📸</span>
            Report Issue
            <span className="ml-2 opacity-70 group-hover:translate-x-1 transition">
              →
            </span>
          </button>

          <button
            onClick={() => router.push("/issues")}
            className="group px-8 py-4 rounded-xl bg-white text-gray-800 font-semibold text-lg border border-gray-200 shadow-md hover:shadow-xl hover:border-blue-300 transition-all duration-200 hover:-translate-y-1"
          >
            <span className="mr-2">🗺️</span>
            View Issues
            <span className="ml-2 text-gray-400 group-hover:translate-x-1 transition">
              →
            </span>
          </button>

        </div>

        {/* Small feature section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16">

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-white shadow-sm">
            <div className="text-2xl mb-2">📍</div>
            <h3 className="font-semibold text-gray-800">
              Location Based
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Report issues exactly where they happen.
            </p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-white shadow-sm">
 
            <div className="text-2xl mb-2">🤖</div>
            <h3 className="font-semibold text-gray-800">
              AI Powered
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Automatically classify reported issues.
            </p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-white shadow-sm">
            <div className="text-2xl mb-2">🤝</div>
            <h3 className="font-semibold text-gray-800">
              Community Driven
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Track issues and improve your neighborhood.
            </p>
          </div>

        </div>

        {/* Footer */}
        <p className="mt-12 text-sm text-gray-400">
          Together, we can fix our city.
        </p>

      </div>
    </main>
  );
} 