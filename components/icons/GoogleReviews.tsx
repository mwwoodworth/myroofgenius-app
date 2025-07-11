import React from "react";

export default function GoogleReviews(props: React.SVGProps<SVGSVGElement>) {
  const star = (
    <polygon points="9.9,1.1 12.3,6.8 18.5,7.1 13.8,10.9 15.3,17 9.9,13.8 4.5,17 6,10.9 1.3,7.1 7.5,6.8" />
  );
  return (
    <svg
      width="100"
      height="32"
      viewBox="0 0 100 32"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Google Reviews"
      {...props}
    >
      <rect width="100" height="32" rx="4" fill="#fff" stroke="#e5e7eb" />
      <g fill="#fbbc04" transform="translate(10 6) scale(0.8)">
        {Array.from({ length: 5 }).map((_, i) => (
          <g key={i} transform={`translate(${i * 20},0)`}>
            {star}
          </g>
        ))}
      </g>
    </svg>
  );
}
