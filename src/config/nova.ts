/**
 * Centralized brand + product configuration for MaBusinessOS.
 */

export const nova = {
  name: "MaBusinessOS",
  shortName: "MaBusiness",
  tagline: "AI-Powered Business Operating System",
  description:
    "Manage your CRM, projects, invoices, expenses, accounting and AI CFO " +
    "insights from a single, unified workspace.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "https://mabusinessos.com",
  contact: {
    email: "hello@mabusinessos.com",
    sales: "sales@mabusinessos.com",
    support: "support@mabusinessos.com",
  },
  social: {
    twitter: "https://twitter.com/mabusinessos",
    linkedin: "https://linkedin.com/company/mabusinessos",
    github: "https://github.com/mabusinessos",
  },
} as const;

export const marketingNav = [
  { name: "Home", href: "/" },
  { name: "Features", href: "/features" },
  { name: "Pricing", href: "/pricing" },
  { name: "About", href: "/about" },
  { name: "Blog", href: "/blog" },
  { name: "Contact", href: "/contact" },
] as const;

export const footerLinks = {
  product: [
    { name: "Features", href: "/features" },
    { name: "Pricing", href: "/pricing" },
    { name: "Roadmap", href: "/#roadmap" },
    { name: "Changelog", href: "/blog" },
  ],
  company: [
    { name: "About", href: "/about" },
    { name: "Blog", href: "/blog" },
    { name: "Contact", href: "/contact" },
  ],
  legal: [
    { name: "Privacy", href: "/privacy" },
    { name: "Terms", href: "/terms" },
  ],
} as const;

export const pricingTiers = [
  {
    name: "Starter",
    price: 0,
    period: "free forever",
    description: "Solo founders launching their first venture.",
    cta: "Start free",
    href: "/register",
    highlight: false,
    features: [
      "1 company workspace",
      "Up to 3 team members",
      "CRM with 100 contacts",
      "Basic project management",
      "10 invoices / month",
    ],
  },
  {
    name: "Growth",
    price: 49,
    period: "per company / month",
    description: "Scaling teams that need real automation.",
    cta: "Start 14-day trial",
    href: "/register?plan=growth",
    highlight: true,
    features: [
      "Up to 25 team members",
      "Unlimited contacts and deals",
      "Unlimited projects + Kanban",
      "Unlimited invoices + PDF",
      "AI CFO weekly reports",
      "Email + chat support",
    ],
  },
  {
    name: "Business",
    price: 149,
    period: "per company / month",
    description: "Multi-entity teams with deep finance needs.",
    cta: "Talk to sales",
    href: "/contact",
    highlight: false,
    features: [
      "Multiple companies per user",
      "Advanced RBAC + audit log",
      "AI CFO real-time insights",
      "Custom report builder",
      "Priority SLA support",
      "SSO + SCIM (coming soon)",
    ],
  },
] as const;

export const moduleHighlights = [
  {
    title: "AI CFO",
    badge: "Flagship",
    description:
      "An always-on financial brain that watches revenue, expenses and " +
      "growth — surfacing recommendations the moment numbers move.",
    icon: "spark",
  },
  {
    title: "CRM",
    description:
      "Pipeline, contacts, deals and activities — opinionated for B2B teams " +
      "who want to win more revenue with less tooling.",
    icon: "users",
  },
  {
    title: "Projects",
    description:
      "Kanban-first project management with priorities, deadlines, and " +
      "team-wide visibility tied to revenue.",
    icon: "kanban",
  },
  {
    title: "Invoicing",
    description:
      "Quotes, invoices and payments with PDF export, tax support and brand " +
      "controls — paid faster, with zero spreadsheets.",
    icon: "doc",
  },
  {
    title: "Accounting",
    description:
      "Revenue, expenses, profit and cash flow — automatically reconciled " +
      "against invoices and expense receipts.",
    icon: "chart",
  },
  {
    title: "Expenses",
    description:
      "Capture receipts, categorize spend (Marketing, Software, Travel…) " +
      "and feed it straight into your P&L.",
    icon: "wallet",
  },
] as const;

export const faqs = [
  {
    q: "What is MaBusinessOS?",
    a:
      "MaBusinessOS is an AI-powered operating system for businesses. It " +
      "unifies CRM, projects, invoicing, expenses, accounting and an AI CFO " +
      "assistant in a single multi-tenant workspace.",
  },
  {
    q: "Is MaBusinessOS multi-tenant?",
    a:
      "Yes. Every user can own one or many companies, and every record is " +
      "isolated by company_id with strict Postgres Row Level Security.",
  },
  {
    q: "How does the AI CFO work?",
    a:
      "MaBusinessOS analyzes your revenue, expenses, clients and projects, then " +
      "generates recommendations, insights and forecasts. Reports are " +
      "stored historically so you can review trends over time.",
  },
  {
    q: "Can I migrate from QuickBooks or HubSpot?",
    a:
      "CSV import and a public API are on the roadmap. For now you can use " +
      "the activity log + invoice/expense modules as a clean starting point.",
  },
  {
    q: "Where is my data stored?",
    a:
      "MaBusinessOS runs on Supabase (Postgres, Auth, Storage). You retain full " +
      "ownership and can export anytime as CSV, Excel or PDF.",
  },
] as const;
