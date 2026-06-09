import React from "react";

/**
 * Decorative grid+gradient backdrop. Pure SVG so it works without any
 * external image assets.
 */
export default function GridShape() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-1 h-full w-full opacity-40 dark:opacity-30"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern
          id="nova-grid"
          width="32"
          height="32"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 32 0 L 0 0 0 32"
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.12"
            strokeWidth="1"
          />
        </pattern>
        <radialGradient id="nova-glow" cx="50%" cy="0%" r="60%">
          <stop offset="0%" stopColor="rgba(70,95,255,0.35)" />
          <stop offset="100%" stopColor="rgba(70,95,255,0)" />
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#nova-grid)" />
      <rect width="100%" height="100%" fill="url(#nova-glow)" />
    </svg>
  );
}
