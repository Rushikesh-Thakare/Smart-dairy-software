import Link from "next/link";
import { Lock, Phone, User } from "lucide-react";
import { register } from "../actions";
import { SubmitButton } from "../client";
import { flash } from "@/lib/messages";
import { Alert, AuthLayout, Field } from "../ui";

export default async function Register({ searchParams }: PageProps<"/register">) {
  const { error } = await searchParams;
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Register as a farmer to receive your four-digit collection code."
      footer={<>Already registered? <Link href="/login" className="font-semibold text-emerald-700 hover:underline">Log in</Link></>}
    >
      {flash(error) && <Alert>{flash(error)}</Alert>}
      <form action={register} className="flex flex-col gap-5">
        <Field label="Full name" icon={User} name="name" required minLength={2} maxLength={100} autoComplete="name" />
        <Field label="Phone number" icon={Phone} name="phone" type="tel" required autoComplete="tel" />
        <Field label="Password (min 8 characters)" icon={Lock} name="password" type="password" required minLength={8} autoComplete="new-password" />
        <SubmitButton pending="Creating account...">Register</SubmitButton>
      </form>
    </AuthLayout>
  );
}
