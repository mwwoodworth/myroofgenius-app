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
    <div className="upload-card">
      <div className="icon" aria-hidden="true">📷</div>
      <h2>Upload Your Roof Photo</h2>
      <input type="file" id="roof-upload" onChange={handleUpload} />
      <div id="upload-status" aria-live="polite">{status}</div>
    </div>
  );
}
