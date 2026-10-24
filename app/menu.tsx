"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

// Mobile navigation: closes after choosing a link or pressing Escape.
export function MobileMenu({ items }: { items: readonly (readonly [string, string])[] }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);
  return (
    <div className="relative md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen(!open)}
        className="grid size-10 place-items-center rounded-lg text-slate-700 hover:bg-slate-100"
      >
        {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
      </button>
      {open && (
        <div id="mobile-menu" className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg">
          {items.map(([label, href]) => (
            <Link key={label} href={href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">{label}</Link>
          ))}
        </div>
      )}
    </div>
  );
}
