import "server-only";

// Best-effort, per-instance fixed-window limiter. It slows scripted abuse of
// one warm function instance; it is not a global limit. The live store adds a
// Vercel Firewall rate-limit rule on /student-academy/resources/api/* (no new
// service) — see JE_MARKETPLACE_ARCHITECTURE.md §6.

const WINDOW_MS = 60_000;
const buckets = new Map<string, { start: number; count: number }>();

export function rateLimited(request: Request, route: string, limit: number): boolean {
  const ip = (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  const key = `${route}:${ip}`;
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || now - b.start > WINDOW_MS) {
    buckets.set(key, { start: now, count: 1 });
    if (buckets.size > 5000) buckets.clear();
    return false;
  }
  b.count += 1;
  return b.count > limit;
}
