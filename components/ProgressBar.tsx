"use client";
import clsx from "clsx";

interface ProgressBarProps {
  value: number; // 0-100
  className?: string;
}

export default function ProgressBar({ value, className }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div
      className={clsx("w-full h-2 bg-gray-200 rounded", className)}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full bg-accent-emerald rounded transition-[width]"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
