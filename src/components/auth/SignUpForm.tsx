"use client";
import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!accepted) {
      setError("You must accept the Terms and Privacy Policy.");
      return;
    }
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            full_name: `${firstName} ${lastName}`.trim(),
          },
        },
      });
      if (error) throw error;
      if (data.session) {
        router.replace("/onboarding/company");
      } else {
        setInfo(
          "Check your inbox to confirm your email address, then sign in to finish setting up your workspace."
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign up");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-title-sm font-semibold text-gray-900 dark:text-white sm:text-title-md">
          Create your workspace
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Free forever for solo founders. No card required.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label>
              First name<span className="text-error-500">*</span>
            </Label>
            <Input
              placeholder="Jane"
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div>
            <Label>
              Last name<span className="text-error-500">*</span>
            </Label>
            <Input
              placeholder="Doe"
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
        </div>
        <div>
          <Label>
            Work email<span className="text-error-500">*</span>
          </Label>
          <Input
            type="email"
            placeholder="you@company.com"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <Label>
            Password<span className="text-error-500">*</span>
          </Label>
          <div className="relative">
            <Input
              placeholder="Minimum 8 characters"
              type={showPassword ? "text" : "password"}
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
        <div className="flex items-start gap-3">
          <Checkbox
            className="w-5 h-5"
            checked={accepted}
            onChange={setAccepted}
          />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            I agree to Nova&apos;s{" "}
            <Link className="text-gray-800 dark:text-white" href="/terms">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link className="text-gray-800 dark:text-white" href="/privacy">
              Privacy Policy
            </Link>
            .
          </p>
        </div>

        {error && (
          <p className="rounded-lg border border-error-200 bg-error-50 px-3 py-2 text-sm text-error-700 dark:border-error-500/40 dark:bg-error-500/10 dark:text-error-300">
            {error}
          </p>
        )}
        {info && (
          <p className="rounded-lg border border-success-200 bg-success-50 px-3 py-2 text-sm text-success-700 dark:border-success-500/40 dark:bg-success-500/10 dark:text-success-300">
            {info}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600 disabled:opacity-60"
        >
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-brand-500 hover:text-brand-600"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
