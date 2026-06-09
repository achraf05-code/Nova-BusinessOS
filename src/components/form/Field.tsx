"use client";
import React from "react";
import Label from "@/components/form/Label";

interface Props {
  label: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}

export default function Field({
  label,
  htmlFor,
  required,
  error,
  hint,
  children,
}: Props) {
  return (
    <div>
      <Label htmlFor={htmlFor}>
        {label}
        {required && <span className="text-error-500"> *</span>}
      </Label>
      {children}
      {error && (
        <p className="mt-1 text-xs text-error-500" role="alert">
          {error}
        </p>
      )}
      {!error && hint && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{hint}</p>
      )}
    </div>
  );
}
