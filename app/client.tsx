"use client";

import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { Check, Copy, Loader2 } from "lucide-react";
import { btn } from "./styles";

// Disables itself and shows a spinner while its parent form's server action runs.
export function SubmitButton({ children, pending: label, className = btn.primary, ...rest }: {
  children: React.ReactNode; pending?: string; className?: string; name?: string; value?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button {...rest} disabled={pending} className={className}>
      {pending && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {pending && label ? label : children}
    </button>
  );
}

// Opens a confirmation dialog before running a server action (used for suspending a farmer).
export function ConfirmAction({ action, fields, trigger, title, description, confirm }: {
  action: (form: FormData) => void | Promise<void>;
  fields: Record<string, string>;
  trigger: string; title: string; description: string; confirm: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button type="button" onClick={() => ref.current?.showModal()} className={btn.dangerGhost}>{trigger}</button>
      <dialog ref={ref} className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl p-0 shadow-xl">
        <form action={action} onSubmit={() => ref.current?.close()} className="p-6">
          {Object.entries(fields).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <p className="mt-2 text-sm text-slate-600">{description}</p>
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={() => ref.current?.close()} className={btn.secondary}>Cancel</button>
            <button className={btn.danger}>{confirm}</button>
          </div>
        </form>
      </dialog>
    </>
  );
}

// Copies the farmer's collection code; falls back to a message if the clipboard is blocked.
export function CopyCode({ code }: { code: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setState("copied");
    } catch {
      setState("failed");
    }
    setTimeout(() => setState("idle"), 2000);
  }
  return (
    <button type="button" onClick={copy} className={btn.secondary} aria-label="Copy collection code">
      {state === "copied" ? <Check className="size-4 text-emerald-600" aria-hidden /> : <Copy className="size-4" aria-hidden />}
      <span aria-live="polite">{state === "copied" ? "Copied" : state === "failed" ? "Copy not allowed" : "Copy"}</span>
    </button>
  );
}
