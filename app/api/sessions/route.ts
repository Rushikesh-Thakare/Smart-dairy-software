import { NextResponse } from "next/server";
import { isBridge } from "@/lib/device-auth";
import { parseSessionRequest } from "@/lib/collection";
import { supabaseAdmin } from "@/lib/supabase-admin";

const err = (error: string, status: number) => NextResponse.json({ error }, { status });

// Opens a collection session for a farmer code entered on the keypad.
export async function POST(request: Request) {
  if (!isBridge(request)) return err("unauthorized", 401);
  const parsed = parseSessionRequest(await request.json().catch(() => null));
  if (!parsed.ok) return err(parsed.error, 400);

  const db = supabaseAdmin();
  const { data: farmer } = await db.from("profiles").select("id, full_name, status")
    .eq("farmer_code", parsed.value.farmer_code).eq("role", "farmer").maybeSingle();
  if (!farmer) return err("unknown_farmer", 404);
  if (farmer.status !== "approved") return err("farmer_not_approved", 403);

  const { data: session, error } = await db.from("collection_sessions")
    .insert({ farmer_id: farmer.id, device_id: parsed.value.device_id })
    .select("id, expires_at").single();
  if (error) {
    console.error("session insert failed", error.code);
    return err("server_error", 500);
  }
  return NextResponse.json({ session_id: session.id, farmer_name: farmer.full_name, expires_at: session.expires_at }, { status: 201 });
}
