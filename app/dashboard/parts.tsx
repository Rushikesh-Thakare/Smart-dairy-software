import { AlertCircle, CircleCheck, Hourglass, ShieldAlert, type LucideIcon } from "lucide-react";
import { Badge, Empty, tableStyles } from "../ui";

const { th, td } = tableStyles;
export const DateOnly = ({ iso }: { iso: string }) => {
  const d = new Date(iso);
  return <><span className="sm:hidden">{d.toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span><span className="hidden sm:inline">{d.toLocaleDateString(undefined, { dateStyle: "medium" })}</span></>;
};

export const When = ({ iso }: { iso: string }) => {
  const d = new Date(iso);
  return <>{d.toLocaleDateString(undefined, { dateStyle: "medium" })}<span className="hidden text-slate-500 sm:inline"> · {d.toLocaleTimeString(undefined, { timeStyle: "short" })}</span></>;
};

export type FarmerCollection = {
  id: string; collected_at: string; quantity_litres: number; fat_tenths: number | null;
  rate_per_litre: number | null; total_amount: number | null; cattle_type: string | null; snf_tenths: number | null;
};
export type Payment = { id: string; amount: number; paid_on: string; method: string | null; reference: string | null; status: string };

export const LoadError = ({ what }: { what: string }) => (
  <div role="alert" className="flex items-start gap-3 px-6 py-8 text-sm text-rose-700">
    <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
    <span>We could not load {what}. Please refresh the page. If this keeps happening, contact the dairy admin.</span>
  </div>
);

const statusInfo: Record<string, { icon: LucideIcon; tone: string; text: string }> = {
  approved: { icon: CircleCheck, tone: "text-emerald-300", text: "Your collections are being recorded." },
  pending: { icon: Hourglass, tone: "text-amber-300", text: "Waiting for admin approval. Collections can be recorded once you are approved." },
  suspended: { icon: ShieldAlert, tone: "text-rose-300", text: "Please contact the dairy admin." },
};
export const StatusLine = ({ status }: { status: string }) => {
  const { icon: Icon, tone, text } = statusInfo[status] ?? statusInfo.pending;
  return (
    <div className="flex items-start gap-2.5 rounded-xl bg-black/25 px-3.5 py-2.5 text-sm text-white">
      <Icon className={`mt-0.5 size-4 shrink-0 ${tone}`} aria-hidden />
      <span><span className="font-semibold capitalize">{status}.</span> {text}</span>
    </div>
  );
};

export const FarmerCollections = ({ rows }: { rows: FarmerCollection[] }) =>
  rows.length === 0 ? (
    <Empty title="No collections yet" hint="When your milk is collected, each record shows up here with its quantity and fat reading. Give your collection code to the operator." />
  ) : (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50/70"><tr>
          <th scope="col" className={th}>Date</th><th scope="col" className={`${th} text-right`}>Litres</th><th scope="col" className={`${th} text-right`}>Fat %</th>
          <th scope="col" className={`${th} hidden sm:table-cell`}>Details</th><th scope="col" className={`${th} hidden sm:table-cell text-right`}>Rate</th><th scope="col" className={`${th} text-right`}>Amount</th>
        </tr></thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((r) => {
            const details = [r.cattle_type, r.snf_tenths != null && `SNF ${(r.snf_tenths / 10).toFixed(1)}%`].filter(Boolean).join(" · ");
            return (
              <tr key={r.id} className="transition hover:bg-slate-50/70">
                <td className={`${td} text-slate-700`}><When iso={r.collected_at} /></td>
                <td className={`${td} text-right font-medium tabular-nums`}>{Number(r.quantity_litres).toFixed(2)}</td>
                <td className={`${td} text-right tabular-nums`}>{r.fat_tenths == null ? "-" : (r.fat_tenths / 10).toFixed(1)}</td>
                <td className={`${td} hidden text-slate-600 sm:table-cell`}>{details || "-"}</td>
                <td className={`${td} hidden text-right tabular-nums sm:table-cell`}>{r.rate_per_litre == null ? <span className="text-slate-500">Not set</span> : Number(r.rate_per_litre).toFixed(2)}</td>
                <td className={`${td} text-right tabular-nums`}>{r.total_amount == null ? <span className="text-slate-500">Pending rate</span> : Number(r.total_amount).toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

export const PaymentHistory = ({ rows }: { rows: Payment[] }) =>
  rows.length === 0 ? (
    <Empty title="No payments recorded" hint="Payments made to you by the dairy will be listed here." />
  ) : (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50/70"><tr>
          <th scope="col" className={th}>Date</th><th scope="col" className={`${th} text-right`}>Amount</th><th scope="col" className={`${th} hidden sm:table-cell`}>Method</th><th scope="col" className={`${th} hidden sm:table-cell`}>Reference</th><th scope="col" className={th}>Status</th>
        </tr></thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((p) => (
            <tr key={p.id} className="transition hover:bg-slate-50/70">
              <td className={`${td} text-slate-700`}><DateOnly iso={p.paid_on} /></td>
              <td className={`${td} text-right font-medium tabular-nums`}>{Number(p.amount).toFixed(2)}</td>
              <td className={`${td} hidden text-slate-600 sm:table-cell`}>{p.method ?? "-"}</td>
              <td className={`${td} hidden font-mono text-xs text-slate-600 sm:table-cell`}>{p.reference ?? "-"}</td>
              <td className={td}><Badge status={p.status === "paid" ? "approved" : p.status === "failed" ? "suspended" : "pending"} label={p.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
