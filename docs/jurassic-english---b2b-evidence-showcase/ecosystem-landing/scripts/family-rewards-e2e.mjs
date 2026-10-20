// Family Rewards end-to-end journey over HTTP against a running app on LOCAL
// staging (never production). Synthetic adults only. Prerequisites:
//   1. a fresh local database with the migration applied, fr_app able to log in,
//      and owner@jurassic.test in family_rewards.owners;
//   2. the app started with FR_DATABASE_URL pointing at it and no RESEND_API_KEY,
//      so sign-in links are written to the server log;
//   3. BASE=http://localhost:3418 LOG=<server log path> node scripts/family-rewards-e2e.mjs
import { readFileSync } from "node:fs";
const BASE = process.env.BASE ?? "http://localhost:3418";
const LOG = process.env.LOG;
const A = "/student-academy/referrals/account";
const results = [];
const check = (name, ok, detail = "") => { results.push({ name, ok, detail }); console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  — " + detail : ""}`); };

function lastLinkFor(email) {
  const masked = email.replace(/(^.).*(@.*$)/, "$1***$2");
  const lines = readFileSync(LOG, "utf8").split("\n").filter((l) => l.includes(`sign-in link for ${masked}:`));
  return lines.at(-1)?.split(": ").at(-1)?.trim();
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function post(path, fields, cookie) {
  const body = new URLSearchParams(fields);
  return fetch(BASE + path, { method: "POST", body, redirect: "manual", headers: { Origin: BASE, ...(cookie ? { Cookie: cookie } : {}) } });
}
async function signIn(email) {
  const r = await post(`${A}/sign-in`, { email });
  check(`sign-in request ${email} -> 303 sent`, r.status === 303 && r.headers.get("location") === `${A}?sent=1`, `${r.status} ${r.headers.get("location")}`);
  await sleep(300);
  const link = lastLinkFor(email);
  const t = new URL(link).searchParams.get("t");
  const v = await fetch(link.replace("http://localhost:3418", BASE));
  check(`verify page (GET) does not consume the token`, v.status === 200 && (await v.text()).includes("Continue to my account"));
  const c = await post(`${A}/verify/confirm`, { t });
  const cookie = c.headers.get("set-cookie")?.split(";")[0];
  check(`confirm sets HttpOnly session cookie scoped to ${A}`, c.status === 303 && /HttpOnly/.test(c.headers.get("set-cookie")) && c.headers.get("set-cookie").includes(`Path=${A}`));
  const replay = await post(`${A}/verify/confirm`, { t });
  check("a used sign-in link cannot be replayed", replay.headers.get("location")?.includes("error=invalid_link"));
  return cookie;
}
async function page(path, cookie) {
  const r = await fetch(BASE + path, { headers: cookie ? { Cookie: cookie } : {} });
  return { status: r.status, cc: r.headers.get("cache-control"), robots: r.headers.get("x-robots-tag"), html: await r.text() };
}
async function owner(cookie, op, fields) {
  const admin = await page(`${A}/admin`, cookie);
  const key = admin.html.match(new RegExp(`name="op" value="${op}"/><input type="hidden" name="key" value="([^"]+)"`))?.[1];
  const r = await post(`${A}/admin/action`, { op, key, confirm: "on", ...fields }, cookie);
  const loc = decodeURIComponent(r.headers.get("location") ?? "");
  return { loc, key, ok: loc.includes("?ok="), result: (() => { try { return JSON.parse(new URLSearchParams(loc.split("?")[1]).get("result")); } catch { return null; } })() };
}

// ---------- journey
const ownerCookie = await signIn("owner@jurassic.test");
let r = await owner(ownerCookie, "set_flags", { enrolment: "on", dashboard: "on", writes: "on", reason: "local staging pilot" });
check("owner opens enrolment", r.ok, r.loc);
r = await owner(ownerCookie, "set_budget", { funded: "1000000", reason: "local staging: approved pilot allocation" });
check("owner sets funded allocation 1,000,000", r.ok, r.loc);
const member = await owner(ownerCookie, "approve_member", { full_name: "Synthetic Parent Linh", email: "linh.synthetic@example.org", phone: "",
  terms_version: "FR-2026-10-pilot-v1", terms_accepted_at: "2026-10-04T10:00:00+07:00", reason: "verified former customer (synthetic)" });
check("owner approves member and code is issued", member.ok && /^JE-[A-Z2-9]{6}$/.test(member.result?.referral_code ?? ""), member.loc);
const code = member.result.referral_code, memberId = member.result.member_id;

// Double submit with the same form key applies once.
const ref = await owner(ownerCookie, "record_referral", { code, full_name: "Synthetic Referred Tran Thi Bich", email: "bich.synthetic@example.net", phone: "",
  package_ref: "PKG-NEW-001", declared_at: "2026-10-05T09:00:00+07:00", reason: "code given at enquiry (synthetic)" });
check("owner records referral", ref.ok, ref.loc);
const dup = await post(`${A}/admin/action`, { op: "record_referral", key: ref.key, confirm: "on", code, full_name: "Synthetic Referred Tran Thi Bich", email: "bich.synthetic@example.net",
  phone: "", package_ref: "PKG-NEW-001", declared_at: "2026-10-05T09:00:00+07:00", reason: "code given at enquiry (synthetic)" }, ownerCookie);
check("resubmitting the same form returns the original result (no second referral)", decodeURIComponent(dup.headers.get("location")).includes(ref.result.referral_id));
const refId = ref.result.referral_id;

const pending = await (async () => { const c = await signIn("linh.synthetic@example.org"); return { c, p: await page(A, c) }; })();
const memberCookie = pending.c;
check("member sees pending 200,000 and available 0 before qualification", /Pending<\/dt><dd[^>]*>200,000₫/.test(pending.p.html) && /Available<\/dt><dd[^>]*>0₫/.test(pending.p.html));

r = await owner(ownerCookie, "update_evidence", { referral: refId, first_payment_at: "2026-10-06T09:00:00+07:00", lessons_paid: "8", lessons_completed: "8", evidence_ref: "BANK-SYN-1; ATT-SYN-1", reason: "bank + attendance (synthetic)" });
check("owner records evidence", r.ok, r.loc);
r = await owner(ownerCookie, "qualify", { referral: refId, reason: "8 paid, 8 completed (synthetic)" });
check("owner approves qualification", r.ok, r.loc);
const noConfirm = await post(`${A}/admin/action`, { op: "post_reward", key: "nokeyconfirm_123", referral: refId, reason: "missing tick" }, ownerCookie);
check("posting a reward without the confirmation tick is refused", decodeURIComponent(noConfirm.headers.get("location")).includes("error=confirm"));
r = await owner(ownerCookie, "post_reward", { referral: refId, reason: "qualified reward (synthetic)" });
check("owner posts reward", r.ok, r.loc);

let acc = await page(A, memberCookie);
check("member account: earned 200,000, available 200,000, pending 0",
  /Earned<\/dt><dd[^>]*>200,000₫/.test(acc.html) && /Available<\/dt><dd[^>]*>200,000₫/.test(acc.html) && /Pending<\/dt><dd[^>]*>0₫/.test(acc.html));
check("member account shows own code", acc.html.includes(code));
check("member HTML/RSC never contains the referred adult's name or email", !/Tran Thi Bich|bich\.synthetic/.test(acc.html));
check("member account headers: private, no-store; noindex", /private/.test(acc.cc) && /no-store/.test(acc.cc) && /noindex/.test(acc.robots ?? ""), `${acc.cc} | ${acc.robots}`);

r = await owner(ownerCookie, "register_invoice", { package_id: "PKG-LINH-L2", member: memberId, lessons: "8", eligible: "on", invoice_id: "INV-LINH-L2", payable: "5600000", reason: "next package (synthetic)" });
check("owner registers later invoice", r.ok, r.loc);
const hold = await owner(ownerCookie, "hold_redemption", { member: memberId, invoice_id: "INV-LINH-L2", amount: "200000", reason: "member asked to use credit (synthetic)" });
check("owner holds credit", hold.ok, hold.loc);
acc = await page(A, memberCookie);
check("held credit is not available", /Available<\/dt><dd[^>]*>0₫/.test(acc.html) && acc.html.includes("reserved for an invoice"));
r = await owner(ownerCookie, "confirm_redemption", { redemption: hold.result.redemption_id, external_ref: "INV-LINH-L2 discount line", reason: "discount on invoice (synthetic)" });
check("owner confirms redemption", r.ok, r.loc);
acc = await page(A, memberCookie);
check("member account after redemption: used 200,000, available 0; history dated", /Used<\/dt><dd[^>]*>200,000₫/.test(acc.html) && /Available<\/dt><dd[^>]*>0₫/.test(acc.html) && /\d{4}-\d{2}-\d{2}/.test(acc.html));

// ---------- access control over HTTP
const anonAdmin = await page(`${A}/admin`);
check("anonymous admin page shows no data", anonAdmin.html.includes("Owner access only") && !anonAdmin.html.includes("Synthetic Parent Linh"));
const memberAdmin = await page(`${A}/admin`, memberCookie);
check("member cannot open owner administration", memberAdmin.html.includes("Owner access only") && !memberAdmin.html.includes("Tran Thi Bich"));
const memberAct = await post(`${A}/admin/action`, { op: "adjust", key: "member_tries_1234", member: memberId, amount: "1000000", confirm: "on", reason: "self credit" }, memberCookie);
check("member cannot invoke owner actions", decodeURIComponent(memberAct.headers.get("location")).includes("error=forbidden"));
const memberExport = await fetch(BASE + `${A}/admin/export`, { headers: { Cookie: memberCookie } });
check("member cannot download the export", memberExport.status === 403);
const crossSite = await fetch(BASE + `${A}/admin/action`, { method: "POST", body: new URLSearchParams({ op: "set_budget", funded: "1" }), redirect: "manual", headers: { Origin: "https://evil.example", Cookie: ownerCookie } });
check("cross-site POST is refused", crossSite.status === 403);
const exp = await fetch(BASE + `${A}/admin/export`, { headers: { Cookie: ownerCookie } });
const csv = await exp.text();
check("owner export: private CSV with identities and ledger", exp.status === 200 && /no-store/.test(exp.headers.get("cache-control")) && csv.includes("Tran Thi Bich") && csv.includes("Ledger"));

// Formula-injection: a name starting with '=' is neutralised in the export.
await owner(ownerCookie, "approve_member", { full_name: "=HYPERLINK(\"http://x\")", email: "formula.synthetic@example.org", phone: "", terms_version: "FR-2026-10-pilot-v1", terms_accepted_at: "2026-10-04T10:00:00+07:00", reason: "csv injection probe (synthetic)" });
const csv2 = await (await fetch(BASE + `${A}/admin/export`, { headers: { Cookie: ownerCookie } })).text();
check("export neutralises formula cells", csv2.includes("'=HYPERLINK") && !/(^|,)"?=HYPERLINK/m.test(csv2));

const out = await post(`${A}/sign-out`, {}, memberCookie);
const after = await page(A, memberCookie);
check("sign-out revokes the session", out.status === 303 && after.html.includes("Email me a sign-in link") && !after.html.includes(code));

const failed = results.filter((x) => !x.ok).length;
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
