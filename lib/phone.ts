// Farmers sign up with phone + password; Supabase Auth needs a deliverable-looking email
// (it rejects domains without MX records), so derive a plus-alias of one real mailbox.
// With "Confirm email" off, nothing is ever sent to it.
const [local, domain] = (process.env.FARMER_EMAIL_MAILBOX ?? "").split("@");

export const normalizePhone = (s: string) => s.replace(/\D/g, "");

export const phoneToEmail = (phone: string) => `${local}+${normalizePhone(phone)}@${domain}`;

// Admins log in with a real email; farmers with their phone number.
export const identifierToEmail = (id: string) =>
  id.includes("@") ? id.trim().toLowerCase() : phoneToEmail(id);
