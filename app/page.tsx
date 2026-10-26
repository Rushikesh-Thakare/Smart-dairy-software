import Link from "next/link";
import {
  ArrowRight, BarChart3, ChevronDown, ClipboardList, Database, FlaskConical, KeyRound, LayoutDashboard,
  Lock, Milk, Scale, ShieldCheck, Sprout, UserCheck, Wallet, type LucideIcon,
} from "lucide-react";
import { HeroArt } from "./hero-art";
import { MobileMenu } from "./menu";
import { Logo, btn } from "./ui";

const links = [
  ["Home", "/"],
  ["Features", "#features"],
  ["How It Works", "#how-it-works"],
] as const;

const features: [LucideIcon, string, string][] = [
  [Milk, "Digital milk collection", "Each collection is recorded digitally with its date, fat reading and the farmer it belongs to."],
  [ClipboardList, "Farmer records", "Every farmer has an account and a four-digit collection code, with their full collection history in one place."],
  [FlaskConical, "Fat measurement", "The fat reading for each collection is stored and shown as a percentage."],
  [Wallet, "Payment records", "Payments recorded by the dairy appear in the farmer's payment history."],
  [ShieldCheck, "Secure record management", "Sign-in is authenticated and row-level security keeps each farmer's records private to them and to admins."],
];

const workflow: [LucideIcon, string, string][] = [
  [KeyRound, "Farmer ID", "The farmer's four-digit code identifies them at the collection point."],
  [Scale, "Milk Measurement", "The fat is estimated from the sensor reading."],
  [Database, "Digital Record", "The confirmed measurement is saved once as a secure record."],
  [LayoutDashboard, "Farmer Dashboard", "The record appears on the farmer's dashboard and in the admin overview."],
];

const benefits = {
  farmers: ["See your own collections and fat readings", "See the payments recorded for you", "Your records are visible only to you and the dairy admin", "Log in with just your phone number"],
  admins: ["Approve or suspend farmers from one list", "Review every collection across all farmers", "See summary counts at a glance", "Admin access is controlled, never granted at registration"],
};

function Navbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {links.map(([label, href]) => (
            <Link key={label} href={href} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900">{label}</Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <Link href="/login" className={btn.ghost}>Login</Link>
          <Link href="/register" className={btn.primary}>Register</Link>
        </div>
        <MobileMenu items={[...links, ["Login", "/login"], ["Register", "/register"]]} />
      </div>
    </header>
  );
}

const Heading = ({ eyebrow, title, text, light }: { eyebrow: string; title: string; text?: string; light?: boolean }) => (
  <div className="mx-auto max-w-2xl text-center">
    <span className={`text-sm font-semibold uppercase tracking-wider ${light ? "text-emerald-300" : "text-emerald-700"}`}>{eyebrow}</span>
    <h2 className={`mt-2 text-3xl font-semibold tracking-tight sm:text-4xl ${light ? "text-white" : "text-slate-900"}`}>{title}</h2>
    {text && <p className={`mt-3 text-lg ${light ? "text-slate-300" : "text-slate-600"}`}>{text}</p>}
  </div>
);

const BenefitList = ({ icon: Icon, title, items }: { icon: LucideIcon; title: string; items: string[] }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
    <div className="mb-5 flex items-center gap-3">
      <span className="grid size-11 place-items-center rounded-xl bg-emerald-50 text-emerald-600"><Icon className="size-6" aria-hidden /></span>
      <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
    </div>
    <ul className="space-y-3">
      {items.map((t) => (
        <li key={t} className="flex gap-3 text-slate-600">
          <span className="mt-2 size-1.5 shrink-0 rounded-full bg-emerald-500" aria-hidden />{t}
        </li>
      ))}
    </ul>
  </div>
);

export default function Home() {
  return (
    <div id="top" className="flex min-h-screen flex-col bg-white">
      <Navbar />
      <main id="main" className="flex-1">
        <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50 via-white to-white">
          <div className="absolute -left-32 -top-32 size-96 rounded-full bg-emerald-200/40 blur-3xl" aria-hidden />
          <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                <Sprout className="size-3.5" aria-hidden />Dairy management system
              </span>
              <h1 className="mt-6 text-4xl font-semibold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Smarter Milk Collection. <span className="text-emerald-700">Transparent Dairy Management.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
                Record every collection digitally and give each farmer a clear, private view of their collections and fat readings.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link href="/register" className={`${btn.primary} px-7 py-3.5 text-base`}>Get started<ArrowRight className="size-4" aria-hidden /></Link>
                <Link href="/login" className={`${btn.secondary} px-7 py-3.5 text-base`}>Login</Link>
              </div>
            </div>
            <div className="mx-auto w-full max-w-lg drop-shadow-xl"><HeroArt /></div>
          </div>
          <a href="#features" aria-label="Scroll to features" className="relative mx-auto mb-6 hidden w-fit text-slate-500 transition hover:text-emerald-700 lg:block"><ChevronDown className="size-6" aria-hidden /></a>
        </section>

        <section id="features" className="scroll-mt-20 mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <Heading eyebrow="Features" title="Everything a dairy collection point needs" text="Simple tools for farmers and administrators, built around the collection record." />
          <div className="mt-12 flex flex-wrap justify-center gap-6">
            {features.map(([Icon, title, text]) => (
              <div key={title} className="group basis-full rounded-2xl sm:basis-[calc(50%-0.75rem)] lg:basis-[calc(33.333%-1rem)] border border-slate-200 bg-white p-7 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg">
                <div className="mb-5 grid size-12 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-sm"><Icon className="size-6" aria-hidden /></div>
                <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                <p className="mt-2 leading-relaxed text-slate-600">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="scroll-mt-20 bg-slate-900">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <Heading light eyebrow="How it works" title="From farmer ID to farmer dashboard" text="One confirmed measurement becomes one secure record." />
            <ol className="mt-14 grid gap-4 md:grid-cols-4">
              {workflow.map(([Icon, title, text], i) => (
                <li key={title} className="relative">
                  <div className="h-full rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
                    <div className="flex items-center justify-between">
                      <span className="grid size-12 place-items-center rounded-xl bg-emerald-500 text-white"><Icon className="size-6" aria-hidden /></span>
                      <span className="text-sm font-semibold text-emerald-300">Step {i + 1}</span>
                    </div>
                    <h3 className="mt-5 text-lg font-semibold text-white">{title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-300">{text}</p>
                  </div>
                  {i < workflow.length - 1 && <ArrowRight className="absolute -right-3.5 top-1/2 z-10 hidden size-6 -translate-y-1/2 rounded-full bg-slate-900 p-1 text-emerald-400 md:block" aria-hidden />}
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <Heading eyebrow="Benefits" title="Clear for farmers, controlled for admins" />
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <BenefitList icon={UserCheck} title="For farmers" items={benefits.farmers} />
            <BenefitList icon={BarChart3} title="For dairy administrators" items={benefits.admins} />
          </div>
        </section>

        <section id="team" className="scroll-mt-20 border-y border-slate-200 bg-gradient-to-b from-emerald-50/60 to-white">
          <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
            <Heading eyebrow="Project team" title="Smart Dairy Management" />
            <div className="mt-8 space-y-3 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <p className="text-lg text-slate-600">Prepared by: <span className="font-semibold text-slate-900">Rushikesh Thakare and Akanksha Mane</span></p>
              <p className="text-lg text-slate-600">Under the guidance of: <span className="font-semibold text-slate-900">Dr. Prasant Kasambe</span></p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="rounded-3xl bg-gradient-to-br from-emerald-700 to-emerald-900 px-6 py-14 text-center shadow-lg sm:px-12">
            <Lock className="mx-auto size-8 text-emerald-200" aria-hidden />
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white">Ready to see your collections?</h2>
            <p className="mx-auto mt-3 max-w-xl text-emerald-100">Register as a farmer to receive your collection code, or log in to your dashboard.</p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/register" className={`${btn.secondary} px-7 py-3.5 text-base text-emerald-800`}>Register</Link>
              <Link href="/login" className={`${btn.ghost} px-7 py-3.5 text-base text-white hover:bg-white/10`}>Login</Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-900 text-slate-300">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <span className="inline-flex items-center gap-2.5 font-semibold text-white">
              <span className="grid size-9 place-items-center rounded-xl bg-emerald-600"><Milk className="size-5" aria-hidden /></span>Smart Dairy
            </span>
            <p className="mt-3 text-sm text-slate-400">Smart Dairy Management: digital milk collection records for farmers and dairy administrators.</p>
          </div>
          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-12 text-sm">
            {[...links, ["Team", "#team"], ["Login", "/login"], ["Register", "/register"]].map(([label, href]) => (
              <Link key={label} href={href} className="block py-1.5 transition hover:text-emerald-400">{label}</Link>
            ))}
          </nav>
        </div>
        <div className="border-t border-white/10 py-5 text-center text-xs text-slate-400">Smart Dairy Management</div>
      </footer>
    </div>
  );
}
