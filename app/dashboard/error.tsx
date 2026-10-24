"use client";

import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { btn } from "../styles";

// Shown when the dashboard throws (for example the profile could not be loaded).
export default function DashboardError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-4 text-center">
      <div className="mb-4 grid size-14 place-items-center rounded-full bg-rose-50 text-rose-600"><AlertCircle className="size-7" aria-hidden /></div>
      <h1 className="text-xl font-semibold text-slate-900">We could not load your dashboard</h1>
      <p className="mt-2 text-slate-600">Something went wrong while loading your records. Your data is safe. Please try again.</p>
      <div className="mt-6 flex gap-3">
        <button onClick={reset} className={btn.primary}>Try again</button>
        <Link href="/login" className={btn.secondary}>Back to login</Link>
      </div>
    </div>
  );
}
