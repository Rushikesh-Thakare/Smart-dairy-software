// Simulated bridge: drives the real API end to end. Writes ONE real collection for FARMER_CODE.
// Usage (dev server running, FARMER_CODE = an approved farmer):
//   FARMER_CODE=1234 npm run simulate      (PowerShell: $env:FARMER_CODE="1234"; npm run simulate)
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

const base = process.env.BASE_URL ?? "http://localhost:3000";
const key = process.env.BRIDGE_API_KEY;
const code = process.env.FARMER_CODE;
assert.ok(key && code, "set BRIDGE_API_KEY (from .env.local) and FARMER_CODE");

const post = async (path: string, body: unknown, auth = key) => {
  const r = await fetch(base + path, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${auth}` },
    body: JSON.stringify(body),
  });
  return { status: r.status, json: (await r.json()) as Record<string, unknown> };
};
const check = (name: string, got: number, want: number) => {
  assert.equal(got, want, `${name}: expected ${want}, got ${got}`);
  console.log(`PASS ${name}`);
};

const reading = { fat_tenths: 38 };
check("wrong key rejected", (await post("/api/sessions", { farmer_code: code }, "nope")).status, 401);
check("unknown farmer", (await post("/api/sessions", { farmer_code: "0000" })).status, 404);

const s = await post("/api/sessions", { farmer_code: code, device_id: "simulator" });
check("open session", s.status, 201);
const body = { measurement_id: randomUUID(), session_id: s.json.session_id as string, farmer_code: code, ...reading };

check("bad fat rejected", (await post("/api/collections", { ...body, fat_tenths: 999 })).status, 400);
const first = await post("/api/collections", body);
check("save measurement", first.status, 201);
const retry = await post("/api/collections", body);
check("retry is idempotent", retry.status, 200);
assert.equal(retry.json.id, first.json.id);
check("same session, new id rejected", (await post("/api/collections", { ...body, measurement_id: randomUUID() })).status, 409);
check("farmer code not matching session", (await post("/api/collections", { ...body, measurement_id: randomUUID(), farmer_code: "0000" })).status, 404);
console.log("ALL PASSED");
