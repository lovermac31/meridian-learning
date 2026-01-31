'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
  Activity,
  PlayCircle,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Clock,
  Award,
  AlertCircle,
  CheckCircle2,
  LogOut,
  RefreshCw,
  Home,
  Search,
  Filter,
  Download,
  BarChart3,
  Zap,
  Shield,
  Database,
} from 'lucide-react';
import { isAdminAuthenticated, adminLogout, getAdminData } from '@/lib/admin-auth';
import {
  fetchAdminDashboard,
  AdminDashboardData,
  ActivityLog,
  SystemHealth,
} from '@/lib/admin-analytics';
import { UserWithStats } from '@/lib/user';

export default function AdminDashboardEnhanced() {
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'free' | 'trial' | 'premium'>('all');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Check authentication
  useEffect(() => {
    if (!isAdminAuthenticated()) {
      router.push('/admin/login');
    }
  }, [router]);

  // Fetch dashboard data
  useEffect(() => {
    loadDashboardData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      refreshDashboard();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await fetchAdminDashboard();
      setDashboardData(data);
      setLastRefresh(new Date());
      setError(null);
    } catch (err) {
      console.error('Error loading dashboard:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const refreshDashboard = async () => {
    try {
      setRefreshing(true);
      const data = await fetchAdminDashboard();
      setDashboardData(data);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Error refreshing dashboard:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to log out?')) {
      adminLogout();
      router.push('/admin/login');
    }
  };

  // Filter users
  const filteredUsers = dashboardData?.users.filter((user) => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.displayName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === 'all' || user.subscription.type === filterStatus;

    return matchesSearch && matchesFilter;
  }) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
            <Shield className="w-8 h-8 text-purple-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-purple-200 text-lg font-medium">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-red-500/10 border border-red-500/50 rounded-2xl p-8 max-w-md backdrop-blur-xl">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-200 mb-2 text-center">Error Loading Dashboard</h2>
          <p className="text-red-300 text-center mb-6">{error || 'Unknown error occurred'}</p>
          <button
            onClick={loadDashboardData}
            className="w-full py-3 px-6 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { analytics, users, recentActivity, systemHealth } = dashboardData;

  // Calculate trend data (mock comparison with previous period)
  const trends = {
    users: 12.5,
    activeToday: 8.3,
    episodes: 15.7,
    messages: 22.4,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Top Navigation */}
      <nav className="bg-white/5 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-purple-500 blur-xl opacity-50"></div>
                <Shield className="w-8 h-8 text-purple-400 relative" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-purple-200 text-sm">Meridian Learning Platform</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Refresh Button */}
              <button
                onClick={refreshDashboard}
                disabled={refreshing}
                className="p-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-all text-purple-200 hover:text-white disabled:opacity-50"
                title="Refresh data"
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>

              {/* Home Link */}
              <Link
                href="/"
                className="p-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-all text-purple-200 hover:text-white"
                title="Back to learning"
              >
                <Home className="w-5 h-5" />
              </Link>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-all flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* System Health Bar */}
        <div className={`p-4 rounded-xl border backdrop-blur-xl ${
          systemHealth.status === 'healthy'
            ? 'bg-green-500/10 border-green-500/50'
            : systemHealth.status === 'warning'
            ? 'bg-yellow-500/10 border-yellow-500/50'
            : 'bg-red-500/10 border-red-500/50'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Database className={`w-5 h-5 ${
                systemHealth.status === 'healthy'
                  ? 'text-green-400'
                  : systemHealth.status === 'warning'
                  ? 'text-yellow-400'
                  : 'text-red-400'
              }`} />
              <div>
                <p className="text-white font-semibold">
                  System Status: <span className="uppercase">{systemHealth.status}</span>
                </p>
                <p className="text-xs text-purple-200">
                  API Response: {systemHealth.apiResponseTime}ms | Last update: {lastRefresh.toLocaleTimeString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-purple-200">
              <span>24h Requests: {systemHealth.totalRequests24h.toLocaleString()}</span>
              <span>Error Rate: {systemHealth.errorRate.toFixed(2)}%</span>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Users */}
          <MetricCard
            title="Total Users"
            value={analytics.totalUsers}
            icon={<Users className="w-8 h-8 text-blue-400" />}
            trend={trends.users}
            trendUp={true}
            gradientFrom="from-blue-600"
            gradientTo="to-cyan-600"
          />

          {/* Active Today */}
          <MetricCard
            title="Active Today"
            value={analytics.activeToday}
            icon={<Activity className="w-8 h-8 text-green-400" />}
            trend={trends.activeToday}
            trendUp={true}
            gradientFrom="from-green-600"
            gradientTo="to-emerald-600"
          />

          {/* Episodes Watched */}
          <MetricCard
            title="Episodes Watched"
            value={analytics.episodesWatched}
            icon={<PlayCircle className="w-8 h-8 text-purple-400" />}
            trend={trends.episodes}
            trendUp={true}
            gradientFrom="from-purple-600"
            gradientTo="to-pink-600"
          />

          {/* Chat Messages */}
          <MetricCard
            title="Chat Messages"
            value={analytics.chatMessages}
            icon={<MessageSquare className="w-8 h-8 text-orange-400" />}
            trend={trends.messages}
            trendUp={true}
            gradientFrom="from-orange-600"
            gradientTo="to-red-600"
          />
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Average Watch Time */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-500/20 rounded-xl">
                  <Clock className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <p className="text-purple-200 text-sm">Avg Watch Time</p>
                  <p className="text-3xl font-bold text-white">
                    {Math.floor(analytics.averageWatchTime / 60)}m {analytics.averageWatchTime % 60}s
                  </p>
                </div>
              </div>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all"
                style={{ width: `${Math.min((analytics.averageWatchTime / 1200) * 100, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Completion Rate */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-500/20 rounded-xl">
                  <Award className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <p className="text-purple-200 text-sm">Completion Rate</p>
                  <p className="text-3xl font-bold text-white">{analytics.completionRate}%</p>
                </div>
              </div>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-amber-500 to-yellow-500 h-2 rounded-full transition-all"
                style={{ width: `${analytics.completionRate}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-yellow-400" />
              <h2 className="text-xl font-bold text-white">Recent Activity</h2>
            </div>
            <span className="text-sm text-purple-200">Live updates</span>
          </div>
          <div className="p-6 space-y-3 max-h-96 overflow-y-auto">
            {recentActivity.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5" />
                Registered Users ({filteredUsers.length})
              </h2>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                {/* Search */}
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-300" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-64 pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Filter */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Users</option>
                  <option value="free">Free</option>
                  <option value="trial">Trial</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">
                    Episodes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">
                    Messages
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">
                    Watch Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">
                    Last Active
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.uid} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-white font-medium">{user.displayName}</p>
                          <p className="text-purple-300 text-sm">{user.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            user.subscription.type === 'premium'
                              ? 'bg-green-500/20 text-green-300 border border-green-500/50'
                              : user.subscription.type === 'trial'
                              ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/50'
                              : 'bg-gray-500/20 text-gray-300 border border-gray-500/50'
                          }`}
                        >
                          {user.subscription.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-white">{user.episodesWatched}/5</td>
                      <td className="px-6 py-4 text-white">{user.messagesCount}</td>
                      <td className="px-6 py-4 text-purple-200">
                        {Math.floor(user.watchTime / 60)}m {user.watchTime % 60}s
                      </td>
                      <td className="px-6 py-4 text-purple-200 text-sm">
                        {formatRelativeTime(user.lastLogin)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-purple-300">
                      No users found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 mt-12">
        <div className="text-center text-purple-200/50 text-sm">
          <p>© 2026 WorldWise Learning. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

// Metric Card Component
function MetricCard({
  title,
  value,
  icon,
  trend,
  trendUp,
  gradientFrom,
  gradientTo,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  trend: number;
  trendUp: boolean;
  gradientFrom: string;
  gradientTo: string;
}) {
  return (
    <div className="relative group">
      <div className={`absolute inset-0 bg-gradient-to-r ${gradientFrom} ${gradientTo} rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity`}></div>
      <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all">
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 bg-white/10 rounded-xl">{icon}</div>
          <div className={`flex items-center gap-1 text-sm font-medium ${trendUp ? 'text-green-400' : 'text-red-400'}`}>
            {trendUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span>{trend.toFixed(1)}%</span>
          </div>
        </div>
        <div>
          <p className="text-purple-200 text-sm mb-1">{title}</p>
          <p className="text-4xl font-bold text-white">{value.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}

// Activity Item Component
function ActivityItem({ activity }: { activity: ActivityLog }) {
  const icons = {
    login: <Activity className="w-4 h-4 text-blue-400" />,
    episode_complete: <PlayCircle className="w-4 h-4 text-purple-400" />,
    chat_message: <MessageSquare className="w-4 h-4 text-orange-400" />,
    signup: <Users className="w-4 h-4 text-green-400" />,
  };

  return (
    <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all border border-white/5">
      <div className="p-2 bg-white/10 rounded-lg">{icons[activity.type]}</div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium">{activity.userName}</p>
        <p className="text-purple-200 text-xs">{activity.details}</p>
      </div>
      <div className="text-xs text-purple-300 whitespace-nowrap">
        {formatRelativeTime(activity.timestamp)}
      </div>
    </div>
  );
}

// Helper function to format relative time
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}
