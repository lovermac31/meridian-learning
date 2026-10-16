import "server-only";
import { storeMode } from "@/lib/resources/gate";
import { storeConfigured } from "@/lib/resources/session";

const NO_STORE = {
  "cache-control": "private, no-store, max-age=0",
  "x-robots-tag": "noindex, nofollow",
  "x-content-type-options": "nosniff",
};

export function json(body: unknown, status = 200): Response {
  return Response.json(body, { status, headers: NO_STORE });
}

// Every store API starts here: 404 in production (store not released),
// 503 if the preview secret is missing, 403 for cross-site writes.
export function guard(request: Request, opts: { write?: boolean } = {}): Response | null {
  if (storeMode() === "off") return new Response("Not found", { status: 404, headers: NO_STORE });
  if (!storeConfigured()) return json({ error: "store_not_configured" }, 503);
  if (opts.write) {
    const origin = request.headers.get("origin");
    const host = request.headers.get("host");
    if (!origin || !host || new URL(origin).host !== host) return json({ error: "bad_origin" }, 403);
  }
  return null;
}

export { NO_STORE };
