"use client";

import { AlertCircle } from "lucide-react";
import { btn } from "../styles";

// Renders inside the admin layout, so the sidebar stays usable.
export default function AdminError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-24 text-center">
      <div className="mb-4 grid size-14 place-items-center rounded-full bg-rose-50 text-rose-600"><AlertCircle className="size-7" aria-hidden /></div>
      <h1 className="text-xl font-semibold text-slate-900">Something went wrong</h1>
      <p className="mt-2 text-slate-600">This page could not be loaded. Your data is unchanged. Please try again.</p>
      <button onClick={reset} className={`${btn.primary} mt-6`}>Try again</button>
    </div>
  );
}
