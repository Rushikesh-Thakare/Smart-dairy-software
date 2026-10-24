import { redirect } from "next/navigation";
import { CalendarDays, Droplets, ListChecks, Phone, Scale, Wallet } from "lucide-react";
import { supabaseServer } from "@/lib/supabase";
import { CopyCode } from "../client";
import { Card, Shell, Stat } from "../ui";
import { FarmerCollections, LoadError, PaymentHistory, StatusLine, type FarmerCollection, type Payment } from "./parts";

const TOTALS_CAP = 1000; // shortcut: PostgREST returns at most 1000 rows; add a SQL totals function if a farmer exceeds this

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
    supabase.from("milk_collections").select("quantity_litres, total_amount", { count: "exact" }).eq("farmer_id", user.id).limit(TOTALS_CAP),
    supabase.from("milk_collections")
      .select("id, collected_at, quantity_litres, fat_tenths, rate_per_litre, total_amount, cattle_type, snf_tenths")
      .eq("farmer_id", user.id).order("collected_at", { ascending: false }).limit(25),
    supabase.from("payments").select("id, amount, paid_on, method, reference, status")
      .eq("farmer_id", user.id).order("paid_on", { ascending: false }).limit(TOTALS_CAP),
  ]);

  const rows = totals.data ?? [];
  const paidRows = (payments.data ?? []) as Payment[];
  const litres = rows.reduce((s, r) => s + Number(r.quantity_litres), 0);
  const priced = rows.filter((r) => r.total_amount != null);
  const unpriced = rows.length - priced.length;
  const earned = priced.reduce((s, r) => s + Number(r.total_amount), 0);
  const paid = paidRows.filter((p) => p.status === "paid").reduce((s, p) => s + Number(p.amount), 0);
  const count = totals.count ?? rows.length;
  // Money is only shown when it can be computed from real prices; otherwise say so.
  const hasEarnings = priced.length > 0;
  const earnNote = !hasEarnings ? "Rates not set yet" : unpriced ? `Excludes ${unpriced} collection${unpriced > 1 ? "s" : ""} without a rate` : "From all collections";
  const balanceNote = !hasEarnings ? (paid > 0 ? `Paid so far: ${paid.toFixed(2)}` : "Needs rates to calculate") : unpriced ? "Excludes unpriced collections" : "Earnings minus payments";
  const since = new Date(me.created_at).toLocaleDateString(undefined, { dateStyle: "medium" });
  const firstName = String(me.full_name).split(" ")[0];

  return (
    <Shell user={me.full_name} role="farmer" nav={[["Overview", "#overview"], ["Collections", "#collections"], ["Payments", "#payments"]]}>
      <section id="overview" className="scroll-mt-32 overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-slate-900 p-6 text-white shadow-lg sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-sm font-medium text-emerald-100">Welcome back</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">{firstName}</h1>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-emerald-100/90">
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

      <div className="my-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Total litres" value={totals.error ? "-" : litres.toFixed(2)} icon={Droplets} note={totals.error ? "Unavailable" : undefined} />
        <Stat label="Total collections" value={totals.error ? "-" : String(count)} icon={ListChecks} note={!totals.error && count > TOTALS_CAP ? `Totals cover your latest ${TOTALS_CAP}` : undefined} />
        <Stat label="Earnings" value={totals.error ? "-" : hasEarnings ? earned.toFixed(2) : "Not available"} icon={Scale} note={totals.error ? "Unavailable" : earnNote} />
        <Stat label="Outstanding balance" value={totals.error || payments.error ? "-" : hasEarnings ? (earned - paid).toFixed(2) : "Not available"} icon={Wallet} note={totals.error || payments.error ? "Unavailable" : balanceNote} />
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
