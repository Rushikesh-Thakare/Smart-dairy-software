import Link from "next/link";
import { AlertCircle, Inbox, LogOut, Milk, type LucideIcon } from "lucide-react";
import { logout } from "./actions";
import { btn } from "./styles";

export { btn };

export const Logo = ({ href = "/" }: { href?: string }) => (
  <Link href={href} className="inline-flex items-center gap-2.5 font-semibold text-slate-900">
    <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-sm">
      <Milk className="size-5" aria-hidden />
    </span>
    Smart Dairy
  </Link>
);

export const Field = ({ label, icon: Icon, ...props }: { label: string; icon: LucideIcon } & React.ComponentProps<"input">) => (
  <label className="block text-sm font-medium text-slate-700">
    {label}
    <span className="relative mt-1.5 block">
      <Icon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-500" aria-hidden />
      <input
        {...props}
        className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3.5 text-slate-900 shadow-sm transition placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/15"
      />
    </span>
  </label>
);

export const Alert = ({ children }: { children: React.ReactNode }) => (
  <p role="alert" className="mb-5 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-700">
    <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
    {children}
  </p>
);

const tones = {
  approved: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  pending: "bg-amber-50 text-amber-700 ring-amber-600/20",
  suspended: "bg-rose-50 text-rose-700 ring-rose-600/20",
} as const;
export const Badge = ({ status, label }: { status: string; label?: string }) => (
  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ring-1 ring-inset ${tones[status as keyof typeof tones] ?? "bg-slate-100 text-slate-700 ring-slate-500/20"}`}>
    {label ?? status}
  </span>
);

export const Card = ({ title, action, children }: { title?: string; action?: React.ReactNode; children: React.ReactNode }) => (
  <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
    {title && (
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
        <h2 className="font-semibold text-slate-900">{title}</h2>
        {action}
      </div>
    )}
    {children}
  </section>
);

export const Stat = ({ label, value, icon: Icon, note, children }: { label: string; value?: string; icon: LucideIcon; note?: string; children?: React.ReactNode }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md sm:p-5">
    <div className="mb-3 grid size-9 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
      <Icon className="size-5" aria-hidden />
    </div>
    <div className="text-sm text-slate-500">{label}</div>
    <div className="mt-0.5 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">{children ?? value}</div>
    {note && <div className="mt-1 text-xs text-slate-500">{note}</div>}
  </div>
);

export const Empty = ({ title, hint }: { title: string; hint: string }) => (
  <div className="flex flex-col items-center px-6 py-12 text-center">
    <div className="mb-3 grid size-12 place-items-center rounded-full bg-slate-100 text-slate-500"><Inbox className="size-6" aria-hidden /></div>
    <p className="font-medium text-slate-900">{title}</p>
    <p className="mt-1 max-w-sm text-sm text-slate-500">{hint}</p>
  </div>
);

export const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse rounded-xl bg-slate-200/70 ${className}`} />
);

const initials = (name: string) => name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");

export const Shell = ({ title, subtitle, role, user, nav, children }: {
  title?: string; subtitle?: string; role?: string; user?: string; nav?: readonly (readonly [string, string])[]; children: React.ReactNode;
}) => (
  <div className="flex min-h-screen flex-col">
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Logo href={role === "admin" ? "/admin" : "/dashboard"} />
          {role && <span className="hidden rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium capitalize text-slate-600 sm:inline">{role}</span>}
        </div>
        <div className="flex items-center gap-2">
          {user && (
            <div className="flex items-center gap-2.5 pr-1">
              <span className="grid size-9 place-items-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-800" aria-hidden>{initials(user)}</span>
              <span className="hidden max-w-40 truncate text-sm font-medium text-slate-700 sm:block">{user}</span>
            </div>
          )}
          <form action={logout}>
            <button className={`${btn.ghost} px-3 py-2`} aria-label="Log out"><LogOut className="size-4" aria-hidden /><span className="hidden sm:inline">Log out</span></button>
          </form>
        </div>
      </div>
      {nav && (
        <nav aria-label="Sections" className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-2 sm:px-6">
          {nav.map(([label, href]) => (
            <a key={href} href={href} className="whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-700">{label}</a>
          ))}
        </nav>
      )}
    </header>
    <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
      {title && (
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
          {subtitle && <p className="mt-1 text-slate-500">{subtitle}</p>}
        </div>
      )}
      {children}
    </main>
  </div>
);

export const AuthLayout = ({ title, subtitle, footer, children }: { title: string; subtitle: string; footer: React.ReactNode; children: React.ReactNode }) => (
  <div className="grid min-h-screen lg:grid-cols-2">
    <aside className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-emerald-700 via-emerald-800 to-slate-900 p-12 text-white lg:flex">
      <div className="absolute -right-24 -top-24 size-96 rounded-full bg-emerald-400/10 blur-3xl" />
      <Link href="/" className="relative inline-flex items-center gap-2.5 font-semibold">
        <span className="grid size-9 place-items-center rounded-xl bg-white/15"><Milk className="size-5" aria-hidden /></span>
        Smart Dairy
      </Link>
      <div className="relative">
        <h2 className="max-w-md text-3xl font-semibold leading-tight tracking-tight">Every litre, measured and recorded.</h2>
        <p className="mt-3 max-w-md text-emerald-50">Farmers see their own collections. Admins manage farmers, approvals and records.</p>
      </div>
      <p className="relative text-sm text-emerald-100">Secure sign-in with row-level data isolation.</p>
    </aside>
    <main id="main" className="flex items-center justify-center px-4 py-12 sm:px-8">
      <div className="w-full max-w-sm">
        <div className="mb-8 lg:hidden"><Logo /></div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
        <p className="mb-8 mt-1.5 text-slate-500">{subtitle}</p>
        {children}
        <p className="mt-6 text-center text-sm text-slate-500">{footer}</p>
      </div>
    </main>
  </div>
);

const th = "whitespace-nowrap px-2.5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6";
const td = "whitespace-nowrap px-2.5 py-3.5 sm:px-6";

export const tableStyles = { th, td };
