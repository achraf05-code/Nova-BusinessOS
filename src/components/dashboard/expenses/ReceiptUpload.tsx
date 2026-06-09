"use client";
import React, { useRef, useState } from "react";
import Image from "next/image";
import { useToast } from "@/components/ui/toast/ToastProvider";
import { TrashBinIcon } from "@/icons";

interface Props {
  value?: string | null;
  onChange: (url: string | null) => void;
}

export default function ReceiptUpload({ value, onChange }: Props) {
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const onPick = async (file: File) => {
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/expenses/receipt", {
        method: "POST",
        body: fd,
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error ?? "upload_failed");
      }
      onChange(json.url as string);
      toast.success("Receipt uploaded");
    } catch (err) {
      toast.error(
        "Receipt upload failed",
        err instanceof Error ? err.message : undefined
      );
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const isImage = value && /^data:image\/|\.(png|jpe?g|webp|heic)$/i.test(value);

  return (
    <div className="flex flex-col gap-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "copy";
        }}
        onDrop={(e) => {
          e.preventDefault();
          const f = e.dataTransfer.files?.[0];
          if (f) onPick(f);
        }}
        className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 p-5 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-white/[0.02] dark:text-gray-400"
      >
        {value ? (
          <div className="flex w-full items-center gap-3">
            {isImage ? (
              <Image
                src={value}
                alt="Receipt"
                width={64}
                height={64}
                className="h-16 w-16 rounded-lg border border-gray-200 object-cover dark:border-gray-700"
                unoptimized
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-500 dark:border-gray-700 dark:bg-gray-900">
                PDF
              </div>
            )}
            <div className="grow text-left text-xs">
              <p className="font-medium text-gray-700 dark:text-gray-300">
                Receipt attached
              </p>
              <a
                href={value}
                target="_blank"
                rel="noreferrer"
                className="text-brand-500 hover:text-brand-600"
              >
                Preview
              </a>
            </div>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="rounded p-1.5 text-gray-400 hover:bg-error-50 hover:text-error-600 dark:hover:bg-error-500/10"
              aria-label="Remove receipt"
            >
              <TrashBinIcon className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <>
            <p>Drag a receipt here, or</p>
            <button
              type="button"
              disabled={busy}
              onClick={() => inputRef.current?.click()}
              className="mt-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              {busy ? "Uploading…" : "Choose file"}
            </button>
            <p className="mt-2 text-[11px] text-gray-400">
              PNG, JPG, WEBP, HEIC or PDF · up to 5MB
            </p>
          </>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/heic,application/pdf"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onPick(f);
        }}
      />
    </div>
  );
}
