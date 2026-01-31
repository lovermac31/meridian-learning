// Admin Authentication Service
// Single admin session with password protection

const ADMIN_PASSWORD = "lovermac31";
const ADMIN_SESSION_KEY = "meridian_admin_session";
const ADMIN_SESSION_ID_KEY = "meridian_admin_session_id";

// Generate unique session ID
function generateSessionId(): string {
  return `admin_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

// Check if admin is authenticated
export function isAdminAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;

  const session = localStorage.getItem(ADMIN_SESSION_KEY);
  const sessionId = localStorage.getItem(ADMIN_SESSION_ID_KEY);

  return session === 'active' && !!sessionId;
}

// Get current admin session ID
export function getAdminSessionId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ADMIN_SESSION_ID_KEY);
}

// Admin login
export function adminLogin(password: string): { success: boolean; error?: string } {
  if (password !== ADMIN_PASSWORD) {
    return { success: false, error: 'Invalid password' };
  }

  // Check if another session exists
  const existingSessionId = localStorage.getItem(ADMIN_SESSION_ID_KEY);

  // For single session enforcement, we'll allow login but track session ID
  // In a production system, you'd check server-side for active sessions
  const sessionId = generateSessionId();

  localStorage.setItem(ADMIN_SESSION_KEY, 'active');
  localStorage.setItem(ADMIN_SESSION_ID_KEY, sessionId);

  return { success: true };
}

// Admin logout
export function adminLogout(): void {
  localStorage.removeItem(ADMIN_SESSION_KEY);
  localStorage.removeItem(ADMIN_SESSION_ID_KEY);
}

// Get admin data (for display purposes)
export function getAdminData() {
  return {
    username: 'Admin',
    email: 'admin@meridianlearning.com',
    role: 'Administrator'
  };
}
