"use client";
import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";
import React from "react";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface Props {
  data: { stage: string; value: number; count: number }[];
}

export default function PipelineChart({ data }: Props) {
  const options: ApexOptions = {
    colors: ["#465fff"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 6,
        barHeight: "60%",
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val) =>
        typeof val === "number" ? `$${val.toLocaleString()}` : String(val),
    },
    xaxis: { categories: data.map((d) => d.stage) },
    legend: { show: false },
    tooltip: { y: { formatter: (v) => `$${v.toLocaleString()}` } },
  };
  const series = [{ name: "Value", data: data.map((d) => d.value) }];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
        Pipeline by stage
      </h3>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Open deals weighted by value, grouped by stage.
      </p>
      <div className="mt-4">
        <ReactApexChart
          options={options}
          series={series}
          type="bar"
          height={320}
        />
      </div>
    </div>
  );
}
