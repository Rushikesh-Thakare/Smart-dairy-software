import test from "node:test";
import assert from "node:assert/strict";
import { parseMeasurement, parseQuantityText, parseSessionRequest } from "./collection.ts";

const good = {
  measurement_id: "6f1c1c5e-8a3b-4f0e-9d63-2f6a3a1b9c10",
  session_id: "0b8f5d3a-2c4e-4a77-8e1d-5c9a7e2f4b11",
  farmer_code: "0042",
  adc_value: 2048,
  fat_tenths: 42,
  quantity_litres: 12.35,
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
  bad({ quantity_litres: 0 }); bad({ quantity_litres: -3 }); bad({ quantity_litres: 501 });
  bad({ quantity_litres: 1.234 }); bad({ quantity_litres: "5" }); bad({ quantity_litres: NaN });
  bad({ cattle_type: "" }); bad({ cattle_type: "x".repeat(21) });
});
test("rejects non-objects", () => {
  for (const b of [null, "x", 5, [], undefined]) assert.equal(parseMeasurement(b).ok, false);
});
test("session request needs a 4-digit code", () => {
  assert.ok(parseSessionRequest({ farmer_code: "0042", device_id: "fpga-1" }).ok);
  assert.equal(parseSessionRequest({ farmer_code: "42" }).ok, false);
  assert.equal(parseSessionRequest({ farmer_code: "0042", device_id: "" }).ok, false);
});

const SID = "0b8f5d3a-2c4e-4a77-8e1d-5c9a7e2f4b11";
test("session request carries an FPGA fat reading only as a session_id + fat_tenths pair", () => {
  const r = parseSessionRequest({ farmer_code: "0042", device_id: "FPGA", session_id: SID.toUpperCase(), fat_tenths: 87 });
  assert.ok(r.ok && r.value.farmer_code === "0042" && r.value.reading?.fat_tenths === 87 && r.value.reading.session_id === SID);
  const plain = parseSessionRequest({ farmer_code: "0042" });
  assert.ok(plain.ok && plain.value.reading === null); // the keypad flow is unchanged
  for (const patch of [{ session_id: SID }, { fat_tenths: 87 }, { session_id: "x", fat_tenths: 87 }, { session_id: SID, fat_tenths: 0 },
    { session_id: SID, fat_tenths: 201 }, { session_id: SID, fat_tenths: 8.7 }, { session_id: SID, fat_tenths: "87" }]) {
    assert.equal(parseSessionRequest({ farmer_code: "0042", ...patch }).ok, false, JSON.stringify(patch));
  }
});
test("quantity typed in the admin form is plain decimal text, never guessed", () => {
  assert.equal(parseQuantityText("4.5"), 4.5);
  assert.equal(parseQuantityText(" 12.25 "), 12.25);
  for (const t of ["", " ", "0", "0.00", "-1", "1e2", "4,5", "4.567", "501", "abc", "4.", ".5", "NaN"]) assert.equal(parseQuantityText(t), null, t);
});
