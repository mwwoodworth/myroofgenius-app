"use client";
import ProgressBar from "./ProgressBar";

interface ConfidenceScoreProps {
  label: string;
  score: number; // 0-1
}

export default function ConfidenceScore({
  label,
  score,
}: ConfidenceScoreProps) {
  const pct = Math.round(score * 100);
  return (
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        <span>{pct}%</span>
      </div>
      <ProgressBar value={pct} />
    </div>
  );
}
