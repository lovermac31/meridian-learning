import { productBySlug } from "@/lib/resources/catalog";
import { hasActiveEntitlement } from "@/lib/resources/ledger";
import { rateLimited } from "@/lib/resources/rateLimit";
import { readLedger, refTag } from "@/lib/resources/session";
import { paidFile, MAX_FILE_BYTES } from "@/server/resources/content";
import { guard, json, NO_STORE } from "../../_lib";

const SLUG = /^[a-z0-9-]{3,60}$/;

// Every full-content request is authorised here, on the server, against the
// signed ledger. The slug is only ever used as a key into a fixed in-code
// table, never as a path, so there is nothing to traverse.
export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const blocked = guard(request);
  if (blocked) return blocked;
  if (rateLimited(request, "file", 30)) return json({ error: "rate_limited" }, 429);

  const { slug } = await params;
  if (!SLUG.test(slug) || !productBySlug(slug)) return json({ error: "not_found" }, 404);

  const state = await readLedger();
  if (!hasActiveEntitlement(state, slug)) return json({ error: "no_entitlement" }, 403);

  const file = paidFile(slug);
  if (!file) return json({ error: "not_found" }, 404);
  const ref = state.entitlements.find((e) => e.slug === slug && e.revokedAt === undefined)!.ref;

  const watermark = `<p class="resource-licence">Licensed for one family or learner · order ${ref} · Jurassic English™. Please do not share.</p>`;
  const body = `${watermark}${file.html}${watermark}`;
  if (Buffer.byteLength(body) > MAX_FILE_BYTES) return json({ error: "file_too_large" }, 500);

  const format = new URL(request.url).searchParams.get("format");
  // Minimal access log: which pack and a one-way tag of the order. No IP, no email.
  console.info("resources.file_served", { slug, format, tag: refTag(ref) });

  if (format === "download") {
    const doc = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${file.title}</title><style>body{font:16px/1.6 Georgia,serif;max-width:44rem;margin:2rem auto;padding:0 1rem;color:#101820}h2,h3{font-family:Arial,sans-serif}.resource-licence{font:12px Arial,sans-serif;border:1px solid #D4AF37;padding:.4rem .6rem}</style></head><body>${body}</body></html>`;
    return new Response(doc, {
      headers: {
        ...NO_STORE,
        "content-type": "text/html; charset=utf-8",
        "content-disposition": `attachment; filename="${file.fileName}"`,
      },
    });
  }
  return new Response(body, { headers: { ...NO_STORE, "content-type": "text/html; charset=utf-8" } });
}
