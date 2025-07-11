import React from "react";

export default function Star(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path d="M10 1.5l2.45 6.09 6.55.47-5 4.19 1.55 6.35L10 15.27l-5.55 3.33L6 12.25l-5-4.19 6.55-.47L10 1.5z" />
    </svg>
  );
}
