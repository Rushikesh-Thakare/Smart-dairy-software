import Link from "next/link";
import { CircleCheck } from "lucide-react";
import { requireAdmin } from "@/lib/admin";
import { flash } from "@/lib/messages";
import { saveReading } from "../../actions";
import { AutoRefresh, SubmitButton } from "../../client";
import { When } from "../../dashboard/parts";
import { Alert, Card, Empty, tableStyles } from "../../ui";
import { LoadError, Notice, PageHeader } from "../parts";

const { th, td } = tableStyles;

export const metadata = { title: "FPGA readings" };

type Waiting = { id: string; opened_at: string; fat_tenths: number; farmer_id: string; profiles: { full_name: string; farmer_code: string } | null };

export default async function Readings({ searchParams }: PageProps<"/admin/readings">) {
  const { supabase } = await requireAdmin();
  const { error: flashCode, saved } = await searchParams;
  // A reading is an open session that carries a fat value from the FPGA and has no quantity yet.
  const { data, error } = await supabase.from("collection_sessions")
    .select("id, opened_at, fat_tenths, farmer_id, profiles(full_name, farmer_code)")
    .eq("status", "open").not("fat_tenths", "is", null).gt("expires_at", new Date().toISOString())
    .order("opened_at", { ascending: false }).limit(50);
  const rows = (data ?? []) as unknown as Waiting[];

  return (
    <>
      <AutoRefresh seconds={10} />
      <PageHeader title="FPGA readings" subtitle="Fat readings sent by the collection point, waiting for a quantity." />
      {flash(flashCode) && <Alert>{flash(flashCode)}</Alert>}
      {saved && (
        <p role="status" className="mb-5 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-sm text-emerald-800">
          <CircleCheck className="mt-0.5 size-4 shrink-0" aria-hidden />Collection saved.
        </p>
      )}
      <Notice>The farmer code and fat come from the FPGA. Type the measured quantity in litres to save the collection. A reading that gets no quantity within 30 minutes expires, and a newer reading for the same farmer replaces it.</Notice>
      <Card>
        {error ? <LoadError what="FPGA readings" /> : rows.length === 0 ? (
          <Empty title="No readings waiting" hint="When the FPGA sends a farmer code and fat value, it will appear here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/70"><tr>
                <th scope="col" className={th}>Received</th><th scope="col" className={th}>Farmer</th>
                <th scope="col" className={`${th} text-right`}>Fat %</th><th scope="col" className={th}>Quantity (litres)</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td className={`${td} text-slate-700`}><When iso={r.opened_at} /></td>
                    <td className="px-2.5 py-3.5 sm:px-6">
                      <Link href={`/admin/farmers/${r.farmer_id}`} className="inline-block py-1 font-medium text-slate-900 hover:text-emerald-700 hover:underline">{r.profiles?.full_name ?? "Unknown"}</Link>{" "}
                      <span className="block font-mono text-xs text-slate-500 sm:inline">{r.profiles?.farmer_code}</span>
                    </td>
                    <td className={`${td} text-right font-medium tabular-nums`}>{(r.fat_tenths / 10).toFixed(1)}</td>
                    <td className="px-2.5 py-2 sm:px-6">
                      <form action={saveReading} className="flex items-center gap-2">
                        <input type="hidden" name="id" value={r.id} />
                        <input
                          name="quantity" required inputMode="decimal" autoComplete="off" placeholder="e.g. 4.50"
                          aria-label={`Quantity in litres for ${r.profiles?.full_name ?? "farmer"} ${r.profiles?.farmer_code ?? ""}`}
                          className="w-28 rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/15"
                        />
                        <SubmitButton pending="Saving...">Save</SubmitButton>
                      </form>
                    </td>
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
