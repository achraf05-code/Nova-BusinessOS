import type { Metadata } from "next";
import { nova } from "@/config/nova";

export const metadata: Metadata = {
  title: "About",
  description:
    "Nova BusinessOS is the AI-powered operating system for modern businesses. Read about our mission, team and values.",
};

export default function AboutPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
        About {nova.name}
      </h1>
      <p className="mt-6 text-lg text-gray-600 dark:text-gray-300">
        Modern teams shouldn&apos;t need 12 SaaS tools to run a business.{" "}
        {nova.name}{" "}
        unifies CRM, projects, invoicing, expenses, accounting and an
        always-on AI CFO into a single, multi-tenant workspace.
      </p>

      <h2 className="mt-12 text-2xl font-semibold text-gray-900 dark:text-white">
        Our mission
      </h2>
      <p className="mt-3 text-gray-600 dark:text-gray-300">
        Give every founder and operator the operational leverage of a
        well-funded company — minus the integration tax.
      </p>

      <h2 className="mt-10 text-2xl font-semibold text-gray-900 dark:text-white">
        How we build
      </h2>
      <ul className="mt-3 space-y-2 text-gray-600 dark:text-gray-300">
        <li>• Every record is multi-tenant by default. Your data stays yours.</li>
        <li>• AI is a first-class surface, not a chatbot bolted on the side.</li>
        <li>• Speed and clarity over feature creep — we ship what teams actually use.</li>
        <li>• Open standards: SQL you can read, exports you can take with you.</li>
      </ul>

      <h2 className="mt-10 text-2xl font-semibold text-gray-900 dark:text-white">
        Get in touch
      </h2>
      <p className="mt-3 text-gray-600 dark:text-gray-300">
        Press, partnerships or just to say hi —{" "}
        <a
          className="text-brand-500 hover:text-brand-600"
          href={`mailto:${nova.contact.email}`}
        >
          {nova.contact.email}
        </a>
        .
      </p>
    </article>
  );
}
