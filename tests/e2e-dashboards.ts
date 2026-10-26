// End-to-end: API -> database -> dashboards. Writes ONE real collection (device "e2e") for FARMER_CODE.
// Needs the website running and: BRIDGE_API_KEY, FARMER_CODE (approved), ADMIN_EMAIL, ADMIN_PASSWORD.
// Optional farmer-side check: FARMER_LOGIN_EMAIL, FARMER_PASSWORD. Run: npm run e2e
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

const base = process.env.BASE_URL ?? "http://localhost:3000";
const { BRIDGE_API_KEY: key, FARMER_CODE: code, ADMIN_EMAIL, ADMIN_PASSWORD, NEXT_PUBLIC_SUPABASE_URL: sb, NEXT_PUBLIC_SUPABASE_ANON_KEY: anon } = process.env;
assert.ok(key && code && ADMIN_EMAIL && ADMIN_PASSWORD && sb && anon, "set BRIDGE_API_KEY, FARMER_CODE, ADMIN_EMAIL, ADMIN_PASSWORD (+ Supabase URL/anon key from .env.local)");
const ref = new URL(sb).hostname.split(".")[0];

async function cookieFor(email: string, password: string) {
  const r = await fetch(`${sb}/auth/v1/token?grant_type=password`, {
    method: "POST", headers: { apikey: anon!, "content-type": "application/json" }, body: JSON.stringify({ email, password }),
  });
  assert.equal(r.status, 200, `login failed for ${email}`);
  const value = "base64-" + Buffer.from(JSON.stringify(await r.json())).toString("base64url");
  return (value.match(/.{1,3000}/g) ?? []).map((v, i, a) => `sb-${ref}-auth-token${a.length > 1 ? "." + i : ""}=${v}`).join("; ");
}
const page = async (path: string, cookie: string) => {
  const r = await fetch(base + path, { headers: { cookie }, redirect: "manual" });
  assert.equal(r.status, 200, `${path} -> ${r.status}`);
  return { html: (await r.text()).replaceAll("<!-- -->", ""), cache: r.headers.get("cache-control") ?? "" };
};
const api = async (path: string, body: unknown) => {
  const r = await fetch(base + path, { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${key}` }, body: JSON.stringify(body) });
  return { status: r.status, json: (await r.json()) as Record<string, unknown> };
};
const adminTotal = async (cookie: string) => Number((await page("/admin/collections", cookie)).html.match(/Showing \d+-\d+ of (\d+)/)?.[1] ?? 0);
const farmerTotal = async (cookie: string) => Number((await page("/dashboard", cookie)).html.match(/Total collections<\/div><div[^>]*>(\d+)</)?.[1]);
const pass = (m: string) => console.log("PASS " + m);

const health = await fetch(base + "/api/health", { headers: { authorization: `Bearer ${key}` } });
assert.equal(health.status, 200, "health check");
assert.equal((await fetch(base + "/api/health")).status, 401, "health without key");
pass("health endpoint: reachable, key required");

const admin = await cookieFor(ADMIN_EMAIL!, ADMIN_PASSWORD!);
const farmer = process.env.FARMER_LOGIN_EMAIL && process.env.FARMER_PASSWORD ? await cookieFor(process.env.FARMER_LOGIN_EMAIL, process.env.FARMER_PASSWORD) : null;
const a0 = await adminTotal(admin);
const f0 = farmer ? await farmerTotal(farmer) : 0;
const probe = await page("/admin/collections", admin);
assert.match(probe.cache, /no-store|no-cache|private/, `dashboards must not be cached (got "${probe.cache}")`);
pass("dashboards are served uncached");

const s = await api("/api/sessions", { farmer_code: code, device_id: "e2e" });
assert.equal(s.status, 201, "open session");
const body = { measurement_id: randomUUID(), session_id: s.json.session_id, farmer_code: code, adc_value: 1500, fat_tenths: 40, quantity_litres: 1.11 };
const first = await api("/api/collections", body);
assert.equal(first.status, 201, "save collection");
assert.equal(await adminTotal(admin), a0 + 1, "admin dashboard must show exactly one new collection");
pass(`admin dashboard: ${a0} -> ${a0 + 1} collections without any special refresh`);
if (farmer) { assert.equal(await farmerTotal(farmer), f0 + 1, "farmer dashboard must show exactly one new collection"); pass(`farmer dashboard: ${f0} -> ${f0 + 1}`); }

const retry = await api("/api/collections", body);
assert.equal(retry.status, 200);
assert.equal(retry.json.id, first.json.id);
assert.equal(await adminTotal(admin), a0 + 1, "a retried measurement must not add a record");
if (farmer) assert.equal(await farmerTotal(farmer), f0 + 1);
pass("duplicate submission: same record returned, dashboards unchanged");
// FPGA fat readings (farmer code + fat, quantity typed later). Only runs with READINGS=1, because it needs the
// 20261026000000_fpga_fat_readings.sql migration. Leaves one reading waiting in /admin/readings (expires in 30 minutes).
if (process.env.READINGS === "1") {
  const reading = (session_id: string, fat_tenths: number) => api("/api/sessions", { farmer_code: code, device_id: "e2e", session_id, fat_tenths });
  const [s1, s2, s3] = [randomUUID(), randomUUID(), randomUUID()];
  const r1 = await reading(s1, 42);
  assert.equal(r1.status, 201); assert.equal(r1.json.session_id, s1); assert.equal(r1.json.duplicate, false);
  const r1b = await reading(s1, 42);
  assert.equal(r1b.status, 200); assert.equal(r1b.json.duplicate, true);
  assert.equal((await reading(s1, 43)).status, 409, "same session id with another fat is a conflict");
  const r2 = await reading(s2, 42);
  assert.equal(r2.status, 200); assert.equal(r2.json.session_id, s1, "same fat while the first still waits is a repeat, not a new reading");
  pass("reading API: created once, retries and repeats return the same reading");
  assert.equal((await reading(s3, 45)).status, 201, "a different fat is a new reading");
  const waiting = (await page("/admin/readings", admin)).html;
  assert.match(waiting, /FPGA readings/); assert.match(waiting, new RegExp(`>${code}<`)); assert.match(waiting, />4\.5</);
  assert.ok(!waiting.includes(">4.2<"), "the older reading was replaced by the newer one");
  pass("admin page lists only the newest waiting reading");
  assert.equal((await api("/api/sessions", { farmer_code: code, fat_tenths: 42 })).status, 400, "session_id and fat_tenths go together");
  assert.equal((await reading(randomUUID(), 0)).status, 400, "fat 0 is invalid");
  assert.equal((await api("/api/sessions", { farmer_code: code, device_id: "e2e" })).status, 201, "keypad session flow is unchanged");
  pass("validation and the existing keypad session flow");
}
console.log("ALL PASSED");
