import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import { supabaseServer } from "./supabase";

export const isUuid = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

// Server-side admin gate. Call it in the admin layout AND in every admin page: layouts are not
// re-rendered on client navigation, so the page itself must never trust the layout. RLS is the third layer.
export const requireAdmin = cache(async () => {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("id, full_name, role").eq("id", user.id).single();
  if (profile?.role !== "admin") notFound();
  return { supabase, user, profile };
});

// Search text goes into a PostgREST filter string, so drop its syntax characters.
export const cleanSearch = (s: string | string[] | undefined) =>
  String(Array.isArray(s) ? s[0] : s ?? "").replace(/[,()%*\\:"']/g, " ").trim().slice(0, 50);
