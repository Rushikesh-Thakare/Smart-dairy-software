"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase";
import { isUuid, requireAdmin } from "@/lib/admin";
import { parseQuantityText } from "@/lib/collection";
import { supabaseAdmin } from "@/lib/supabase-admin";
import type { MessageCode } from "@/lib/messages";
import { identifierToEmail, normalizePhone, phoneToEmail } from "@/lib/phone";

const fail = (path: string, code: MessageCode): never => redirect(`${path}?error=${code}`);

export async function register(form: FormData) {
  const name = String(form.get("name") ?? "").trim();
  const phone = normalizePhone(String(form.get("phone") ?? ""));
  const password = String(form.get("password") ?? "");
  if (name.length < 2 || name.length > 100) fail("/register", "name");
  if (!/^\d{10,15}$/.test(phone)) fail("/register", "phone");
  if (password.length < 8) fail("/register", "password");

  const supabase = await supabaseServer();
  const { data, error } = await supabase.auth.signUp({
    email: phoneToEmail(phone),
    password,
    options: { data: { full_name: name, phone } },
  });
  if (error) {
    const code = error.code ?? "";
    fail("/register", code === "user_already_exists" ? "exists" : code === "weak_password" ? "weak" : code.startsWith("over_") ? "rate" : "register");
  }
  // No session means email confirmation is still enabled in Supabase Auth settings.
  if (!data.session) fail("/register", "confirm");
  redirect("/dashboard");
}

export async function login(form: FormData) {
  const id = String(form.get("identifier") ?? "").trim();
  const password = String(form.get("password") ?? "");
  const supabase = await supabaseServer();
  const { error } = await supabase.auth.signInWithPassword({ email: identifierToEmail(id), password });
  if (error) fail("/login", "auth");
  redirect("/dashboard");
}

export async function logout() {
  await (await supabaseServer()).auth.signOut();
  redirect("/");
}

// Admin-only: checked here on the server, and again by RLS. Only farmer accounts can be changed.
export async function setStatus(form: FormData) {
  const status = String(form.get("status"));
  const id = String(form.get("id"));
  if (!["approved", "suspended", "pending"].includes(status) || !isUuid(id)) return;
  const { supabase } = await requireAdmin();
  await supabase.from("profiles").update({ status }).eq("id", id).eq("role", "farmer");
  revalidatePath("/admin", "layout");
}

// Admin-only: turns a waiting FPGA fat reading into a saved collection once the quantity is typed in.
// Never guesses a quantity. Saving the same reading twice is harmless: one collection per session (unique session_id).
export async function saveReading(form: FormData) {
  const id = String(form.get("id"));
  const quantity = parseQuantityText(String(form.get("quantity") ?? ""));
  if (!isUuid(id)) return;
  await requireAdmin();
  if (quantity === null) fail("/admin/readings", "quantity");

  const db = supabaseAdmin(); // sessions have no browser write access, so the server writes after the admin check above
  const { data: s } = await db.from("collection_sessions").select("id, farmer_id, status, expires_at, fat_tenths").eq("id", id).maybeSingle();
  if (!s || s.fat_tenths === null || s.status !== "open" || new Date(s.expires_at) < new Date()) fail("/admin/readings", "reading");
  const { error } = await db.from("milk_collections").insert({ farmer_id: s!.farmer_id, session_id: s!.id, fat_tenths: s!.fat_tenths, quantity_litres: quantity });
  if (error && error.code !== "23505") fail("/admin/readings", "save");
  await db.from("collection_sessions").update({ status: "saved", saved_at: new Date().toISOString() }).eq("id", id).eq("status", "open");
  revalidatePath("/admin", "layout");
  redirect("/admin/readings?saved=1");
}
