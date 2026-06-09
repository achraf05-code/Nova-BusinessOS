"use client";
import React from "react";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import AppHeaderShell from "@/layout/AppHeaderShell";
import { useSidebar } from "@/context/SidebarContext";
import Footer from "@/components/footer/Footer";

interface CompanyOption {
  id: string;
  name: string;
}

interface Props {
  children: React.ReactNode;
  user: { name: string; email: string };
  company: CompanyOption;
  companies: CompanyOption[];
}

export default function DashboardShell({
  children,
  user,
  company,
  companies,
}: Props) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const mainMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[290px]"
    : "lg:ml-[90px]";

  return (
    <div className="min-h-screen xl:flex">
      <AppSidebar />
      <Backdrop />
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${mainMargin}`}
      >
        <AppHeaderShell user={user} company={company} companies={companies} />
        <div className="mx-auto w-full max-w-(--breakpoint-2xl) p-4 md:p-6">
          {children}
          <Footer />
        </div>
      </div>
    </div>
  );
}
