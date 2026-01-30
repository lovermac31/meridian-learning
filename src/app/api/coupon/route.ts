import { NextRequest, NextResponse } from "next/server";

// Mock coupon database (replace with Blue Goose API in Phase 1.5)
const VALID_COUPONS: { [key: string]: { episodes: string[]; expiresAt: string } } = {
  "DEMO-2026-001": {
    episodes: ["all"],
    expiresAt: "2026-12-31",
  },
  "STUDENT-REACT-101": {
    episodes: ["understanding-react-hooks", "state-management"],
    expiresAt: "2026-06-30",
  },
  "TRIAL-7DAYS": {
    episodes: ["all"],
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
};

export async function POST(request: NextRequest) {
  try {
    const { couponCode } = await request.json();

    if (!couponCode) {
      return NextResponse.json(
        { error: "Coupon code is required" },
        { status: 400 }
      );
    }

    const coupon = VALID_COUPONS[couponCode.toUpperCase()];

    if (!coupon) {
      return NextResponse.json(
        { valid: false, message: "Invalid or expired coupon code" },
        { status: 200 }
      );
    }

    const expiryDate = new Date(coupon.expiresAt);
    const isExpired = expiryDate < new Date();

    if (isExpired) {
      return NextResponse.json(
        { valid: false, message: "Coupon has expired" },
        { status: 200 }
      );
    }

    return NextResponse.json({
      valid: true,
      message: "Coupon accepted!",
      unlockedEpisodes: coupon.episodes,
      expiresAt: coupon.expiresAt,
    });
  } catch (error) {
    console.error("Error validating coupon:", error);
    return NextResponse.json(
      { error: "Failed to validate coupon" },
      { status: 500 }
    );
  }
}
