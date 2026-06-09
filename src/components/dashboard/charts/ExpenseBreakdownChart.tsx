"use client";
import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";
import React from "react";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface Props {
  data: { label: string; value: number }[];
}

export default function ExpenseBreakdownChart({ data }: Props) {
  const options: ApexOptions = {
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "donut",
    },
    labels: data.map((d) => d.label),
    colors: [
      "#465fff",
      "#fb6514",
      "#7a5af8",
      "#12b76a",
      "#0ba5ec",
      "#f04438",
      "#a8a29e",
    ],
    legend: {
      position: "bottom",
      fontFamily: "Outfit",
    },
    dataLabels: { enabled: false },
    plotOptions: {
      pie: {
        donut: {
          size: "65%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total",
              formatter: () =>
                `$${data.reduce((s, d) => s + d.value, 0).toLocaleString()}`,
            },
          },
        },
      },
    },
    tooltip: { y: { formatter: (v) => `$${v.toLocaleString()}` } },
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
        Spend by category
      </h3>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Where your money is going this month.
      </p>
      <div className="mt-4">
        <ReactApexChart
          options={options}
          series={data.map((d) => d.value)}
          type="donut"
          height={320}
        />
      </div>
    </div>
  );
}
