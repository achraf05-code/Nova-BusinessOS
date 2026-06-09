import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

import { SidebarProvider } from "@/context/SidebarContext";
import { ThemeProvider } from "@/context/ThemeContext";
import ToastProvider from "@/components/ui/toast/ToastProvider";
import { nova } from "@/config/nova";

const outfit = Outfit({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(nova.url),
  title: {
    default: `${nova.name} — ${nova.tagline}`,
    template: `%s · ${nova.name}`,
  },
  description: nova.description,
  applicationName: nova.name,
  keywords: [
    "AI CFO",
    "Business Operating System",
    "CRM",
    "Invoicing",
    "Expense management",
    "Project management",
    "Accounting",
    "SaaS",
  ],
  authors: [{ name: nova.name, url: nova.url }],
  creator: nova.name,
  publisher: nova.name,
  openGraph: {
    type: "website",
    url: nova.url,
    siteName: nova.name,
    title: `${nova.name} — ${nova.tagline}`,
    description: nova.description,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${nova.name} — ${nova.tagline}`,
    description: nova.description,
    creator: "@novabusinessos",
  },
  icons: {
    icon: [{ url: "/favicon.ico" }],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#101828" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <ThemeProvider>
          <SidebarProvider>
            <ToastProvider>{children}</ToastProvider>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
