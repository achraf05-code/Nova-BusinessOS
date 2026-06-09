import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/env";
import { clientKey, rateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Server-side login proxy. The dashboard SignIn form posts here so we can
 * apply per-IP rate limits (10 attempts / 5 min) before bouncing the
 * request to Supabase Auth. The actual session is set via SSR cookies.
 */
export async function POST(req: Request) {
  const limit = rateLimit(clientKey(req, "login"), {
    windowMs: 5 * 60 * 1000,
    max: 10,
  });
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many login attempts. Try again later." },
      { status: 429 }
    );
  }
  if (!supabaseConfigured) {
    return NextResponse.json(
      { error: "Supabase is not configured." },
      { status: 503 }
    );
  }
  const { email, password } = (await req.json().catch(() => ({}))) as {
    email?: string;
    password?: string;
  };
  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400 }
    );
  }
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
  return NextResponse.json({
    ok: true,
    user_id: data.user?.id ?? null,
  });
}
