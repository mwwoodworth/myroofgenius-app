"use client";

import { useRef } from "react";

export default function GalaxyCanvas() {
  // Animation temporarily disabled for SSR issues
  const canvasRef = useRef<HTMLCanvasElement>(null);
  return (
    <div
      ref={canvasRef as any}
      className="absolute inset-0 w-full h-full"
      style={{ zIndex: -1 }}
    />
  );
}
