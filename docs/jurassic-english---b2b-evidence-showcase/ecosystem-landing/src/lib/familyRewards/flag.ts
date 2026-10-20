// Family Rewards release gate (server-only; read in layout.tsx and pages).
//
// main auto-deploys to production, so merging must not advertise a reward
// that has no approved funding. Production stays off until the owner sets
// FAMILY_REWARDS_ENABLED=1 on the je-ecosystem-landing-preview project and
// redeploys. Preview and local builds are on, labelled as a preview.
//
//   "off"     production without the flag: the page 404s; no card, no link
//   "preview" preview/dev builds: everything renders with a preview banner
//   "live"    production with FAMILY_REWARDS_ENABLED=1

export type FamilyRewardsMode = "off" | "preview" | "live";

export function familyRewardsMode(): FamilyRewardsMode {
  if (process.env.VERCEL_ENV === "production") {
    return process.env.FAMILY_REWARDS_ENABLED === "1" ? "live" : "off";
  }
  return "preview";
}
