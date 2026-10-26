// Auth error banners are looked up by code, so a crafted ?error= URL can never show attacker-chosen text.
const messages = {
  name: "Enter your full name.",
  phone: "Enter a valid phone number (10-15 digits).",
  password: "Password must be at least 8 characters.",
  exists: "This phone is already registered.",
  weak: "Choose a stronger password.",
  rate: "Too many attempts. Please wait a few minutes and try again.",
  confirm: "Registration needs 'Confirm email' turned off in Supabase Auth settings.",
  register: "Could not register. Please try again.",
  auth: "Wrong phone/email or password.",
  quantity: "Enter the quantity in litres: more than 0, up to 500, at most 2 decimals.",
  reading: "That reading is no longer waiting. It was already saved, replaced by a newer one, or expired.",
  save: "Could not save the collection. Please try again.",
} as const;

export type MessageCode = keyof typeof messages;

export const flash = (code: string | string[] | undefined) =>
  typeof code === "string" && Object.hasOwn(messages, code) ? messages[code as MessageCode] : undefined;
