"use client";
import React, { forwardRef } from "react";

interface Props {
  name?: string;
  id?: string;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  rows?: number;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  disabled?: boolean;
}

const TextArea = forwardRef<HTMLTextAreaElement, Props>(
  ({ rows = 4, ...rest }, ref) => (
    <textarea
      ref={ref}
      rows={rows}
      {...rest}
      className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
    />
  )
);
TextArea.displayName = "TextArea";
export default TextArea;
