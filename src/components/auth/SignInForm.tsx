"use client";
import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [keep, setKeep] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/dashboard";

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // Try the rate-limited server endpoint first; fall back to direct
      // Supabase client when running against demo mode (no backend).
      const proxy = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (proxy.status === 429) {
        const j = await proxy.json().catch(() => ({}));
        throw new Error(j.error ?? "Too many attempts");
      }
      if (proxy.status === 503) {
        // Demo mode — fall through to client SDK
      } else if (!proxy.ok) {
        const j = await proxy.json().catch(() => ({}));
        throw new Error(j.error ?? "Unable to sign in");
      }
      // The SSR cookie was set by the proxy. We still call the client SDK
      // so the in-memory subscription updates instantly.
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error && proxy.status !== 200) throw error;
      router.replace(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-title-sm font-semibold text-gray-900 dark:text-white sm:text-title-md">
          Welcome back
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Sign in to your Nova BusinessOS workspace.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <Label>
            Email <span className="text-error-500">*</span>
          </Label>
          <Input
            type="email"
            placeholder="you@company.com"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <Label>
            Password <span className="text-error-500">*</span>
          </Label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              onChange={(e) => setPassword(e.target.value)}
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 z-30 -translate-y-1/2 cursor-pointer"
            >
              {showPassword ? (
                <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
              ) : (
                <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
              )}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Checkbox checked={keep} onChange={setKeep} />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Keep me signed in
            </span>
          </div>
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-brand-500 hover:text-brand-600"
          >
            Forgot password?
          </Link>
        </div>

        {error && (
          <p className="rounded-lg border border-error-200 bg-error-50 px-3 py-2 text-sm text-error-700 dark:border-error-500/40 dark:bg-error-500/10 dark:text-error-300">
            {error}
          </p>
        )}

        <Button className="w-full" disabled={loading} size="sm">
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
        New to Nova?{" "}
        <Link
          href="/register"
          className="font-medium text-brand-500 hover:text-brand-600"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
