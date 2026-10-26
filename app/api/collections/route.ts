import { NextResponse } from "next/server";
import { isBridge } from "@/lib/device-auth";
import { parseMeasurement } from "@/lib/collection";
import { supabaseAdmin } from "@/lib/supabase-admin";

const err = (error: string, status: number) => NextResponse.json({ error }, { status });

// Saves one confirmed measurement. Retrying the same measurement_id is safe (returns the stored record).
// Only the fat reading is recorded: quantity and price are not part of a collection.
export async function POST(request: Request) {
  if (!isBridge(request)) return err("unauthorized", 401);
  const parsed = parseMeasurement(await request.json().catch(() => null));
  if (!parsed.ok) return err(parsed.error, 400);
  const m = parsed.value;
  const db = supabaseAdmin();

  const { data: farmer } = await db.from("profiles").select("id, status")
    .eq("farmer_code", m.farmer_code).eq("role", "farmer").maybeSingle();
  if (!farmer) return err("unknown_farmer", 404);
  if (farmer.status !== "approved") return err("farmer_not_approved", 403);

  const { data: session } = await db.from("collection_sessions").select("id, farmer_id, status, expires_at")
    .eq("id", m.session_id).maybeSingle();
  if (!session || session.farmer_id !== farmer.id) return err("session_mismatch", 422);

  const close = () => db.from("collection_sessions").update({ status: "saved", saved_at: new Date().toISOString() })
    .eq("id", session.id).eq("status", "open");
  const existing = async () => (await db.from("milk_collections").select("id, farmer_id, session_id")
    .eq("measurement_id", m.measurement_id).maybeSingle()).data;
  const duplicate = async (row: NonNullable<Awaited<ReturnType<typeof existing>>>) => {
    if (row.farmer_id !== farmer.id || row.session_id !== session.id) return err("measurement_id_conflict", 409);
    await close(); // heals a retry after a crash between insert and close
    return NextResponse.json({ id: row.id, duplicate: true }, { status: 200 });
  };

  const prior = await existing();
  if (prior) return duplicate(prior);
  if (session.status !== "open") return err("session_closed", 409);
  if (new Date(session.expires_at) < new Date()) return err("session_expired", 410);

  const { data: row, error } = await db.from("milk_collections").insert({
    measurement_id: m.measurement_id, farmer_id: farmer.id, session_id: session.id,
    adc_value: m.adc_value, fat_tenths: m.fat_tenths, cattle_type: m.cattle_type,
  }).select("id").single();
  if (error) {
    if (error.code === "23505") { // lost a race: same id retried, or the session was just used
      const raced = await existing();
      return raced ? duplicate(raced) : err("session_closed", 409);
    }
    console.error("collection insert failed", error.code);
    return err("server_error", 500);
  }
  await close();
  return NextResponse.json({ id: row.id, duplicate: false }, { status: 201 });
}
