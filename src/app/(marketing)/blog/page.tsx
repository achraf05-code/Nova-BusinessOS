import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Product updates, operator playbooks and AI CFO insights from the Nova BusinessOS team.",
};

const posts = [
  {
    slug: "introducing-ai-cfo",
    title: "Introducing the AI CFO",
    excerpt:
      "How Nova's AI CFO turns raw revenue and expense data into the kind of recommendations a real CFO would write.",
    date: "May 12, 2026",
    readTime: "5 min read",
  },
  {
    slug: "multi-tenant-supabase-rls",
    title: "Multi-tenant SaaS, the Supabase way",
    excerpt:
      "A walkthrough of how we use Postgres Row Level Security to give every Nova workspace strict, automatic data isolation.",
    date: "April 28, 2026",
    readTime: "8 min read",
  },
  {
    slug: "from-quickbooks-to-nova",
    title: "From QuickBooks + HubSpot to a single OS",
    excerpt:
      "Why teams are consolidating CRM, accounting and project management into Nova — and what they didn't expect.",
    date: "April 03, 2026",
    readTime: "6 min read",
  },
];

export default function BlogPage() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
        From the Nova team
      </h1>
      <p className="mt-4 text-base text-gray-600 dark:text-gray-300">
        Product updates, operator playbooks and AI CFO insights.
      </p>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((p) => (
          <article
            key={p.slug}
            className="flex flex-col rounded-2xl border border-gray-200 bg-white p-6 transition hover:border-brand-300 hover:shadow-theme-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-brand-500/40"
          >
            <span className="text-xs uppercase tracking-wider text-gray-500">
              {p.date} · {p.readTime}
            </span>
            <h2 className="mt-3 text-lg font-semibold text-gray-900 dark:text-white">
              {p.title}
            </h2>
            <p className="mt-2 grow text-sm text-gray-600 dark:text-gray-300">
              {p.excerpt}
            </p>
            <Link
              href={`/blog/${p.slug}`}
              className="mt-5 text-sm font-semibold text-brand-500 hover:text-brand-600"
            >
              Read post →
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
