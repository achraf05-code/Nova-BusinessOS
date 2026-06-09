import Link from "next/link";
import GridShape from "@/components/common/GridShape";
import { nova } from "@/config/nova";
import NovaLogo from "@/components/brand/NovaLogo";

export default function NotFound() {
  return (
    <div className="relative z-1 flex min-h-screen flex-col items-center justify-center overflow-hidden bg-white p-6 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <GridShape />
      <div className="z-10 mx-auto flex w-full max-w-lg flex-col items-center text-center">
        <NovaLogo />
        <h1 className="mt-10 font-bold text-gray-800 dark:text-white/90 text-title-md xl:text-title-2xl">
          404
        </h1>
        <p className="mt-4 text-base text-gray-700 dark:text-gray-400 sm:text-lg">
          We couldn&apos;t find the page you were looking for.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 shadow-theme-xs transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.03]"
        >
          Back to {nova.name}
        </Link>
      </div>
      <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs text-gray-500">
        © {new Date().getFullYear()} {nova.name}
      </p>
    </div>
  );
}
