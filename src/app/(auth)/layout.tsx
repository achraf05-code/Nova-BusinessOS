import GridShape from "@/components/common/GridShape";
import ThemeTogglerTwo from "@/components/common/ThemeTogglerTwo";
import NovaLogo from "@/components/brand/NovaLogo";
import Link from "next/link";
import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative bg-white z-1 dark:bg-gray-900">
      <div className="relative flex min-h-screen w-full flex-col-reverse lg:flex-row">
        {/* form pane */}
        <div className="flex w-full flex-col px-6 py-10 sm:px-10 lg:w-1/2 lg:px-16">
          <div className="mb-10 lg:mb-0">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ← Back to nova-businessos.com
            </Link>
          </div>
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-md">{children}</div>
          </div>
        </div>

        {/* brand pane */}
        <div className="relative hidden w-1/2 items-center justify-center bg-brand-950 dark:bg-white/5 lg:flex">
          <GridShape />
          <div className="relative z-10 flex flex-col items-center px-10 text-center text-white">
            <NovaLogo className="text-white" />
            <h2 className="mt-10 max-w-xs text-2xl font-semibold leading-snug">
              The AI-powered operating system for your business.
            </h2>
            <p className="mt-4 max-w-xs text-sm text-white/70">
              CRM, projects, invoicing, expenses, accounting and AI CFO —
              unified for modern teams.
            </p>
          </div>
        </div>
      </div>
      <div className="fixed bottom-6 right-6 z-50 hidden sm:block">
        <ThemeTogglerTwo />
      </div>
    </div>
  );
}
