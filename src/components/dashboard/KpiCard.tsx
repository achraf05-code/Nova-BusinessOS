import React from "react";
import Badge from "@/components/ui/badge/Badge";
import { ArrowDownIcon, ArrowUpIcon } from "@/icons";

interface Props {
  label: string;
  value: string;
  delta?: { value: string; positive?: boolean } | null;
  icon?: React.ReactNode;
}

export default function KpiCard({ label, value, delta, icon }: Props) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800">
        {icon ?? (
          <span className="text-gray-800 dark:text-white/90">●</span>
        )}
      </div>
      <div className="mt-5 flex items-end justify-between">
        <div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {label}
          </span>
          <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
            {value}
          </h4>
        </div>
        {delta && (
          <Badge color={delta.positive === false ? "error" : "success"}>
            {delta.positive === false ? (
              <ArrowDownIcon className="text-error-500" />
            ) : (
              <ArrowUpIcon />
            )}
            {delta.value}
          </Badge>
        )}
      </div>
    </div>
  );
}
