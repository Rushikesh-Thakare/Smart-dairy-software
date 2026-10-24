import Link from "next/link";
import { Logo } from "./ui";
import { btn } from "./styles";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <main id="main" className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-emerald-50 to-white px-4 text-center">
      <Logo />
      <p className="mt-10 text-sm font-semibold uppercase tracking-wider text-emerald-700">Error 404</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Page not found</h1>
      <p className="mt-3 max-w-md text-slate-600">The page you are looking for does not exist, or you do not have access to it.</p>
      <div className="mt-8 flex gap-3">
        <Link href="/" className={btn.primary}>Go to homepage</Link>
        <Link href="/login" className={btn.secondary}>Log in</Link>
      </div>
    </main>
  );
}
