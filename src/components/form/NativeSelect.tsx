"use client";
import React, { forwardRef } from "react";

interface Option {
  label: string;
  value: string;
}
interface Props {
  name?: string;
  id?: string;
  value?: string;
  defaultValue?: string;
  options: Option[];
  onChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

const NativeSelect = forwardRef<HTMLSelectElement, Props>(
  ({ name, id, value, defaultValue, options, onChange, disabled, className }, ref) => {
    return (
      <select
        ref={ref}
        id={id}
        name={name}
        value={value}
        defaultValue={defaultValue}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
        className={`h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 ${
          className ?? ""
        }`}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    );
  }
);
NativeSelect.displayName = "NativeSelect";
export default NativeSelect;
