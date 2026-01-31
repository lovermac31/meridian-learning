"use client";

import { useEffect, useState } from "react";
// import { User, UserAnalytics, getUserAnalytics } from "@/lib/users";
// import { collection, getDocs } from "firebase/firestore";
// import { db } from "@/lib/firebase";
import { mockUsers, getMockAnalytics, User, UserAnalytics } from "@/lib/mockUsers";

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Using mock data instead of Firebase
    setLoading(true);
    try {
      setUsers(mockUsers);
      const analyticsData = getMockAnalytics();
      setAnalytics(analyticsData);
    } catch (err) {
      console.error("Error loading mock analytics:", err);
      setError("Failed to load analytics.");
    } finally {
      setLoading(false);
    }

    // Original Firebase code (commented out):
    // const fetchAnalytics = async () => {
    //   try {
    //     setLoading(true);
    //     const usersCollection = collection(db, "users");
    //     const usersSnapshot = await getDocs(usersCollection);
    //     const usersList: User[] = usersSnapshot.docs.map((doc) => ({
    //       ...doc.data(),
    //       createdAt: doc.data().createdAt?.toDate() || new Date(),
    //       lastLoginAt: doc.data().lastLoginAt?.toDate() || new Date(),
    //     } as User));
    //
    //     setUsers(usersList);
    //
    //     const analyticsData = await getUserAnalytics(usersList);
    //     setAnalytics(analyticsData);
    //   } catch (err) {
    //     console.error("Error fetching analytics:", err);
    //     setError("Failed to load analytics. Make sure you're signed in.");
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    //
    // fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h2 className="text-red-800 font-bold mb-2">Error</h2>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Demo Mode Banner */}
        <div className="mb-4 bg-yellow-100 border border-yellow-400 rounded-lg p-4">
          <p className="text-yellow-800 font-semibold text-center">
            DEMO MODE - Using Mock Data
          </p>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Meridian Learning Admin Dashboard
          </h1>
          <p className="text-gray-600">Real-time platform analytics</p>
        </div>

        {/* Key Metrics */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Users */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {analytics.totalUsers}
                  </p>
                </div>
                <div className="text-4xl text-blue-600">👥</div>
              </div>
            </div>

            {/* Active Today */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Active Today</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {analytics.activeUsersToday}
                  </p>
                </div>
                <div className="text-4xl text-green-600">✓</div>
              </div>
            </div>

            {/* Episodes Watched */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Episodes Watched</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {analytics.totalEpisodesWatched}
                  </p>
                </div>
                <div className="text-4xl text-purple-600">▶</div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Chat Messages</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {analytics.totalChatMessages}
                  </p>
                </div>
                <div className="text-4xl text-orange-600">💬</div>
              </div>
            </div>
          </div>
        )}

        {/* Users List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Registered Users</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                    Display Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                    Episodes Watched
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                    Chat Messages
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{user.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.displayName}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {user.episodesWatched.length}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {user.totalChatMessages}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            user.subscriptionStatus === "premium"
                              ? "bg-green-100 text-green-800"
                              : user.subscriptionStatus === "trial"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {user.subscriptionStatus}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No users yet. Users will appear here after they sign up.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-600 text-sm">
          <p>Last updated: {new Date().toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
