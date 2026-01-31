// File: src/lib/auth-service.ts
// Simple email-based authentication using localStorage
// Build 7: Auth Bypass for demo

export interface CurrentUser {
  email: string;
  displayName: string;
  loginTime: Date;
}

const AUTH_STORAGE_KEY = 'meridian_user';

/**
 * Login user with email only (no password verification)
 * For demo purposes - will upgrade to Firebase Auth post-demo
 */
export function loginUser(email: string, displayName?: string): CurrentUser {
  const user: CurrentUser = {
    email: email.toLowerCase().trim(),
    displayName: displayName || email.split('@')[0],
    loginTime: new Date(),
  };

  // Store in localStorage
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));

  console.log('User logged in:', user.email);
  return user;
}

/**
 * Get currently logged in user
 */
export function getCurrentUser(): CurrentUser | null {
  if (typeof window === 'undefined') return null;

  const stored = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!stored) return null;

  try {
    const user = JSON.parse(stored);
    // Convert loginTime back to Date object
    user.loginTime = new Date(user.loginTime);
    return user;
  } catch (error) {
    console.error('Error parsing stored user:', error);
    return null;
  }
}

/**
 * Logout current user
 */
export function logoutUser(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  console.log('User logged out');
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}

/**
 * Get user ID for Firestore operations
 * Uses email as unique identifier
 */
export function getUserId(): string | null {
  const user = getCurrentUser();
  if (!user) return null;

  // Use email as userId (sanitized for Firestore document ID)
  // Replace invalid characters with underscores
  return user.email.replace(/[^a-zA-Z0-9]/g, '_');
}
