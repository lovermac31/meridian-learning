// File: src/lib/user.ts
// Updated for Build 6: Video Progress Tracking

export interface EpisodeProgress {
  lastPosition: number; // Current time in seconds
  isCompleted: boolean;
  lastWatched: Date;
  completedAt?: Date;
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  createdAt: Date;
  lastLogin: Date;
  subscription: {
    type: 'free' | 'trial' | 'premium';
    startDate: Date;
    endDate?: Date;
  };
  episodeProgress: {
    [episodeId: string]: EpisodeProgress;
  };
}

export interface UserAnalytics {
  totalUsers: number;
  activeToday: number;
  episodesWatched: number;
  chatMessages: number;
  averageWatchTime: number;
  completionRate: number;
}

export interface UserWithStats extends User {
  episodesWatched: number;
  messagesCount: number;
  watchTime: number;
}
