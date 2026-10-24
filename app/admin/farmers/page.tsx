import Link from "next/link";
import { Search } from "lucide-react";
import { cleanSearch, requireAdmin } from "@/lib/admin";
import { btn } from "../../styles";
import { Badge, Card, Empty } from "../../ui";
import { tableStyles } from "../../ui";
import { FarmerActions, LoadError, PageHeader } from "../parts";

const { th, td } = tableStyles;
const STATUSES = ["pending", "approved", "suspended"];
const LIMIT = 100; // shortcut: no pagination for farmers yet, add it past ~100 farmers

export const metadata = { title: "Farmers" };

export default async function Farmers({ searchParams }: PageProps<"/admin/farmers">) {
  const { supabase } = await requireAdmin();
  const sp = await searchParams;
  const q = cleanSearch(sp.q);
  const status = STATUSES.includes(String(sp.status)) ? String(sp.status) : "";

  let query = supabase.from("profiles").select("id, full_name, phone, farmer_code, status, created_at").eq("role", "farmer").order("created_at", { ascending: false }).limit(LIMIT);
  if (status) query = query.eq("status", status);
  if (q) query = query.or(`full_name.ilike.%${q}%,phone.ilike.%${q}%,farmer_code.ilike.%${q}%`);
  const { data: farmers, error } = await query;
  const filtered = Boolean(q || status);

  return (
    <>
      <PageHeader title="Farmers" subtitle="Search, review and approve registered farmers." />
      <Card>
        <form className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:p-5" role="search">
          <label className="relative flex-1">
            <span className="sr-only">Search farmers</span>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-500" aria-hidden />
            <input name="q" defaultValue={q} placeholder="Search by name, phone or code" maxLength={50} className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3.5 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/15" />
          </label>
          <label>
            <span className="sr-only">Filter by status</span>
            <select name="status" defaultValue={status} className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/15 sm:w-44">
              <option value="">All statuses</option>
              {STATUSES.map((s) => <option key={s} value={s} className="capitalize">{s[0].toUpperCase() + s.slice(1)}</option>)}
            </select>
          </label>
          <button className={btn.primary}>Apply</button>
          {filtered && <Link href="/admin/farmers" className={btn.secondary}>Clear</Link>}
        </form>
        {error ? <LoadError what="farmers" /> : !farmers?.length ? (
          <Empty title={filtered ? "No farmers match your filters" : "No farmers yet"} hint={filtered ? "Try a different search or clear the filters." : "Farmers appear here after they register."} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/70"><tr>
                <th scope="col" className={th}>Name</th><th scope="col" className={`${th} hidden sm:table-cell`}>Phone</th><th scope="col" className={`${th} hidden sm:table-cell`}>Code</th>
                <th scope="col" className={th}>Status</th><th scope="col" className={`${th} hidden md:table-cell`}>Joined</th><th scope="col" className={`${th} text-right`}>Actions</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-100">
                {farmers.map((f) => (
                  <tr key={f.id} className="transition hover:bg-slate-50/70">
                    <td className="px-2.5 py-3.5 sm:px-6"><Link href={`/admin/farmers/${f.id}`} className="inline-block py-1 font-medium text-slate-900 hover:text-emerald-700 hover:underline">{f.full_name}</Link><span className="block font-mono text-xs text-slate-500 sm:hidden">{f.farmer_code}</span></td>
                    <td className={`${td} hidden text-slate-600 sm:table-cell`}>{f.phone}</td>
                    <td className={`${td} hidden font-mono text-slate-700 sm:table-cell`}>{f.farmer_code}</td>
                    <td className={td}><Badge status={f.status} /></td>
                    <td className={`${td} hidden text-slate-600 md:table-cell`}>{new Date(f.created_at).toLocaleDateString(undefined, { dateStyle: "medium" })}</td>
                    <td className={`${td} text-right`}><FarmerActions id={f.id} name={f.full_name} status={f.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!error && farmers && farmers.length === LIMIT && <p className="border-t border-slate-100 px-6 py-3 text-sm text-slate-500">Showing the newest {LIMIT} farmers. Narrow the search to find others.</p>}
      </Card>
    </>
  );
}
