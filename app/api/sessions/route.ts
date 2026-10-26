import { NextResponse } from "next/server";
import { isBridge } from "@/lib/device-auth";
import { parseSessionRequest } from "@/lib/collection";
import { supabaseAdmin } from "@/lib/supabase-admin";

const err = (error: string, status: number) => NextResponse.json({ error }, { status });

// Opens a collection session for a farmer code entered on the keypad.
// With session_id + fat_tenths it records an FPGA fat reading instead; the quantity is entered later in the admin panel.
export async function POST(request: Request) {
  if (!isBridge(request)) return err("unauthorized", 401);
  const parsed = parseSessionRequest(await request.json().catch(() => null));
  if (!parsed.ok) return err(parsed.error, 400);

  const db = supabaseAdmin();
  const { data: farmer } = await db.from("profiles").select("id, full_name, status")
    .eq("farmer_code", parsed.value.farmer_code).eq("role", "farmer").maybeSingle();
  if (!farmer) return err("unknown_farmer", 404);
  if (farmer.status !== "approved") return err("farmer_not_approved", 403);

  const { reading } = parsed.value;
  const view = (s: { id: string; expires_at: string }, status: number, duplicate = false) =>
    NextResponse.json({ session_id: s.id, farmer_name: farmer.full_name, expires_at: s.expires_at, ...(reading && { duplicate }) }, { status });

  if (reading) {
    const found = async () => (await db.from("collection_sessions").select("id, farmer_id, fat_tenths, expires_at")
      .eq("id", reading.session_id).maybeSingle()).data;
    const same = (s: NonNullable<Awaited<ReturnType<typeof found>>>) =>
      s.farmer_id === farmer.id && s.fat_tenths === reading.fat_tenths ? view(s, 200, true) : err("session_conflict", 409);
    // A retried POST (same session id), or the FPGA repeating a message while that reading is still waiting for its quantity.
    const prior = await found();
    if (prior) return same(prior);
    const { data: waiting } = await db.from("collection_sessions").select("id, expires_at").eq("farmer_id", farmer.id)
      .eq("status", "open").eq("fat_tenths", reading.fat_tenths).gt("expires_at", new Date().toISOString()).limit(1);
    if (waiting?.length) return view(waiting[0], 200, true);
    // A newer reading with a different fat replaces older ones that never got a quantity.
    await db.from("collection_sessions").update({ status: "cancelled" })
      .eq("farmer_id", farmer.id).eq("status", "open").not("fat_tenths", "is", null);
    const { data: created, error } = await db.from("collection_sessions")
      .insert({ id: reading.session_id, farmer_id: farmer.id, device_id: parsed.value.device_id, fat_tenths: reading.fat_tenths })
      .select("id, expires_at").single();
    if (error?.code === "23505") { // lost a race against the same retried POST
      const raced = await found();
      return raced ? same(raced) : err("server_error", 500);
    }
    if (error) {
      console.error("reading insert failed", error.code);
      return err("server_error", 500);
    }
    return view(created, 201);
  }

  const { data: session, error } = await db.from("collection_sessions")
    .insert({ farmer_id: farmer.id, device_id: parsed.value.device_id })
    .select("id, expires_at").single();
  if (error) {
    console.error("session insert failed", error.code);
    return err("server_error", 500);
  }
  return view(session, 201);
}
