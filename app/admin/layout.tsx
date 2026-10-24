import { LogOut } from "lucide-react";
import { requireAdmin } from "@/lib/admin";
import { logout } from "../actions";
import { btn } from "../styles";
import { Logo } from "../ui";
import { AdminNav } from "./nav";

const initials = (name: string) => name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const { profile } = await requireAdmin(); // non-admins get a 404 before anything renders
  const today = new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  return (
    <div className="min-h-screen lg:flex">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white lg:flex">
        <div className="flex h-16 items-center px-6"><Logo href="/admin" /></div>
        <div className="mt-2 flex-1"><AdminNav /></div>
        <p className="border-t border-slate-100 px-6 py-4 text-xs text-slate-500">Dairy operations panel</p>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/85 backdrop-blur">
          <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
            <div className="lg:hidden"><Logo href="/admin" /></div>
            <p className="hidden text-sm font-medium text-slate-500 lg:block">{today}</p>
            <div className="flex items-center gap-2">
              <p className="hidden text-xs text-slate-500 sm:block lg:hidden">{today}</p>
              <span className="grid size-9 place-items-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-800" aria-hidden>{initials(profile.full_name)}</span>
              <div className="hidden leading-tight sm:block">
                <p className="max-w-40 truncate text-sm font-medium text-slate-800">{profile.full_name}</p>
                <p className="text-xs text-slate-500">Administrator</p>
              </div>
              <form action={logout}>
                <button className={`${btn.ghost} px-3 py-2`} aria-label="Log out"><LogOut className="size-4" aria-hidden /><span className="hidden md:inline">Log out</span></button>
              </form>
            </div>
          </div>
          <div className="lg:hidden"><AdminNav horizontal /></div>
        </header>
        <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
