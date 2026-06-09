import Link from "next/link";
import React from "react";
import NovaLogo from "@/components/brand/NovaLogo";
import { footerLinks, nova } from "@/config/nova";

export default function MarketingFooter() {
  return (
    <footer className="border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <NovaLogo className="text-gray-900 dark:text-white" />
            <p className="mt-4 max-w-md text-sm text-gray-600 dark:text-gray-400">
              {nova.description}
            </p>
            <p className="mt-4 text-xs text-gray-500 dark:text-gray-500">
              {nova.contact.email}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
              Product
            </h4>
            <ul className="mt-4 space-y-3 text-sm">
              {footerLinks.product.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-gray-600 transition hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  >
                    {l.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
              Company
            </h4>
            <ul className="mt-4 space-y-3 text-sm">
              {footerLinks.company.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-gray-600 transition hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  >
                    {l.name}
                  </Link>
                </li>
              ))}
              {footerLinks.legal.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-gray-600 transition hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  >
                    {l.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-gray-200 pt-6 text-xs text-gray-500 dark:border-gray-800 dark:text-gray-500 sm:flex-row sm:items-center">
          <p>
            © {new Date().getFullYear()} {nova.name}. All rights reserved.
          </p>
          <p>{nova.tagline}</p>
        </div>
      </div>
    </footer>
  );
}
