import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CalendarDays, FlaskConical, KeyRound, ListChecks, Phone, Wallet } from "lucide-react";
import { isUuid, requireAdmin } from "@/lib/admin";
import { AutoRefresh } from "../../../client";
import { Badge, Card, Stat } from "../../../ui";
import { FarmerCollections, PaymentHistory, type FarmerCollection, type Payment } from "../../../dashboard/parts";
import { FarmerActions, LoadError, PageHeader } from "../../parts";

const CAP = 1000; // shortcut: totals cover the latest 1000 records (PostgREST row limit)

export const metadata = { title: "Farmer details" };

export default async function FarmerDetail({ params }: PageProps<"/admin/farmers/[id]">) {
  const { supabase } = await requireAdmin();
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const { data: farmer } = await supabase.from("profiles").select("id, full_name, phone, farmer_code, status, created_at").eq("id", id).eq("role", "farmer").maybeSingle();
  if (!farmer) notFound();

  const [totals, recent, pays] = await Promise.all([
    supabase.from("milk_collections").select("fat_tenths", { count: "exact" }).eq("farmer_id", id).limit(CAP),
    supabase.from("milk_collections").select("id, collected_at, fat_tenths, cattle_type, snf_tenths")
      .eq("farmer_id", id).order("collected_at", { ascending: false }).limit(10),
    supabase.from("payments").select("id, amount, paid_on, method, reference, status").eq("farmer_id", id).order("paid_on", { ascending: false }).limit(CAP),
  ]);
  const fats = (totals.data ?? []).flatMap((r) => (r.fat_tenths == null ? [] : [r.fat_tenths]));
  const avgFat = fats.length ? fats.reduce((s, f) => s + f, 0) / fats.length / 10 : null;
  const payRows = (pays.data ?? []) as Payment[];
  const paid = payRows.filter((p) => p.status === "paid").reduce((s, p) => s + Number(p.amount), 0);

  return (
    <>
      <AutoRefresh />
      <PageHeader title={farmer.full_name} subtitle="Farmer details and collection history." back={{ href: "/admin/farmers", label: "All farmers" }}>
        <FarmerActions id={farmer.id} name={farmer.full_name} status={farmer.status} />
      </PageHeader>

      <Card>
        <dl className="grid gap-6 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-4">
          <div><dt className="flex items-center gap-1.5 text-sm text-slate-500"><KeyRound className="size-4" aria-hidden />Collection code</dt><dd className="mt-1 font-mono text-xl font-semibold tracking-widest text-emerald-700">{farmer.farmer_code}</dd></div>
          <div><dt className="flex items-center gap-1.5 text-sm text-slate-500"><Phone className="size-4" aria-hidden />Phone</dt><dd className="mt-1 font-medium text-slate-900">{farmer.phone}</dd></div>
          <div><dt className="flex items-center gap-1.5 text-sm text-slate-500"><CalendarDays className="size-4" aria-hidden />Joined</dt><dd className="mt-1 font-medium text-slate-900">{new Date(farmer.created_at).toLocaleDateString(undefined, { dateStyle: "medium" })}</dd></div>
          <div><dt className="text-sm text-slate-500">Status</dt><dd className="mt-1"><Badge status={farmer.status} /></dd></div>
        </dl>
      </Card>

      <div className="my-8 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <Stat label="Collections" value={totals.error ? "-" : String(totals.count ?? 0)} icon={ListChecks} />
        <Stat label="Average fat" value={totals.error || avgFat === null ? "-" : `${avgFat.toFixed(1)}%`} icon={FlaskConical} />
        <Stat label="Paid to date" value={pays.error ? "-" : paid.toFixed(2)} icon={Wallet} note="Payments marked paid" />
      </div>

      <div className="space-y-8">
        <Card title="Recent collections" action={<Link href={`/admin/collections?farmer=${farmer.id}`} className="inline-flex items-center gap-1 py-1 text-sm font-medium text-emerald-700 hover:underline">Full history<ArrowRight className="size-4" aria-hidden /></Link>}>
          {recent.error ? <LoadError what="collections" /> : <FarmerCollections rows={(recent.data ?? []) as FarmerCollection[]} />}
        </Card>
        <Card title="Payments">
          {pays.error ? <LoadError what="payments" /> : <PaymentHistory rows={payRows.slice(0, 10)} />}
        </Card>
      </div>
    </>
  );
}
