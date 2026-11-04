import { accountsEnabled, ACCOUNT_PATH, db, publicOrigin, randomToken, sameOrigin, seeOther, sendSignInEmail, sha256 } from "@/lib/familyRewards/server/env";
import { FrError, requestLogin } from "@/lib/familyRewards/server/rpc";

// Emails a one-time sign-in link. The response is the same whether or not the
// address belongs to a member, so the form cannot be used to discover members.
export async function POST(request: Request) {
  if (!accountsEnabled()) return new Response("Not found", { status: 404 });
  if (!sameOrigin(request)) return new Response("Forbidden", { status: 403 });
  const form = await request.formData();
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const token = randomToken();
  try {
    await requestLogin(db(), email, sha256(token));
    await sendSignInEmail(email, `${publicOrigin()}${ACCOUNT_PATH}/verify?t=${token}`);
  } catch (error) {
    const code = error instanceof FrError ? error.code : "unavailable";
    if (!(error instanceof FrError)) console.error("[family-rewards] sign-in failed", (error as Error).message);
    return seeOther(`${ACCOUNT_PATH}?error=${encodeURIComponent(code)}`);
  }
  return seeOther(`${ACCOUNT_PATH}?sent=1`);
}
