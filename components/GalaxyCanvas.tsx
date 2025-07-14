"use client";

import { useRef } from "react";

export default function GalaxyCanvas() {
  // Animation temporarily disabled for SSR issues
  const canvasRef = useRef<HTMLDivElement | null>(null);
  return (
    <div
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ zIndex: -1 }}
    />
  );
}
