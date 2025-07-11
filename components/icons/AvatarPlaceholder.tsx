import React from "react";

export default function AvatarPlaceholder(
  props: React.SVGProps<SVGSVGElement>,
) {
  return (
    <svg
      viewBox="0 0 40 40"
      width="40"
      height="40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <circle cx="20" cy="20" r="20" fill="#e5e7eb" />
      <circle cx="20" cy="15" r="6" fill="#9ca3af" />
      <path d="M10 32c2-6 18-6 20 0" fill="#9ca3af" />
    </svg>
  );
}
