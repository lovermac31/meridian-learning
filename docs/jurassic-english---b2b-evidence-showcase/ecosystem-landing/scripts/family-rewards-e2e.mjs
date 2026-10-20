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

// ---------- journey: five synthetic referrals
const money = (html, label) => html.match(new RegExp(`${label}</dt><dd[^>]*>([\\d,]+)₫`))?.[1];
const ownerCookie = await signIn("owner@jurassic.test");
let r = await owner(ownerCookie, "set_flags", { enrolment: "on", dashboard: "on", writes: "on", reason: "local staging pilot" });
check("owner opens enrolment", r.ok, r.loc);
r = await owner(ownerCookie, "set_budget", { funded: "1000000", reason: "local staging: approved pilot allocation (5 x 200,000)" });
check("owner sets funded allocation 1,000,000", r.ok, r.loc);
const member = await owner(ownerCookie, "approve_member", { full_name: "Synthetic Parent Linh", email: "linh.synthetic@example.org", phone: "",
  terms_version: "FR-2026-10-pilot-v1", terms_accepted_at: "2026-10-04T10:00:00+07:00", reason: "verified former customer (synthetic)" });
check("owner approves member Linh and a code is issued", member.ok && /^JE-[A-Z2-9]{6}$/.test(member.result?.referral_code ?? ""), member.loc);
const code = member.result.referral_code, memberId = member.result.member_id;
const other = await owner(ownerCookie, "approve_member", { full_name: "Synthetic Parent Quang", email: "quang.synthetic@example.org", phone: "",
  terms_version: "FR-2026-10-pilot-v1", terms_accepted_at: "2026-10-04T10:00:00+07:00", reason: "verified current customer (synthetic)" });
check("owner approves a second member (Quang)", other.ok, other.loc);

const memberCookie = await signIn("linh.synthetic@example.org");
const refs = [];
for (let n = 1; n <= 5; n++) {
  const fields = { code, full_name: `Synthetic Referred Adult ${n} Nguyen`, email: `referred${n}.synthetic@example.net`, phone: "",
    package_ref: `PKG-NEW-00${n}`, declared_at: `2026-10-0${n + 4}T09:00:00+07:00`, reason: `code given at enquiry ${n} (synthetic)` };
  const rec = await owner(ownerCookie, "record_referral", fields);
  check(`referral ${n}: recorded before payment, reward reserved`, rec.ok && rec.result.reserved === 200000, rec.loc);
  if (n === 1) {
    const again = await post(`${A}/admin/action`, { op: "record_referral", key: rec.key, confirm: "on", ...fields }, ownerCookie);
    check("duplicate request: resubmitting the same referral form returns the original result", decodeURIComponent(again.headers.get("location")).includes(rec.result.referral_id));
    const claim = await owner(ownerCookie, "record_referral", { ...fields, code: other.result.referral_code, reason: "second family claims the same household (synthetic)" });
    check("duplicate claim: a second referrer cannot claim the same new household", claim.loc.includes("error=duplicate"), claim.loc);
  }
  refs.push(rec.result.referral_id);
}
let acc = await page(A, memberCookie);
check("before approval: pending 1,000,000, available 0", money(acc.html, "Pending") === "1,000,000" && money(acc.html, "Available") === "0");

for (const [n, id] of refs.entries()) {
  r = await owner(ownerCookie, "update_evidence", { referral: id, first_payment_at: `2026-10-${String(n + 10).padStart(2, "0")}T09:00:00+07:00`, lessons_paid: "8", lessons_completed: "8",
    evidence_ref: `BANK-SYN-${n + 1}; ATT-SYN-${n + 1}`, reason: "bank statement + attendance sheet (synthetic)" });
  check(`referral ${n + 1}: evidence recorded (8 paid, 8 completed)`, r.ok, r.loc);
}
const early = await owner(ownerCookie, "approve_qualification", { referral: refs[0], reason: "probe" });
const noTick = await post(`${A}/admin/action`, { op: "approve_qualification", key: "noconfirmtick_1234", referral: refs[0], reason: "missing tick" }, ownerCookie);
check("approval without the confirmation tick is refused", decodeURIComponent(noTick.headers.get("location")).includes("error=confirm"));
check("referral 1: owner approval credits 200,000 automatically", early.ok && early.result.amount === 200000 && early.result.status === "credited", early.loc);
const approveAgain = await post(`${A}/admin/action`, { op: "approve_qualification", key: early.key, confirm: "on", referral: refs[0], reason: "probe" }, ownerCookie);
check("duplicate request: resubmitting the approval returns the same credit entry", decodeURIComponent(approveAgain.headers.get("location")).includes(early.result.entry_id));
const approveNew = await owner(ownerCookie, "approve_qualification", { referral: refs[0], reason: "second approval attempt (synthetic)" });
check("duplicate approval with a new request cannot credit twice", approveNew.loc.includes("error=already_credited"), approveNew.loc);
for (let n = 1; n < 5; n++) {
  r = await owner(ownerCookie, "approve_qualification", { referral: refs[n], reason: `8 paid, 8 completed (synthetic ${n + 1})` });
  check(`referral ${n + 1}: approval credits 200,000`, r.ok && r.result.amount === 200000, r.loc);
}
acc = await page(A, memberCookie);
check("after five approvals: earned 1,000,000, available 1,000,000, pending 0",
  money(acc.html, "Earned") === "1,000,000" && money(acc.html, "Available") === "1,000,000" && money(acc.html, "Pending") === "0");
check("member account shows own code and five credited families", acc.html.includes(code) && (acc.html.match(/>credited</g) ?? []).length === 5);
check("member HTML/RSC never contains referred adults' names or emails", !/Referred Adult|referred\d\.synthetic/.test(acc.html));
check("member account headers: private, no-store; noindex", /private/.test(acc.cc) && /no-store/.test(acc.cc) && /noindex/.test(acc.robots ?? ""), `${acc.cc} | ${acc.robots}`);
const sixth = await owner(ownerCookie, "record_referral", { code, full_name: "Synthetic Sixth", email: "referred6.synthetic@example.net", phone: "", package_ref: "PKG-NEW-006",
  declared_at: "2026-10-12T09:00:00+07:00", reason: "beyond funded allocation (synthetic)" });
check("a sixth referral is refused once the funded allocation is fully committed", sixth.loc.includes("error=budget_exhausted"), sixth.loc);

// ---------- controlled redemption, including simultaneous requests
for (const [pkg, inv] of [["PKG-LINH-L2", "INV-LINH-L2"], ["PKG-LINH-L3", "INV-LINH-L3"], ["PKG-LINH-L4", "INV-LINH-L4"]]) {
  r = await owner(ownerCookie, "register_invoice", { package_id: pkg, member: memberId, lessons: "8", eligible: "on", invoice_id: inv, payable: "5600000", reason: "later 8-lesson package (synthetic)" });
  check(`owner registers ${inv}`, r.ok, r.loc);
}
const overCap = await owner(ownerCookie, "hold_redemption", { member: memberId, invoice_id: "INV-LINH-L2", amount: "600000", reason: "more than the package cap (synthetic)" });
check("a hold above 400,000 on one package is refused", overCap.loc.includes("error=over_cap"), overCap.loc);
const h1 = await owner(ownerCookie, "hold_redemption", { member: memberId, invoice_id: "INV-LINH-L2", amount: "400000", reason: "use credit on next package (synthetic)" });
r = await owner(ownerCookie, "confirm_redemption", { redemption: h1.result.redemption_id, external_ref: "INV-LINH-L2 discount line", reason: "discount on invoice (synthetic)" });
check("first redemption: 400,000 confirmed on INV-LINH-L2", h1.ok && r.ok, r.loc);
acc = await page(A, memberCookie);
check("available 600,000 after the first redemption", money(acc.html, "Available") === "600,000" && money(acc.html, "Used") === "400,000");

// Two simultaneous 400,000 redemptions against 600,000 available: exactly one may succeed.
const admin = await page(`${A}/admin`, ownerCookie);
const keys = [...admin.html.matchAll(/name="op" value="hold_redemption"\/><input type="hidden" name="key" value="([^"]+)"/g)].map((m) => m[1]);
const k2 = keys[0], k3 = `${keys[0]}x2`;
const [s1, s2] = await Promise.all([
  post(`${A}/admin/action`, { op: "hold_redemption", key: k2, confirm: "on", member: memberId, invoice_id: "INV-LINH-L3", amount: "400000", reason: "simultaneous A (synthetic)" }, ownerCookie),
  post(`${A}/admin/action`, { op: "hold_redemption", key: k3, confirm: "on", member: memberId, invoice_id: "INV-LINH-L4", amount: "400000", reason: "simultaneous B (synthetic)" }, ownerCookie),
]);
const locs = [s1, s2].map((x) => decodeURIComponent(x.headers.get("location")));
const wins = locs.filter((l) => l.includes("ok=hold_redemption"));
check("simultaneous redemptions: exactly one succeeds, the other is refused for insufficient credit", wins.length === 1 && locs.some((l) => l.includes("error=insufficient")), locs.join(" | "));
const winId = JSON.parse(new URLSearchParams(wins[0].split("?")[1]).get("result")).redemption_id;
r = await owner(ownerCookie, "confirm_redemption", { redemption: winId, external_ref: "second package discount line", reason: "discount on invoice (synthetic)" });
check("the winning hold is confirmed", r.ok, r.loc);
acc = await page(A, memberCookie);
check("carry-forward: earned 1,000,000, used 800,000, available 200,000",
  money(acc.html, "Earned") === "1,000,000" && money(acc.html, "Used") === "800,000" && money(acc.html, "Available") === "200,000");
const loserInvoice = locs[0].includes("ok=") ? "INV-LINH-L4" : "INV-LINH-L3";
const h3 = await owner(ownerCookie, "hold_redemption", { member: memberId, invoice_id: loserInvoice, amount: "200000", reason: "carried-forward balance on a later package (synthetic)" });
r = await owner(ownerCookie, "confirm_redemption", { redemption: h3.result?.redemption_id, external_ref: `${loserInvoice} discount line`, reason: "discount on invoice (synthetic)" });
check("the carried-forward 200,000 is used on a later package", h3.ok && r.ok, r.loc);
const over = await owner(ownerCookie, "hold_redemption", { member: memberId, invoice_id: loserInvoice, amount: "100000", reason: "nothing left (synthetic)" });
check("no further credit can be spent once the balance is 0", over.loc.includes("error="), over.loc);
acc = await page(A, memberCookie);
check("final account: earned 1,000,000, used 1,000,000, available 0, dated history of 8 entries",
  money(acc.html, "Earned") === "1,000,000" && money(acc.html, "Used") === "1,000,000" && money(acc.html, "Available") === "0" && (acc.html.match(/<td class="py-2 pr-3">\d{4}-\d{2}-\d{2}<\/td>/g) ?? []).length >= 8);
const overview = await page(`${A}/admin`, ownerCookie);
check("owner reconciliation: rewards posted 1,000,000 = budget issued 1,000,000; open reservations 0",
  /rewards posted 1,000,000₫ = budget issued 1,000,000₫; open reservations 0₫ = budget reserved 0₫/.test(overview.html.replace(/<!-- -->/g, "")));

// ---------- access control over HTTP
const anonAdmin = await page(`${A}/admin`);
check("anonymous admin page shows no data", anonAdmin.html.includes("Owner access only") && !anonAdmin.html.includes("Synthetic Parent Linh"));
const memberAdmin = await page(`${A}/admin`, memberCookie);
check("member cannot open owner administration", memberAdmin.html.includes("Owner access only") && !memberAdmin.html.includes("Referred Adult 1 Nguyen"));
const memberAct = await post(`${A}/admin/action`, { op: "adjust", key: "member_tries_1234", member: memberId, amount: "1000000", confirm: "on", reason: "self credit" }, memberCookie);
check("member cannot invoke owner actions", decodeURIComponent(memberAct.headers.get("location")).includes("error=forbidden"));
const memberExport = await fetch(BASE + `${A}/admin/export`, { headers: { Cookie: memberCookie } });
check("member cannot download the export", memberExport.status === 403);
const crossSite = await fetch(BASE + `${A}/admin/action`, { method: "POST", body: new URLSearchParams({ op: "set_budget", funded: "1" }), redirect: "manual", headers: { Origin: "https://evil.example", Cookie: ownerCookie } });
check("cross-site POST is refused", crossSite.status === 403);
const exp = await fetch(BASE + `${A}/admin/export`, { headers: { Cookie: ownerCookie } });
const csv = await exp.text();
check("owner export: private CSV with identities and ledger", exp.status === 200 && /no-store/.test(exp.headers.get("cache-control")) && csv.includes("Referred Adult 1 Nguyen") && csv.includes("Ledger"));

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
