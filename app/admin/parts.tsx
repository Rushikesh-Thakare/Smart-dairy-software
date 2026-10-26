import Link from "next/link";
import { AlertCircle, ChevronLeft, ChevronRight, Info } from "lucide-react";
import { setStatus } from "../actions";
import { ConfirmAction, SubmitButton } from "../client";
import { btn } from "../styles";
import { Empty, tableStyles } from "../ui";
import { When } from "../dashboard/parts";

const { th, td } = tableStyles;

export const PageHeader = ({ title, subtitle, back, children }: { title: string; subtitle?: string; back?: { href: string; label: string }; children?: React.ReactNode }) => (
  <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
    <div>
      {back && <Link href={back.href} className="mb-2 inline-flex items-center gap-1 py-1 text-sm font-medium text-emerald-700 hover:underline"><ChevronLeft className="size-4" aria-hidden />{back.label}</Link>}
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
      {subtitle && <p className="mt-1 text-slate-500">{subtitle}</p>}
    </div>
    {children}
  </div>
);

export const LoadError = ({ what }: { what: string }) => (
  <div role="alert" className="flex items-start gap-3 px-6 py-8 text-sm text-rose-700">
    <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
    <span>We could not load {what}. Please refresh the page. If this keeps happening, check the Supabase connection.</span>
  </div>
);

export const Notice = ({ children }: { children: React.ReactNode }) => (
  <div className="mb-6 flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
    <Info className="mt-0.5 size-4 shrink-0 text-slate-500" aria-hidden />
    <span>{children}</span>
  </div>
);

export type Daily = { day: string; collections: number };

export function ActivityChart({ daily }: { daily: Daily[] }) {
  const max = Math.max(0, ...daily.map((d) => d.collections));
  if (max === 0) return <Empty title="No collections in this period" hint={`Collections over the last ${daily.length} days will be charted here.`} />;
  const label = (day: string) => new Date(`${day}T00:00:00`).toLocaleDateString(undefined, { day: "numeric", month: "short" });
  const total = daily.reduce((s, d) => s + d.collections, 0);
  return (
    <div className="px-5 pb-5 pt-4 sm:px-6">
      <p className="mb-4 text-sm text-slate-500">
        Collections per day, last {daily.length} days: <span className="font-medium text-slate-900">{total}</span>. Busiest day {max}.
      </p>
      <div role="img" aria-label={`Collections per day over the last ${daily.length} days, busiest day ${max}`} className="flex h-44 items-end gap-1.5 border-b border-slate-200 sm:gap-2">
        {daily.map((d) => (
          <div key={d.day} title={`${label(d.day)}: ${d.collections} collection${d.collections === 1 ? "" : "s"}`} className="group flex h-full flex-1 flex-col justify-end">
            <div className="rounded-t-md bg-gradient-to-t from-emerald-600 to-emerald-400 transition group-hover:from-emerald-700 group-hover:to-emerald-500" style={{ height: `${d.collections > 0 ? Math.max((d.collections / max) * 100, 3) : 0}%` }} />
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-1.5 text-[10px] text-slate-500 sm:gap-2 sm:text-xs" aria-hidden>
        {daily.map((d, i) => (
          <span key={d.day} className={`flex-1 truncate text-center ${i % 2 ? "invisible sm:visible" : ""}`}><span className="sm:hidden">{Number(d.day.slice(8))}</span><span className="hidden sm:inline">{label(d.day)}</span></span>
        ))}
      </div>
    </div>
  );
}

export type AdminRow = {
  id: string; collected_at: string; fat_tenths: number | null;
  cattle_type?: string | null; snf_tenths?: number | null; farmer_id: string; profiles: { full_name: string; farmer_code: string } | null;
};

export const AdminCollections = ({ rows }: { rows: AdminRow[] }) =>
  rows.length === 0 ? (
    <Empty title="No collections found" hint="Collections recorded at the collection point will appear here." />
  ) : (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50/70"><tr>
          <th scope="col" className={th}>Date</th><th scope="col" className={th}>Farmer</th>
          <th scope="col" className={`${th} text-right`}>Fat %</th><th scope="col" className={`${th} hidden md:table-cell`}>Details</th>
        </tr></thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((r) => {
            const details = [r.cattle_type, r.snf_tenths != null && `SNF ${(r.snf_tenths / 10).toFixed(1)}%`].filter(Boolean).join(" · ");
            return (
              <tr key={r.id} className="transition hover:bg-slate-50/70">
                <td className={`${td} text-slate-700`}><When iso={r.collected_at} /></td>
                <td className="px-2.5 py-3.5 sm:px-6">
                  <Link href={`/admin/farmers/${r.farmer_id}`} className="inline-block py-1 font-medium text-slate-900 hover:text-emerald-700 hover:underline">{r.profiles?.full_name ?? "Unknown"}</Link>{" "}
                  <span className="block font-mono text-xs text-slate-500 sm:inline">{r.profiles?.farmer_code}</span>
                </td>
                <td className={`${td} text-right font-medium tabular-nums`}>{r.fat_tenths == null ? "-" : (r.fat_tenths / 10).toFixed(1)}</td>
                <td className={`${td} hidden text-slate-600 md:table-cell`}>{details || "-"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

// Server actions re-check the admin role; these buttons only trigger them.
export const FarmerActions = ({ id, name, status }: { id: string; name: string; status: string }) => (
  <div className="flex flex-col items-end gap-1 sm:flex-row sm:items-center sm:justify-end">
    {status !== "approved" && (
      <form action={setStatus}>
        <input type="hidden" name="id" value={id} />
        <SubmitButton name="status" value="approved" pending="Saving..." className={btn.soft}>{status === "suspended" ? "Reinstate" : "Approve"}</SubmitButton>
      </form>
    )}
    {status !== "suspended" && (
      <ConfirmAction
        action={setStatus}
        fields={{ id, status: "suspended" }}
        trigger="Suspend"
        title={`Suspend ${name}?`}
        description="They will no longer be able to have collections recorded until they are approved again."
        confirm="Suspend farmer"
      />
    )}
  </div>
);

export function Pager({ base, page, pages, total, from, to }: { base: string; page: number; pages: number; total: number; from: number; to: number }) {
  if (total === 0) return null;
  const href = (p: number) => `${base}${base.includes("?") ? "&" : "?"}page=${p}`;
  const link = "inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium";
  return (
    <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-sm text-slate-500 sm:px-6">
      <span>Showing {from}-{to} of {total}</span>
      <div className="flex gap-2">
        {page > 1 ? <Link href={href(page - 1)} className={`${link} text-slate-700 hover:bg-slate-50`}><ChevronLeft className="size-4" aria-hidden />Previous</Link> : <span aria-disabled="true" className={`${link} text-slate-500 opacity-60`}>Previous</span>}
        {page < pages ? <Link href={href(page + 1)} className={`${link} text-slate-700 hover:bg-slate-50`}>Next<ChevronRight className="size-4" aria-hidden /></Link> : <span aria-disabled="true" className={`${link} text-slate-500 opacity-60`}>Next</span>}
      </div>
    </div>
  );
}
