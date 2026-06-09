import React from "react";

interface Props {
  collapsed?: boolean;
  className?: string;
  showWordmark?: boolean;
}

/**
 * Nova BusinessOS wordmark + glyph. Pure SVG so it inherits text color
 * (works in both light and dark mode without any image assets).
 */
const NovaLogo: React.FC<Props> = ({
  collapsed = false,
  className = "",
  showWordmark = true,
}) => {
  const Glyph = (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="shrink-0"
    >
      <defs>
        <linearGradient id="nova-grad" x1="0" y1="0" x2="32" y2="32">
          <stop offset="0%" stopColor="#465fff" />
          <stop offset="100%" stopColor="#7a5af8" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(#nova-grad)" />
      <path
        d="M9 22V10h2.4l8.2 8.4V10H22v12h-2.4l-8.2-8.4V22H9z"
        fill="white"
      />
    </svg>
  );

  if (collapsed || !showWordmark) {
    return <span className={className}>{Glyph}</span>;
  }

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      {Glyph}
      <span className="flex flex-col leading-tight">
        <span className="text-[15px] font-semibold tracking-tight">
          Nova BusinessOS
        </span>
        <span className="text-[10px] uppercase tracking-[0.16em] text-gray-400 dark:text-gray-500">
          AI Business OS
        </span>
      </span>
    </span>
  );
};

export default NovaLogo;
