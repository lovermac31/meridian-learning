// Admin Analytics Service
// Real-time Firebase data fetching for admin dashboard

import { collection, getDocs, query, orderBy, limit, where, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import { User, UserAnalytics, UserWithStats } from './user';

export interface AdminDashboardData {
  analytics: UserAnalytics;
  users: UserWithStats[];
  recentActivity: ActivityLog[];
  systemHealth: SystemHealth;
}

export interface ActivityLog {
  id: string;
  type: 'login' | 'episode_complete' | 'chat_message' | 'signup';
  userId: string;
  userEmail: string;
  userName: string;
  details: string;
  timestamp: Date;
}

export interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  apiResponseTime: number;
  databaseStatus: 'connected' | 'disconnected';
  lastUpdate: Date;
  totalRequests24h: number;
  errorRate: number;
}

// Fetch all users with stats
export async function fetchUsersWithStats(): Promise<UserWithStats[]> {
  try {
    const usersRef = collection(db, 'users');
    const usersSnap = await getDocs(usersRef);

    const users: UserWithStats[] = await Promise.all(
      usersSnap.docs.map(async (doc) => {
        const userData = doc.data();

        // Count episodes watched
        const episodeProgress = userData.episodeProgress || {};
        const episodesWatched = Object.values(episodeProgress).filter(
          (progress: any) => progress.isCompleted
        ).length;

        // Count chat messages
        const chatsRef = collection(db, 'chats');
        const userChatsQuery = query(chatsRef, where('userId', '==', doc.id));
        const chatsSnap = await getDocs(userChatsQuery);

        let messagesCount = 0;
        chatsSnap.forEach((chatDoc) => {
          const chatData = chatDoc.data();
          messagesCount += (chatData.messages || []).filter(
            (msg: any) => msg.role === 'user'
          ).length;
        });

        // Calculate watch time from episode progress
        let watchTime = 0;
        Object.values(episodeProgress).forEach((progress: any) => {
          watchTime += progress.lastPosition || 0;
        });

        return {
          uid: doc.id,
          email: userData.email || 'unknown@example.com',
          displayName: userData.displayName || 'Unknown User',
          createdAt: userData.createdAt?.toDate?.() || new Date(),
          lastLogin: userData.lastLogin?.toDate?.() || new Date(),
          subscription: userData.subscription || { type: 'free', startDate: new Date() },
          episodeProgress: episodeProgress,
          episodesWatched,
          messagesCount,
          watchTime: Math.round(watchTime),
        };
      })
    );

    return users;
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

// Calculate analytics from user data
export function calculateAnalytics(users: UserWithStats[]): UserAnalytics {
  const totalUsers = users.length;

  const episodesWatched = users.reduce((sum, user) => sum + user.episodesWatched, 0);

  const chatMessages = users.reduce((sum, user) => sum + user.messagesCount, 0);

  const totalWatchTime = users.reduce((sum, user) => sum + user.watchTime, 0);
  const averageWatchTime = totalUsers > 0 ? Math.round(totalWatchTime / totalUsers) : 0;

  // Calculate active users today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const activeToday = users.filter((user) => {
    const loginDate = new Date(user.lastLogin);
    return loginDate >= today;
  }).length;

  // Calculate completion rate
  const totalPossibleCompletions = totalUsers * 5; // 5 episodes total
  const completionRate = totalPossibleCompletions > 0
    ? Math.round((episodesWatched / totalPossibleCompletions) * 100)
    : 0;

  return {
    totalUsers,
    activeToday,
    episodesWatched,
    chatMessages,
    averageWatchTime,
    completionRate,
  };
}

// Fetch recent activity (mock for now, can be implemented with activity logging)
export async function fetchRecentActivity(): Promise<ActivityLog[]> {
  // In a real implementation, this would query an activity log collection
  // For now, we'll generate mock recent activity based on user data
  try {
    const users = await fetchUsersWithStats();

    const activities: ActivityLog[] = [];

    users.forEach((user, index) => {
      // Add login activity
      activities.push({
        id: `activity_${index}_login`,
        type: 'login',
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName,
        details: 'User logged in',
        timestamp: user.lastLogin,
      });

      // Add episode completion activities
      if (user.episodesWatched > 0) {
        activities.push({
          id: `activity_${index}_episode`,
          type: 'episode_complete',
          userId: user.uid,
          userEmail: user.email,
          userName: user.displayName,
          details: `Completed ${user.episodesWatched} episode(s)`,
          timestamp: user.lastLogin,
        });
      }

      // Add chat activity
      if (user.messagesCount > 0) {
        activities.push({
          id: `activity_${index}_chat`,
          type: 'chat_message',
          userId: user.uid,
          userEmail: user.email,
          userName: user.displayName,
          details: `Sent ${user.messagesCount} message(s)`,
          timestamp: user.lastLogin,
        });
      }
    });

    // Sort by timestamp descending and limit to 10
    return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 10);
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return [];
  }
}

// Get system health metrics
export async function getSystemHealth(): Promise<SystemHealth> {
  try {
    const startTime = Date.now();

    // Test database connection
    const testQuery = await getDocs(query(collection(db, 'users'), limit(1)));
    const responseTime = Date.now() - startTime;

    return {
      status: responseTime < 500 ? 'healthy' : responseTime < 1000 ? 'warning' : 'critical',
      apiResponseTime: responseTime,
      databaseStatus: 'connected',
      lastUpdate: new Date(),
      totalRequests24h: Math.floor(Math.random() * 1000) + 500, // Mock data
      errorRate: Math.random() * 2, // Mock data: 0-2%
    };
  } catch (error) {
    console.error('Error checking system health:', error);
    return {
      status: 'critical',
      apiResponseTime: 0,
      databaseStatus: 'disconnected',
      lastUpdate: new Date(),
      totalRequests24h: 0,
      errorRate: 100,
    };
  }
}

// Fetch complete dashboard data
export async function fetchAdminDashboard(): Promise<AdminDashboardData> {
  const users = await fetchUsersWithStats();
  const analytics = calculateAnalytics(users);
  const recentActivity = await fetchRecentActivity();
  const systemHealth = await getSystemHealth();

  return {
    analytics,
    users,
    recentActivity,
    systemHealth,
  };
}
