// File: src/app/login/page.tsx
// Professional login page with educational AI theme
// Build 7: Auth Bypass

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loginUser } from '@/lib/auth-service';
import { BookOpen, Brain, Sparkles, GraduationCap, Shield } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      alert('Please enter your email');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      // Login user (stores in localStorage)
      loginUser(email, displayName || undefined);

      // Redirect to home page
      router.push('/');
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-purple-700 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-300 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Hero Section - Logo/Brand */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <GraduationCap className="w-12 h-12 text-white" />
              <Sparkles className="w-5 h-5 text-yellow-300 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <h1 className="text-5xl font-bold text-white mb-2">
              Meridian Learning
            </h1>
          </div>
          <h2 className="text-xl font-semibold text-indigo-100 mb-2">
            Transform Your Learning Journey with AI-Powered Education
          </h2>
          <p className="text-sm text-indigo-200">
            Personalized lessons, real-time assistance, and measurable progress
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-white/20 backdrop-blur-sm">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Brain className="w-6 h-6 text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              Welcome Back
            </h2>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Display Name */}
            <div>
              <label
                htmlFor="displayName"
                className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4 text-indigo-600" />
                Your Name (Optional)
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all hover:border-indigo-300"
                disabled={isLoading}
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all hover:border-indigo-300"
                disabled={isLoading}
                autoComplete="email"
              />
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all font-medium text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Logging in...
                </span>
              ) : (
                'Continue Learning'
              )}
            </button>
          </form>

          {/* Demo Notice */}
          <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border-2 border-indigo-200">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-indigo-900 mb-1">
                  Demo Mode
                </p>
                <p className="text-xs text-indigo-700">
                  No password required. Your progress will be saved using your email address.
                </p>
              </div>
            </div>
          </div>

          {/* Admin Access Section */}
          <div className="mt-8">
            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Administrator Access</span>
              </div>
            </div>

            {/* Security Notice */}
            <p className="text-xs text-gray-500 text-center mb-3">
              🔒 Secure admin access with password authentication
            </p>

            {/* Admin Login Button */}
            <Link
              href="/admin/login"
              className="w-full flex items-center justify-center gap-2 px-6 py-3 border-2 border-purple-600 text-purple-600 hover:bg-purple-50 rounded-lg transition-all font-medium group"
            >
              <Shield className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>Admin Portal</span>
            </Link>
          </div>
        </div>

        {/* Terms Footer */}
        <p className="text-center text-xs text-indigo-200 mt-6">
          By continuing, you agree to our{' '}
          <a href="#" className="underline hover:text-white transition-colors">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="underline hover:text-white transition-colors">
            Privacy Policy
          </a>
        </p>

        {/* Copyright Footer */}
        <p className="text-center text-xs text-indigo-300 mt-4">
          © 2026 WorldWise Learning. All rights reserved.
        </p>
      </div>
    </div>
  );
}
