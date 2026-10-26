import { redirect } from "next/navigation";
import { CalendarDays, FlaskConical, ListChecks, Phone } from "lucide-react";
import { supabaseServer } from "@/lib/supabase";
import { AutoRefresh, CopyCode } from "../client";
import { Card, Shell, Stat } from "../ui";
import { FarmerCollections, LoadError, PaymentHistory, StatusLine, type FarmerCollection, type Payment } from "./parts";

const TOTALS_CAP = 1000; // shortcut: PostgREST returns at most 1000 rows; add a SQL totals function if a farmer exceeds this

export const metadata = { title: "My dashboard" };

export default async function Dashboard() {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  // RLS limits every query below to this farmer's rows; the explicit filters are a second layer.
  const { data: me, error: meError } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (meError && meError.code !== "PGRST116") throw new Error("profile load failed"); // shown by error.tsx
  if (!me) redirect("/login");
  if (me.role === "admin") redirect("/admin");

  const [totals, recent, payments] = await Promise.all([
    supabase.from("milk_collections").select("fat_tenths", { count: "exact" }).eq("farmer_id", user.id).limit(TOTALS_CAP),
    supabase.from("milk_collections")
      .select("id, collected_at, fat_tenths, cattle_type, snf_tenths")
      .eq("farmer_id", user.id).order("collected_at", { ascending: false }).limit(25),
    supabase.from("payments").select("id, amount, paid_on, method, reference, status")
      .eq("farmer_id", user.id).order("paid_on", { ascending: false }).limit(TOTALS_CAP),
  ]);

  const rows = totals.data ?? [];
  const paidRows = (payments.data ?? []) as Payment[];
  const fats = rows.flatMap((r) => (r.fat_tenths == null ? [] : [r.fat_tenths]));
  const avgFat = fats.length ? fats.reduce((s, f) => s + f, 0) / fats.length / 10 : null;
  const count = totals.count ?? rows.length;
  const since = new Date(me.created_at).toLocaleDateString(undefined, { dateStyle: "medium" });
  const firstName = String(me.full_name).split(" ")[0];

  return (
    <Shell user={me.full_name} role="farmer" nav={[["Overview", "#overview"], ["Collections", "#collections"], ["Payments", "#payments"]]}>
      <AutoRefresh />
      <section id="overview" className="scroll-mt-32 overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-700 via-emerald-800 to-slate-900 p-6 text-white shadow-lg sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl"><span className="block text-sm font-medium text-emerald-100">Welcome back</span>{firstName}</h1>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-white">
              <span className="inline-flex items-center gap-1.5"><Phone className="size-4" aria-hidden />{me.phone}</span>
              <span className="inline-flex items-center gap-1.5"><CalendarDays className="size-4" aria-hidden />Member since {since}</span>
            </div>
            <div className="mt-5 max-w-xl"><StatusLine status={me.status} /></div>
          </div>
          <div className="rounded-2xl bg-white p-5 text-slate-900 shadow-md lg:min-w-72">
            <p className="text-sm font-medium text-slate-500">Your collection code</p>
            <p className="my-2 font-mono text-5xl font-semibold tracking-[0.3em] text-emerald-700" aria-label={`Collection code ${String(me.farmer_code).split("").join(" ")}`}>{me.farmer_code}</p>
            <p className="mb-4 text-xs text-slate-500">Tell this code to the operator at the collection point. It does not give access to your account.</p>
            <CopyCode code={me.farmer_code} />
          </div>
        </div>
      </section>

      <div className="my-8 grid grid-cols-2 gap-4">
        <Stat label="Total collections" value={totals.error ? "-" : String(count)} icon={ListChecks} note={totals.error ? "Unavailable" : count > TOTALS_CAP ? `Totals cover your latest ${TOTALS_CAP}` : undefined} />
        <Stat label="Average fat" value={totals.error || avgFat === null ? "-" : `${avgFat.toFixed(1)}%`} icon={FlaskConical} note={totals.error ? "Unavailable" : avgFat === null ? "No fat readings yet" : "Across your collections"} />
      </div>

      <div className="space-y-8">
        <section id="collections" className="scroll-mt-32">
          <Card title="Recent collections">
            {recent.error ? <LoadError what="your collections" /> : <FarmerCollections rows={(recent.data ?? []) as FarmerCollection[]} />}
          </Card>
        </section>
        <section id="payments" className="scroll-mt-32">
          <Card title="Payment history">
            {payments.error ? <LoadError what="your payments" /> : <PaymentHistory rows={paidRows.slice(0, 10)} />}
          </Card>
        </section>
      </div>
    </Shell>
  );
}
