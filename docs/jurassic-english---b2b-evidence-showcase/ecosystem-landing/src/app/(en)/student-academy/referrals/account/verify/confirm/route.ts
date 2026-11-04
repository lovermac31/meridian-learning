import { accountsEnabled, ACCOUNT_PATH, db, randomToken, sameOrigin, seeOther, sessionCookie, sha256 } from "@/lib/familyRewards/server/env";
import { FrError, redeemLogin } from "@/lib/familyRewards/server/rpc";

const SESSION_DAYS = 14;

export async function POST(request: Request) {
  if (!accountsEnabled()) return new Response("Not found", { status: 404 });
  if (!sameOrigin(request)) return new Response("Forbidden", { status: 403 });
  const token = String((await request.formData()).get("t") ?? "");
  if (!/^[A-Za-z0-9_-]{40,64}$/.test(token)) return seeOther(`${ACCOUNT_PATH}?error=invalid_link`);
  const session = randomToken();
  try {
    await redeemLogin(db(), sha256(token), sha256(session));
  } catch (error) {
    return seeOther(`${ACCOUNT_PATH}?error=${error instanceof FrError ? encodeURIComponent(error.code) : "unavailable"}`);
  }
  return seeOther(ACCOUNT_PATH, { "Set-Cookie": sessionCookie(session, SESSION_DAYS * 86400) });
}
