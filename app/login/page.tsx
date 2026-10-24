import Link from "next/link";
import { Lock, Phone } from "lucide-react";
import { login } from "../actions";
import { SubmitButton } from "../client";
import { flash } from "@/lib/messages";
import { Alert, AuthLayout, Field } from "../ui";

export default async function Login({ searchParams }: PageProps<"/login">) {
  const { error } = await searchParams;
  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to your Smart Dairy account."
      footer={<>New farmer? <Link href="/register" className="font-semibold text-emerald-700 hover:underline">Register</Link></>}
    >
      {flash(error) && <Alert>{flash(error)}</Alert>}
      <form action={login} className="flex flex-col gap-5">
        <Field label="Phone number (admins: email)" icon={Phone} name="identifier" required autoComplete="username" />
        <Field label="Password" icon={Lock} name="password" type="password" required autoComplete="current-password" />
        <SubmitButton pending="Signing in...">Log in</SubmitButton>
      </form>
    </AuthLayout>
  );
}
