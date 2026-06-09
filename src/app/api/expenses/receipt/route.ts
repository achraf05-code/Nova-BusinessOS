import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/env";
import { requireActiveCompany } from "@/lib/tenant";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/heic",
  "application/pdf",
]);

export async function POST(req: Request) {
  let ctx;
  try {
    ctx = await requireActiveCompany();
  } catch {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file_required" }, { status: 400 });
  }
  if (file.size === 0) {
    return NextResponse.json({ error: "empty_file" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "file_too_large", limit: MAX_BYTES },
      { status: 413 }
    );
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json(
      { error: "unsupported_type", got: file.type },
      { status: 415 }
    );
  }

  // Demo mode: return a data URL. The image is round-trip safe but never
  // leaves the local browser session.
  if (!supabaseConfigured) {
    const arrayBuffer = await file.arrayBuffer();
    const b64 = Buffer.from(arrayBuffer).toString("base64");
    return NextResponse.json({
      url: `data:${file.type};base64,${b64}`,
      path: `demo/${ctx.company.id}/${Date.now()}-${file.name}`,
      bytes: file.size,
      mode: "demo",
    });
  }

  // Production: upload to Storage. Bucket "receipts" is created by the
  // SQL migration in `supabase/supabase_schema.sql`.
  try {
    const supabase = await createClient();
    const ext = file.name.includes(".")
      ? file.name.split(".").pop()
      : "bin";
    const path = `${ctx.company.id}/${ctx.user.id}/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${ext}`;
    const { error } = await supabase.storage
      .from("receipts")
      .upload(path, file, {
        contentType: file.type,
        upsert: false,
      });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    const { data: pub } = supabase.storage.from("receipts").getPublicUrl(path);
    return NextResponse.json({
      url: pub.publicUrl,
      path,
      bytes: file.size,
      mode: "supabase",
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "upload_failed" },
      { status: 500 }
    );
  }
}
