import type { Metadata } from "next";
import FeatureGrid from "@/components/marketing/FeatureGrid";
import AiCfoSpotlight from "@/components/marketing/AiCfoSpotlight";
import Cta from "@/components/marketing/Cta";

export const metadata: Metadata = {
  title: "Features",
  description:
    "CRM, projects, invoicing, expenses, accounting and an AI CFO — every Nova BusinessOS module in one place.",
};

export default function FeaturesPage() {
  return (
    <>
      <section className="border-b border-gray-200 bg-white py-20 dark:border-gray-800 dark:bg-gray-950">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
            Everything an operator needs.
          </h1>
          <p className="mt-5 text-base text-gray-600 dark:text-gray-300">
            Nova ships every business module out of the box. They share a
            single source of truth — so your data, your team and your AI CFO
            are always aligned.
          </p>
        </div>
      </section>
      <FeatureGrid />
      <AiCfoSpotlight />
      <Cta />
    </>
  );
}
