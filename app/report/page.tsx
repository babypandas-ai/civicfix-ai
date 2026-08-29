"use client";
import { useState } from "react";

export default function ReportIssue() {
  const [photo, setPhoto] = useState<string | null>(null);
  const [location, setLocation] = useState("Fetching location...");

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPhoto(URL.createObjectURL(file));
  };

  const getLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`),
      () => setLocation("Location unavailable")
    );
  };

  return (
    <main style={{ padding: "24px", maxWidth: "400px", margin: "0 auto" }}>
      <h2>Report Civic Issue</h2>

      <input type="file" accept="image/*" capture="environment" onChange={handlePhotoChange} />
      {photo && <img src={photo} alt="preview" style={{ width: "100%", marginTop: "12px" }} />}

      <div style={{ marginTop: "16px" }}>
        <button onClick={getLocation}>📍 Get Location</button>
        <p>{location}</p>
      </div>

      <div style={{ marginTop: "16px" }}>
        <p><strong>AI Detection:</strong> Pothole (placeholder)</p>
        <p><strong>Severity:</strong> 🔴 High (placeholder)</p>
      </div>

      <textarea placeholder="Description" style={{ width: "100%", marginTop: "12px" }} />

      <button style={{ marginTop: "16px", width: "100%" }}>Submit Report</button>
    </main>
  );
}