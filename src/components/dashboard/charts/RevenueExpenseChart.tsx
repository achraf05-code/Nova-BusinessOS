"use client";
import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";
import React from "react";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface Props {
  data: { label: string; revenue: number; expenses: number }[];
}

export default function RevenueExpenseChart({ data }: Props) {
  const options: ApexOptions = {
    colors: ["#465fff", "#fb6514"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 320,
      type: "area",
      toolbar: { show: false },
    },
    stroke: { curve: "smooth", width: 2 },
    fill: {
      type: "gradient",
      gradient: { opacityFrom: 0.45, opacityTo: 0 },
    },
    grid: {
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: data.map((d) => d.label),
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: { style: { fontSize: "12px", colors: ["#6B7280"] } },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Outfit",
    },
    tooltip: { y: { formatter: (v) => `$${v.toLocaleString()}` } },
  };

  const series = [
    { name: "Revenue", data: data.map((d) => d.revenue) },
    { name: "Expenses", data: data.map((d) => d.expenses) },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
            Revenue vs expenses
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Last 6 months — auto-reconciled from invoices and expenses.
          </p>
        </div>
      </div>
      <div className="mt-4 max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[640px]">
          <ReactApexChart
            options={options}
            series={series}
            type="area"
            height={320}
          />
        </div>
      </div>
    </div>
  );
}
