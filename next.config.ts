import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  // Tell Next which file is the workspace root. Avoids the "multiple lockfiles"
  // warning if Vercel detects a monorepo above the project root.
  outputFileTracingRoot: process.cwd(),

  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "ui-avatars.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
  },

  // Heavy server-only SDKs we don't want bundled into the Edge runtime
  // middleware or any RSC payload.
  serverExternalPackages: [
    "stripe",
    "resend",
    "@supabase/supabase-js",
    "@supabase/ssr",
  ],

  experimental: {
    // ApexCharts and FullCalendar bundle a lot of JS — let Next tree-shake.
    optimizePackageImports: [
      "apexcharts",
      "react-apexcharts",
      "@fullcalendar/core",
      "@fullcalendar/react",
      "@fullcalendar/daygrid",
      "@fullcalendar/timegrid",
      "@fullcalendar/list",
      "@fullcalendar/interaction",
      "swiper",
      "date-fns",
    ],
  },

  // Add a few baseline security headers across the app.
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },

  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
};

export default nextConfig;
