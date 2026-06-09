import type { Metadata } from "next";
import ContactForm from "@/components/marketing/ContactForm";
import { nova } from "@/config/nova";

export const metadata: Metadata = {
  title: "Contact",
  description: "Talk to the Nova BusinessOS team — sales, support or partnerships.",
};

export default function ContactPage() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="grid gap-12 lg:grid-cols-2">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
            Get in touch
          </h1>
          <p className="mt-5 text-base text-gray-600 dark:text-gray-300">
            We typically reply within one business day. For urgent issues,
            email support directly — we&apos;ll route you to the right human.
          </p>
          <dl className="mt-10 space-y-4 text-sm">
            <div>
              <dt className="font-semibold text-gray-900 dark:text-white">
                Sales
              </dt>
              <dd>
                <a
                  href={`mailto:${nova.contact.sales}`}
                  className="text-brand-500 hover:text-brand-600"
                >
                  {nova.contact.sales}
                </a>
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-gray-900 dark:text-white">
                Support
              </dt>
              <dd>
                <a
                  href={`mailto:${nova.contact.support}`}
                  className="text-brand-500 hover:text-brand-600"
                >
                  {nova.contact.support}
                </a>
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-gray-900 dark:text-white">
                General
              </dt>
              <dd>
                <a
                  href={`mailto:${nova.contact.email}`}
                  className="text-brand-500 hover:text-brand-600"
                >
                  {nova.contact.email}
                </a>
              </dd>
            </div>
          </dl>
        </div>
        <ContactForm />
      </div>
    </section>
  );
}
