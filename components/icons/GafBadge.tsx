import React from "react";

export default function GafBadge(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="80"
      height="32"
      viewBox="0 0 80 32"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="GAF Master Elite"
      {...props}
    >
      <rect width="80" height="32" rx="4" fill="var(--color-danger)" />{/* replaced hex with danger token */}
      <text
        x="40"
        y="21"
        fontSize="14"
        textAnchor="middle"
        fontWeight="bold"
        fill="white"
      >
        GAF
      </text>
    </svg>
  );
}
