"use client";
import { useState } from "react";

export default function PhotoAnalyzerPage() {
  const [status, setStatus] = useState("");

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setStatus("Uploading...");
    try {
      const resp = await fetch("/api/analyze", {
        method: "POST",
        body: e.target.files[0],
      });
      const data = await resp.json();
      setStatus(data.success ? "Analysis complete!" : `Error: ${data.error}`);
    } catch {
      setStatus("Upload failed.");
    }
  };

  return (
    <div className="upload-card" aria-labelledby="upload-label">
      <div className="icon" aria-hidden="true">
        📷
      </div>
      <h2 id="upload-label" className="text-xl font-semibold mb-2">
        Upload Your Roof Photo
      </h2>
      <label htmlFor="roof-upload" className="sr-only">
        Choose image
      </label>
      <input
        type="file"
        id="roof-upload"
        accept="image/*"
        onChange={handleUpload}
        className="mt-2 w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer focus:ring-2 focus:ring-offset-2 focus:ring-accent-emerald"
        aria-describedby="upload-desc"
      />
      <p id="upload-desc" className="text-sm text-gray-500 mt-2">
        Drag and drop or select a roof image (JPG/PNG)
      </p>
      <div id="upload-status" aria-live="polite" className="mt-2">
        {status}
      </div>
    </div>
  );
}
