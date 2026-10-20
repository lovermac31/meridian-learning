// Family Rewards: dry-run review of Google Form registrations before approval.
//
//   node scripts/family-rewards-import-dryrun.mjs <responses.csv> [--exclude email,email]
//
// The form is an intake channel, not the accounting database. This script
// writes nothing: it reports what the owner would review, merging duplicate
// submissions by lower-cased email (earliest submission kept, later ones
// listed) and excluding explicitly named rows (e.g. the synthetic QA row).
// Typed emails are unverified: approval happens in the owner admin, and the
// account only opens when that address signs in with an emailed link.
// Approving the same email twice is refused by the database, so re-running
// the review after a partial approval cannot create duplicates.

import { readFileSync } from "node:fs";

const [file, flag, list] = process.argv.slice(2);
if (!file) { console.error("usage: node scripts/family-rewards-import-dryrun.mjs <responses.csv> [--exclude a@x,b@y]"); process.exit(2); }
const exclude = new Set(flag === "--exclude" && list ? list.toLowerCase().split(",").map((s) => s.trim()) : ["qa.family-rewards@example.org"]);

function parseCsv(text) {
  const rows = []; let row = [], cell = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) { if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; } else if (c === '"') quoted = false; else cell += c; }
    else if (c === '"') quoted = true;
    else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\n" || c === "\r") { if (c === "\r" && text[i + 1] === "\n") i++; row.push(cell); rows.push(row); row = []; cell = ""; }
    else cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((x) => x.trim()));
}

const [header, ...data] = parseCsv(readFileSync(file, "utf8"));
const col = (name) => header.findIndex((h) => h.toLowerCase().startsWith(name));
const idx = { at: col("timestamp"), email: col("email"), name: col("your name"), phone: col("zalo"), status: col("are you"), terms: col("programme terms"), privacy: col("privacy") };
if (Object.values(idx).some((i) => i < 0)) { console.error("Unexpected columns:", header); process.exit(2); }

const seen = new Map(), excluded = [], duplicates = [], incomplete = [];
for (const r of data) {
  const email = r[idx.email].trim().toLowerCase();
  const entry = { submitted: r[idx.at], name: r[idx.name].trim(), email, phone: r[idx.phone].trim(), status: r[idx.status], terms: r[idx.terms].match(/FR-[\w-]+/)?.[0] ?? null };
  if (exclude.has(email)) { excluded.push(entry); continue; }
  if (!entry.terms || !r[idx.privacy]) { incomplete.push(entry); continue; }
  if (seen.has(email)) { duplicates.push(entry); continue; }
  seen.set(email, entry);
}
const report = { source: file, rows: data.length, to_review: [...seen.values()], duplicates, excluded, incomplete, writes: 0 };
console.log(JSON.stringify(report, null, 2));
console.error(`rows ${data.length}: review ${seen.size}, duplicates ${duplicates.length}, excluded ${excluded.length}, incomplete ${incomplete.length}. Nothing was written.`);
