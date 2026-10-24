import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { Badge, Card, Empty, tableStyles } from "../../ui";
import { LoadError, Notice, PageHeader } from "../parts";

const { th, td } = tableStyles;

export default async function Payments() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("payments")
    .select("id, amount, paid_on, method, reference, status, farmer_id, profiles(full_name, farmer_code)")
    .order("paid_on", { ascending: false }).limit(50);
  const rows = (data ?? []) as unknown as { id: string; amount: number; paid_on: string; method: string | null; reference: string | null; status: string; farmer_id: string; profiles: { full_name: string; farmer_code: string } | null }[];

  return (
    <>
      <PageHeader title="Payments" subtitle="Payments already stored in the database." />
      <Notice>Recording payments and managing milk rates are not built yet, so this page is read-only. Collection amounts stay marked as rate not set until rates exist.</Notice>
      <Card title="Latest payments">
        {error ? <LoadError what="payments" /> : rows.length === 0 ? (
          <Empty title="No payments recorded" hint="Payment records will be listed here once they exist in the database." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/70"><tr>
                <th scope="col" className={th}>Date</th><th scope="col" className={th}>Farmer</th><th scope="col" className={`${th} text-right`}>Amount</th>
                <th scope="col" className={`${th} hidden sm:table-cell`}>Method</th><th scope="col" className={`${th} hidden md:table-cell`}>Reference</th><th scope="col" className={th}>Status</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((p) => (
                  <tr key={p.id} className="transition hover:bg-slate-50/70">
                    <td className={`${td} text-slate-700`}>{new Date(p.paid_on).toLocaleDateString(undefined, { dateStyle: "medium" })}</td>
                    <td className={td}><Link href={`/admin/farmers/${p.farmer_id}`} className="font-medium text-slate-900 hover:text-emerald-700 hover:underline">{p.profiles?.full_name ?? "Unknown"}</Link> <span className="font-mono text-xs text-slate-500">{p.profiles?.farmer_code}</span></td>
                    <td className={`${td} text-right font-medium tabular-nums`}>{Number(p.amount).toFixed(2)}</td>
                    <td className={`${td} hidden text-slate-600 sm:table-cell`}>{p.method ?? "-"}</td>
                    <td className={`${td} hidden font-mono text-xs text-slate-600 md:table-cell`}>{p.reference ?? "-"}</td>
                    <td className={td}><Badge status={p.status === "paid" ? "approved" : p.status === "failed" ? "suspended" : "pending"} label={p.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
