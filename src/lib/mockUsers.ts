export interface User {
  id: string;
  email: string;
  displayName: string;
  createdAt: Date;
  lastLoginAt: Date;
  subscriptionStatus: "free" | "trial" | "premium";
  couponsRedeemed: string[];
  episodesWatched: string[];
  totalChatMessages: number;
}

export interface UserAnalytics {
  totalUsers: number;
  totalEpisodesWatched: number;
  totalCouponsRedeemed: number;
  totalChatMessages: number;
  averageMessagesPerUser: number;
  activeUsersToday: number;
}

// Generate dates over the past week
const now = new Date();
const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

export const mockUsers: User[] = [
  {
    id: "user_001",
    email: "sarah.chen@example.com",
    displayName: "Sarah Chen",
    createdAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
    lastLoginAt: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
    subscriptionStatus: "premium",
    couponsRedeemed: ["DEMO-2026-001"],
    episodesWatched: [
      "understanding-react-hooks",
      "state-management",
      "component-lifecycle",
      "hooks-advanced",
      "performance-optimization",
    ],
    totalChatMessages: 47,
  },
  {
    id: "user_002",
    email: "michael.rodriguez@example.com",
    displayName: "Michael Rodriguez",
    createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    lastLoginAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    subscriptionStatus: "trial",
    couponsRedeemed: ["TRIAL-7DAYS"],
    episodesWatched: ["understanding-react-hooks", "state-management"],
    totalChatMessages: 12,
  },
  {
    id: "user_003",
    email: "emily.johnson@example.com",
    displayName: "Emily Johnson",
    createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    lastLoginAt: new Date(now.getTime() - 30 * 60 * 1000), // 30 minutes ago
    subscriptionStatus: "free",
    couponsRedeemed: [],
    episodesWatched: ["understanding-react-hooks"],
    totalChatMessages: 3,
  },
  {
    id: "user_004",
    email: "david.kim@example.com",
    displayName: "David Kim",
    createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    lastLoginAt: new Date(now.getTime() - 5 * 60 * 60 * 1000), // 5 hours ago
    subscriptionStatus: "premium",
    couponsRedeemed: ["DEMO-2026-001", "STUDENT-REACT-101"],
    episodesWatched: [
      "understanding-react-hooks",
      "state-management",
      "component-lifecycle",
    ],
    totalChatMessages: 28,
  },
  {
    id: "user_005",
    email: "priya.patel@example.com",
    displayName: "Priya Patel",
    createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    lastLoginAt: new Date(now.getTime() - 15 * 60 * 1000), // 15 minutes ago
    subscriptionStatus: "free",
    couponsRedeemed: [],
    episodesWatched: [],
    totalChatMessages: 0,
  },
];

export function getMockAnalytics(): UserAnalytics {
  const totalUsers = mockUsers.length;
  const totalEpisodesWatched = mockUsers.reduce(
    (sum, user) => sum + user.episodesWatched.length,
    0
  );
  const totalCouponsRedeemed = mockUsers.reduce(
    (sum, user) => sum + user.couponsRedeemed.length,
    0
  );
  const totalChatMessages = mockUsers.reduce(
    (sum, user) => sum + user.totalChatMessages,
    0
  );
  const averageMessagesPerUser =
    totalUsers > 0 ? totalChatMessages / totalUsers : 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const activeUsersToday = mockUsers.filter(
    (user) => new Date(user.lastLoginAt) >= today
  ).length;

  return {
    totalUsers,
    totalEpisodesWatched,
    totalCouponsRedeemed,
    totalChatMessages,
    averageMessagesPerUser: Math.round(averageMessagesPerUser * 100) / 100,
    activeUsersToday,
  };
}
