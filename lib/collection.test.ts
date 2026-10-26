import test from "node:test";
import assert from "node:assert/strict";
import { parseMeasurement, parseSessionRequest } from "./collection.ts";

const good = {
  measurement_id: "6f1c1c5e-8a3b-4f0e-9d63-2f6a3a1b9c10",
  session_id: "0b8f5d3a-2c4e-4a77-8e1d-5c9a7e2f4b11",
  farmer_code: "0042",
  adc_value: 2048,
  fat_tenths: 42,
};
const bad = (patch: object) => assert.equal(parseMeasurement({ ...good, ...patch }).ok, false, JSON.stringify(patch));

test("accepts a valid measurement and keeps the leading-zero code", () => {
  const r = parseMeasurement(good);
  assert.ok(r.ok && r.value.farmer_code === "0042" && r.value.cattle_type === null);
});
test("rejects bad ids, codes and ranges", () => {
  bad({ measurement_id: "abc" }); bad({ session_id: undefined });
  bad({ farmer_code: "42" }); bad({ farmer_code: 42 }); bad({ farmer_code: "12345" });
  bad({ adc_value: -1 }); bad({ adc_value: 4096 }); bad({ adc_value: 1.5 }); bad({ adc_value: "2048" });
  bad({ fat_tenths: 201 }); bad({ fat_tenths: -1 }); bad({ fat_tenths: 4.2 });
  bad({ cattle_type: "" }); bad({ cattle_type: "x".repeat(21) });
});
test("a collection is just farmer + fat: ADC is optional and a sent quantity is ignored, never stored", () => {
  const r = parseMeasurement({ ...good, adc_value: undefined, quantity_litres: 9.5, rate_per_litre: 40 });
  assert.ok(r.ok && r.value.adc_value === null && !("quantity_litres" in r.value) && !("rate_per_litre" in r.value));
  assert.equal(parseMeasurement({ ...good, adc_value: 4096 }).ok, false); // still validated when present
});
test("rejects non-objects", () => {
  for (const b of [null, "x", 5, [], undefined]) assert.equal(parseMeasurement(b).ok, false);
});
test("session request needs a 4-digit code", () => {
  assert.ok(parseSessionRequest({ farmer_code: "0042", device_id: "fpga-1" }).ok);
  assert.equal(parseSessionRequest({ farmer_code: "42" }).ok, false);
  assert.equal(parseSessionRequest({ farmer_code: "0042", device_id: "" }).ok, false);
});
