import { NextResponse } from "next/server";
import { isBridge } from "@/lib/device-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

// Connectivity check for the serial bridge: proves the URL is reachable, the key is accepted and
// the database answers. Read-only, same bridge-key protection as the other API routes.
export async function GET(request: Request) {
  if (!isBridge(request)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { error } = await supabaseAdmin().from("profiles").select("id", { head: true, count: "exact" }).limit(1);
  if (error) {
    console.error("health check: database unreachable", error.code);
    return NextResponse.json({ ok: false, db: false }, { status: 503 });
  }
  return NextResponse.json({ ok: true, db: true });
}
