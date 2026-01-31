import { db } from "./firebase";
import { collection, doc, setDoc } from "firebase/firestore";
import { User } from "./user";

export async function createUserDocument(userId: string, userData: Partial<User>) {
  try {
    const userRef = doc(db, "users", userId);
    const newUser: User = {
      uid: userId,
      email: userData.email || "",
      displayName: userData.displayName || "New User",
      createdAt: new Date(),
      lastLogin: new Date(),
      subscription: {
        type: userData.subscription?.type || "free",
        startDate: userData.subscription?.startDate || new Date(),
        endDate: userData.subscription?.endDate,
      },
      episodeProgress: userData.episodeProgress || {},
      ...userData,
    };
    await setDoc(userRef, newUser);
    return newUser;
  } catch (error) {
    console.error("Error creating user document:", error);
    throw error;
  }
}

export async function logEpisodeView(userId: string, episodeId: string) {
  try {
    const userRef = doc(db, "users", userId);
    const episodeView = {
      episodeId,
      viewedAt: new Date(),
    };
    // Store in subcollection for detailed history
    const viewRef = doc(collection(userRef, "episodeViews"));
    await setDoc(viewRef, episodeView);
  } catch (error) {
    console.error("Error logging episode view:", error);
  }
}

export async function logChatMessage(userId: string) {
  try {
    const userRef = doc(db, "users", userId);
    // Increment chat message count (will implement in Phase 1.5 with transactions)
    console.log("Chat message logged for user:", userId);
  } catch (error) {
    console.error("Error logging chat message:", error);
  }
}

export async function redeemCoupon(userId: string, couponCode: string) {
  try {
    const userRef = doc(db, "users", userId);
    const couponRedemption = {
      couponCode,
      redeemedAt: new Date(),
    };
    // Store in subcollection for detailed history
    const redemptionRef = doc(collection(userRef, "couponsRedeemed"));
    await setDoc(redemptionRef, couponRedemption);
  } catch (error) {
    console.error("Error redeeming coupon:", error);
  }
}
