import { createHash, timingSafeEqual } from "node:crypto";

// The serial bridge authenticates with a shared secret: Authorization: Bearer <BRIDGE_API_KEY>.
export function isBridge(request: Request): boolean {
  const key = process.env.BRIDGE_API_KEY;
  if (!key) return false; // fail closed when unconfigured
  const given = (request.headers.get("authorization") ?? "").replace(/^Bearer /, "");
  const h = (s: string) => createHash("sha256").update(s).digest();
  return timingSafeEqual(h(given), h(key));
}
