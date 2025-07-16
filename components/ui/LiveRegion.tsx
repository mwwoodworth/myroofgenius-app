"use client";

import { useEffect, useRef } from "react";

interface LiveRegionProps {
  children: React.ReactNode;
  politeness?: "polite" | "assertive" | "off";
  atomic?: boolean;
  relevant?: "additions" | "removals" | "text" | "all" | "additions text";
  className?: string;
}

/**
 * Accessible live region component for announcing dynamic content updates to screen readers
 * @param children - Content to be announced
 * @param politeness - How urgently to announce changes (default: "polite")
 * @param atomic - Whether to announce the entire region or just changes (default: true)
 * @param relevant - What types of changes to announce (default: "additions text")
 * @param className - Optional CSS classes
 */
export function LiveRegion({
  children,
  politeness = "polite",
  atomic = true,
  relevant = "additions text",
  className = "",
}: LiveRegionProps) {
  const regionRef = useRef<HTMLDivElement>(null);

  // Ensure the live region is properly announced when content changes
  useEffect(() => {
    if (regionRef.current && children) {
      // Force screen readers to re-announce by briefly clearing content
      const content = regionRef.current.innerHTML;
      regionRef.current.innerHTML = "";
      setTimeout(() => {
        if (regionRef.current) {
          regionRef.current.innerHTML = content;
        }
      }, 100);
    }
  }, [children]);

  return (
    <div
      ref={regionRef}
      aria-live={politeness}
      aria-atomic={atomic}
      aria-relevant={relevant}
      className={`sr-only ${className}`}
      role={politeness === "assertive" ? "alert" : "status"}
    >
      {children}
    </div>
  );
}

/**
 * Hook for managing live region announcements
 */
export function useLiveAnnouncement() {
  const announcementRef = useRef<string>("");

  const announce = (message: string, politeness: "polite" | "assertive" = "polite") => {
    announcementRef.current = message;
    
    // Create temporary live region
    const liveRegion = document.createElement("div");
    liveRegion.setAttribute("aria-live", politeness);
    liveRegion.setAttribute("aria-atomic", "true");
    liveRegion.setAttribute("role", politeness === "assertive" ? "alert" : "status");
    liveRegion.className = "sr-only";
    
    document.body.appendChild(liveRegion);
    
    // Announce after a brief delay to ensure screen readers pick it up
    setTimeout(() => {
      liveRegion.textContent = message;
      
      // Remove after announcement
      setTimeout(() => {
        document.body.removeChild(liveRegion);
      }, 1000);
    }, 100);
  };

  return { announce };
}