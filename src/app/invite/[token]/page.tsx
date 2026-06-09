import type { Metadata } from "next";
import Link from "next/link";
import { getInvitationByToken } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/env";
import NovaLogo from "@/components/brand/NovaLogo";
import { acceptInvitationAction } from "./actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Accept invitation",
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function InvitePage({ params }: PageProps) {
  const { token } = await params;
  const invitation = await getInvitationByToken(token);

  let signedIn = false;
  if (supabaseConfigured) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    signedIn = Boolean(user);
  } else {
    signedIn = true; // demo mode: auto-authenticate
  }

  const expired =
    !!invitation && new Date(invitation.expires_at).getTime() < Date.now();
  const accepted = !!invitation?.accepted_at;
  const valid = !!invitation && !expired && !accepted;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12 dark:bg-gray-950">
      <div className="mx-auto max-w-md">
        <NovaLogo className="text-gray-900 dark:text-white" />
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-8 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
          {!invitation && (
            <>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Invitation not found
              </h1>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                The link is invalid or has been revoked.
              </p>
            </>
          )}
          {invitation && expired && (
            <>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Invitation expired
              </h1>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Ask your admin to send a new invitation to{" "}
                <strong>{invitation.email}</strong>.
              </p>
            </>
          )}
          {invitation && accepted && (
            <>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Already accepted
              </h1>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                You can sign in below.
              </p>
              <Link
                href="/login"
                className="mt-4 inline-flex rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
              >
                Sign in
              </Link>
            </>
          )}
          {valid && (
            <>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                You&apos;re invited
              </h1>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                You&apos;ve been invited to join as{" "}
                <strong>{invitation.role}</strong>. Accept to start collaborating.
              </p>
              {signedIn ? (
                <form
                  action={async () => {
                    "use server";
                    await acceptInvitationAction(token);
                  }}
                  className="mt-6"
                >
                  <button
                    type="submit"
                    className="inline-flex w-full items-center justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
                  >
                    Accept invitation
                  </button>
                </form>
              ) : (
                <div className="mt-6 space-y-3">
                  <Link
                    href={`/register?next=/invite/${token}`}
                    className="inline-flex w-full items-center justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
                  >
                    Create an account & join
                  </Link>
                  <Link
                    href={`/login?next=/invite/${token}`}
                    className="inline-flex w-full items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Sign in to existing account
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
