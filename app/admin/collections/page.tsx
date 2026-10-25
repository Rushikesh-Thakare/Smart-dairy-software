import Link from "next/link";
import { X } from "lucide-react";
import { isUuid, requireAdmin } from "@/lib/admin";
import { AutoRefresh } from "../../client";
import { Card } from "../../ui";
import { AdminCollections, LoadError, PageHeader, Pager, type AdminRow } from "../parts";

const PAGE_SIZE = 25;

export const metadata = { title: "Milk collections" };

export default async function Collections({ searchParams }: PageProps<"/admin/collections">) {
  const { supabase } = await requireAdmin();
  const sp = await searchParams;
  const farmerParam = String(Array.isArray(sp.farmer) ? sp.farmer[0] : sp.farmer ?? "");
  const farmerId = isUuid(farmerParam) ? farmerParam : "";
  const page = Math.max(1, Math.floor(Number(Array.isArray(sp.page) ? sp.page[0] : sp.page)) || 1);

  let query = supabase.from("milk_collections")
    .select("id, collected_at, quantity_litres, fat_tenths, total_amount, cattle_type, snf_tenths, farmer_id, profiles(full_name, farmer_code)", { count: "exact" })
    .order("collected_at", { ascending: false }).range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  if (farmerId) query = query.eq("farmer_id", farmerId);
  const [{ data, error, count }, farmer] = await Promise.all([
    query,
    farmerId ? supabase.from("profiles").select("full_name").eq("id", farmerId).maybeSingle() : Promise.resolve({ data: null }),
  ]);
  const total = count ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const base = farmerId ? `/admin/collections?farmer=${farmerId}` : "/admin/collections";

  return (
    <>
      <AutoRefresh />
      <PageHeader title="Milk collections" subtitle="Every recorded collection, newest first.">
        {farmerId && (
          <Link href="/admin/collections" className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-800 hover:bg-emerald-100">
            Farmer: {farmer.data?.full_name ?? "Unknown"}<X className="size-4" aria-label="Clear farmer filter" />
          </Link>
        )}
      </PageHeader>
      <Card>
        {error ? <LoadError what="collections" /> : (
          <>
            <AdminCollections rows={(data ?? []) as unknown as AdminRow[]} />
            <Pager base={base} page={page} pages={pages} total={total} from={total ? (page - 1) * PAGE_SIZE + 1 : 0} to={Math.min(page * PAGE_SIZE, total)} />
          </>
        )}
      </Card>
    </>
  );
}
