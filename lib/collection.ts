// Pure input validation for device payloads (no framework imports so node:test can run it).
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const CODE = /^\d{4}$/;

export type Measurement = {
  measurement_id: string;
  session_id: string;
  farmer_code: string;
  adc_value: number;
  fat_tenths: number;
  quantity_litres: number;
  cattle_type: string | null;
};
export type Parsed<T> = { ok: true; value: T } | { ok: false; error: string };

const isObj = (b: unknown): b is Record<string, unknown> => typeof b === "object" && b !== null && !Array.isArray(b);
const intIn = (v: unknown, min: number, max: number): v is number => Number.isInteger(v) && (v as number) >= min && (v as number) <= max;

export function parseSessionRequest(b: unknown): Parsed<{ farmer_code: string; device_id: string | null }> {
  if (!isObj(b)) return { ok: false, error: "body must be a JSON object" };
  if (typeof b.farmer_code !== "string" || !CODE.test(b.farmer_code)) return { ok: false, error: "farmer_code must be 4 digits" };
  const d = b.device_id ?? null;
  if (d !== null && (typeof d !== "string" || d.length === 0 || d.length > 50)) return { ok: false, error: "device_id must be 1-50 chars" };
  return { ok: true, value: { farmer_code: b.farmer_code, device_id: d } };
}

export function parseMeasurement(b: unknown): Parsed<Measurement> {
  if (!isObj(b)) return { ok: false, error: "body must be a JSON object" };
  if (typeof b.measurement_id !== "string" || !UUID.test(b.measurement_id)) return { ok: false, error: "measurement_id must be a UUID" };
  if (typeof b.session_id !== "string" || !UUID.test(b.session_id)) return { ok: false, error: "session_id must be a UUID" };
  if (typeof b.farmer_code !== "string" || !CODE.test(b.farmer_code)) return { ok: false, error: "farmer_code must be 4 digits" };
  // XADC is 12-bit.
  if (!intIn(b.adc_value, 0, 4095)) return { ok: false, error: "adc_value must be an integer 0-4095" };
  if (!intIn(b.fat_tenths, 0, 200)) return { ok: false, error: "fat_tenths must be an integer 0-200" };
  const q = b.quantity_litres;
  // shortcut: 500 L cap per collection is a sanity limit, raise it for bulk tankers.
  if (typeof q !== "number" || !(q > 0) || q > 500 || Math.round(q * 100) / 100 !== q) {
    return { ok: false, error: "quantity_litres must be >0, <=500, max 2 decimals" };
  }
  const c = b.cattle_type ?? null;
  if (c !== null && (typeof c !== "string" || c.trim().length === 0 || c.length > 20)) {
    return { ok: false, error: "cattle_type must be 1-20 chars" };
  }
  return {
    ok: true,
    value: {
      measurement_id: b.measurement_id.toLowerCase(),
      session_id: b.session_id.toLowerCase(),
      farmer_code: b.farmer_code,
      adc_value: b.adc_value,
      fat_tenths: b.fat_tenths,
      quantity_litres: q,
      cattle_type: c === null ? null : (c as string).trim(),
    },
  };
}
