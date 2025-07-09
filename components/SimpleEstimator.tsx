"use client";
import { useState } from "react";
import ResultCard from "./ResultCard";
import Button from "./ui/Button";

export default function SimpleEstimator() {
  const [size, setSize] = useState("");
  const [material, setMaterial] = useState("asphalt");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult("");

    const res = await fetch("/api/estimator", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ size, material, location }),
    });

    const reader = res.body?.getReader();
    const decoder = new TextDecoder();
    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setResult((prev) => prev + decoder.decode(value));
      }
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md w-full space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 text-sm font-medium">Roof Size (sq ft)</label>
          <input
            type="number"
            required
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className="field-input w-full rounded-md border-gray-300"
          />
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium">Material</label>
          <select
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
            className="field-input w-full rounded-md border-gray-300"
          >
            <option value="asphalt">Asphalt Shingle</option>
            <option value="metal">Metal</option>
            <option value="tile">Tile</option>
          </select>
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium">Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="field-input w-full rounded-md border-gray-300"
            placeholder="City, State"
          />
        </div>
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Estimating..." : "Estimate"}
        </Button>
      </form>
      {result && <ResultCard result={result} />}
    </div>
  );
}
