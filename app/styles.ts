const base =
  "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:cursor-not-allowed disabled:opacity-60";
export const btn = {
  primary: `${base} bg-emerald-700 text-white shadow-sm hover:bg-emerald-800 hover:shadow`,
  secondary: `${base} border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50`,
  ghost: `${base} text-slate-600 hover:bg-slate-100`,
  soft: `${base} bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-3 py-1.5`,
  danger: `${base} bg-rose-700 text-white shadow-sm hover:bg-rose-800`,
  dangerGhost: `${base} px-3 py-1.5 text-rose-700 hover:bg-rose-50`,
};
