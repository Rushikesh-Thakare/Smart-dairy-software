"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CreditCard, Droplets, LayoutDashboard, Radio, Users } from "lucide-react";

const items = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/farmers", label: "Farmers", icon: Users },
  { href: "/admin/collections", label: "Milk Collections", icon: Droplets },
  { href: "/admin/readings", label: "FPGA Readings", icon: Radio },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
];

// Highlights the current section; purely visual, access is enforced on the server.
export function AdminNav({ horizontal }: { horizontal?: boolean }) {
  const path = usePathname();
  return (
    <nav aria-label="Admin sections" className={horizontal ? "flex gap-1 overflow-x-auto px-4 pb-2 sm:px-6" : "flex flex-col gap-1 px-3"}>
      {items.map(({ href, label, icon: Icon }) => {
        const active = href === "/admin" ? path === href : path.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-2.5 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium transition ${
              active ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <Icon className={`size-4 ${active ? "text-emerald-600" : "text-slate-500"}`} aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
