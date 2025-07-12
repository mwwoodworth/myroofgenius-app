"use client";
import { CloudOff, RefreshCcw } from "lucide-react";

interface OfflineIndicatorProps {
  online: boolean;
  syncing: boolean;
}

export default function OfflineIndicator({
  online,
  syncing,
}: OfflineIndicatorProps) {
  return (
    <div
      className="fixed top-4 right-4 flex items-center gap-2 text-sm z-50"
      aria-live="polite"
    >
      {!online ? (
        <>
          <CloudOff className="w-5 h-5 text-danger" aria-hidden="true" />
          <span className="text-danger">Offline</span>
        </>
      ) : syncing ? (
        <>
          <RefreshCcw className="w-5 h-5 animate-spin" aria-hidden="true" />
          <span>Syncing...</span>
        </>
      ) : (
        <span className="text-accent-emerald">Online</span>
      )}
    </div>
  );
}
