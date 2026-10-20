import type { NextConfig } from "next";

// Family Rewards account pages are personalised: never cache them in a shared
// CDN, never index them. (The jurassicenglish.com proxy in the root
// vercel.json sets the same headers for these paths.)
const PRIVATE_HEADERS = [
  { key: "Cache-Control", value: "private, no-store, max-age=0" },
  { key: "X-Robots-Tag", value: "noindex, nofollow" },
  // same-origin, not no-referrer: no-referrer makes browsers send "Origin: null" on
  // form POSTs, which the same-origin check (correctly) refuses.
  { key: "Referrer-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      { source: "/student-academy/referrals/account", headers: PRIVATE_HEADERS },
      { source: "/student-academy/referrals/account/:path*", headers: PRIVATE_HEADERS },
    ];
  },
};

export default nextConfig;
