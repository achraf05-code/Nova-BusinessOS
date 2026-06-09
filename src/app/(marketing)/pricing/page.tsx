import type { Metadata } from "next";
import Pricing from "@/components/marketing/Pricing";
import Faq from "@/components/marketing/Faq";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple per-company pricing for Nova BusinessOS. Start free, upgrade when your team grows.",
};

export default function PricingPage() {
  return (
    <>
      <section className="border-b border-gray-200 bg-white py-20 dark:border-gray-800 dark:bg-gray-950">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
            Pricing built for operators.
          </h1>
          <p className="mt-5 text-base text-gray-600 dark:text-gray-300">
            One price per company. No per-seat surprises. Cancel anytime.
          </p>
        </div>
      </section>
      <Pricing />
      <Faq />
    </>
  );
}
