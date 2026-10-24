import Link from "next/link";
import { ArrowRight, Clock, Droplets, ListChecks, Users } from "lucide-react";
import { requireAdmin } from "@/lib/admin";
import { Card, Stat } from "../ui";
import { ActivityChart, AdminCollections, LoadError, PageHeader, type AdminRow, type Daily } from "./parts";

export const metadata = { title: "Admin overview" };

export default async function Overview() {
  const { supabase, profile } = await requireAdmin(); // each page re-checks; the layout alone is not enough
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const [overview, recent] = await Promise.all([
    supabase.rpc("admin_overview", { days: 14, tz }),
    supabase.from("milk_collections")
      .select("id, collected_at, quantity_litres, fat_tenths, total_amount, cattle_type, snf_tenths, farmer_id, profiles(full_name, farmer_code)")
      .order("collected_at", { ascending: false }).limit(10),
  ]);
  const o = overview.data as { total_collections: number; total_litres: number; farmers: { total: number; pending: number; approved: number; suspended: number }; daily: Daily[] } | null;
  const na = overview.error || !o;

  return (
    <>
      <PageHeader title="Overview" subtitle={`Welcome, ${profile.full_name.split(" ")[0]}. Here is how your dairy is doing.`} />
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Link href="/admin/farmers" className="block"><Stat label="Registered farmers" value={na ? "-" : String(o.farmers.total)} icon={Users} note={na ? "Unavailable" : `${o.farmers.approved} approved`} /></Link>
        <Link href="/admin/farmers?status=pending" className="block"><Stat label="Pending approvals" value={na ? "-" : String(o.farmers.pending)} icon={Clock} note={na ? "Unavailable" : o.farmers.pending ? "Review now" : "All caught up"} /></Link>
        <Link href="/admin/collections" className="block"><Stat label="Total collections" value={na ? "-" : String(o.total_collections)} icon={ListChecks} note="All time" /></Link>
        <Link href="/admin/collections" className="block"><Stat label="Milk volume" value={na ? "-" : `${Number(o.total_litres).toFixed(2)} L`} icon={Droplets} note="All time" /></Link>
      </div>
      <div className="space-y-8">
        <Card title="Collection activity">{na ? <LoadError what="activity data" /> : <ActivityChart daily={o.daily} />}</Card>
        <Card title="Recent collections" action={<Link href="/admin/collections" className="inline-flex items-center gap-1 py-1 text-sm font-medium text-emerald-700 hover:underline">View all<ArrowRight className="size-4" aria-hidden /></Link>}>
          {recent.error ? <LoadError what="recent collections" /> : <AdminCollections rows={(recent.data ?? []) as unknown as AdminRow[]} />}
        </Card>
      </div>
    </>
  );
}
