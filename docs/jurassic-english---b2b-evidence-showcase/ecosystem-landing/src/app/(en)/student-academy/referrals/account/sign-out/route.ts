import { accountsEnabled, ACCOUNT_PATH, db, sameOrigin, seeOther, sessionCookie, sessionHash } from "@/lib/familyRewards/server/env";
import { signOut } from "@/lib/familyRewards/server/rpc";

export async function POST(request: Request) {
  if (!accountsEnabled()) return new Response("Not found", { status: 404 });
  if (!sameOrigin(request)) return new Response("Forbidden", { status: 403 });
  const session = await sessionHash();
  if (session) await signOut(db(), session).catch(() => undefined);
  return seeOther(ACCOUNT_PATH, { "Set-Cookie": sessionCookie("", 0) });
}
