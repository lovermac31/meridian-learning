// File: src/app/login/page.tsx
// Professional login page with educational AI theme
// Build 7: Auth Bypass

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loginUser } from '@/lib/auth-service';
import { BookOpen, Brain, Sparkles, GraduationCap, Shield } from 'lucide-react';

// 3D Halogen floating shapes that move across entire screen
const FloatingShapes = () => {
  return (
    <>
      {/* Add perspective container */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none perspective-container">
        {/* Brain/Neural Network - Diagonal traverse with 3D rotation */}
        <div className="absolute animate-traverse-diagonal-1">
          <div className="w-40 h-40 relative transform-3d">
            {/* Halogen glow layers */}
            <div className="absolute inset-0 bg-purple-500 rounded-2xl blur-2xl opacity-50 animate-pulse-glow"></div>
            <div className="absolute inset-0 bg-purple-400 rounded-2xl blur-xl opacity-60 animate-pulse-glow-delayed"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-2xl shadow-2xl shadow-purple-500/50 animate-rotate-3d"></div>
            <div className="absolute inset-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20"></div>
            <svg className="absolute inset-4 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
            </svg>
          </div>
        </div>

        {/* Book - Horizontal sweep with 3D tilt */}
        <div className="absolute animate-traverse-horizontal">
          <div className="w-36 h-36 relative transform-3d">
            <div className="absolute inset-0 bg-blue-500 rounded-xl blur-2xl opacity-50 animate-pulse-glow"></div>
            <div className="absolute inset-0 bg-blue-400 rounded-xl blur-xl opacity-60"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-600 rounded-xl shadow-2xl shadow-blue-500/50 animate-tilt-3d"></div>
            <svg className="absolute inset-4 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
            </svg>
          </div>
        </div>

        {/* Lightbulb - Vertical float with intense glow */}
        <div className="absolute animate-traverse-vertical">
          <div className="w-32 h-32 relative transform-3d">
            <div className="absolute inset-0 bg-yellow-400 rounded-full blur-3xl opacity-70 animate-pulse-glow"></div>
            <div className="absolute inset-0 bg-orange-400 rounded-full blur-2xl opacity-50 animate-pulse-glow-delayed"></div>
            <div className="absolute -inset-2 bg-yellow-500/30 rounded-full blur-xl"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-2xl shadow-yellow-500/70 animate-rotate-3d-slow"></div>
            <svg className="absolute inset-4 text-white drop-shadow-[0_0_12px_rgba(255,255,255,1)]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
            </svg>
          </div>
        </div>

        {/* Chip/AI - Diagonal opposite with 3D spin */}
        <div className="absolute animate-traverse-diagonal-2">
          <div className="w-44 h-44 relative transform-3d">
            <div className="absolute inset-0 bg-indigo-500 rounded-2xl blur-2xl opacity-50 animate-pulse-glow-delayed"></div>
            <div className="absolute inset-0 bg-purple-500 rounded-2xl blur-xl opacity-60"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-2xl transform rotate-45 shadow-2xl shadow-indigo-500/50 animate-spin-3d"></div>
            <div className="absolute inset-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 animate-rotate-3d-reverse"></div>
            <svg className="absolute inset-6 text-white transform -rotate-45 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"/>
            </svg>
          </div>
        </div>

        {/* Atom - Circular orbit path */}
        <div className="absolute animate-traverse-orbit">
          <div className="w-28 h-28 relative transform-3d">
            <div className="absolute inset-0 bg-cyan-500 rounded-full blur-2xl opacity-60 animate-pulse-glow"></div>
            <div className="absolute inset-0 bg-blue-400 rounded-full blur-xl opacity-50"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full shadow-2xl shadow-cyan-500/50 animate-rotate-3d"></div>
            <svg className="absolute inset-3 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] animate-spin-3d" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
              <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/>
              <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(-60 12 12)"/>
              <ellipse cx="12" cy="12" rx="10" ry="4"/>
            </svg>
          </div>
        </div>

        {/* Graduation Cap - Zigzag pattern */}
        <div className="absolute animate-traverse-zigzag">
          <div className="w-36 h-36 relative transform-3d">
            <div className="absolute inset-0 bg-green-500 rounded-xl blur-2xl opacity-50 animate-pulse-glow-delayed"></div>
            <div className="absolute inset-0 bg-emerald-400 rounded-xl blur-xl opacity-60"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl shadow-2xl shadow-green-500/50 animate-tilt-3d"></div>
            <svg className="absolute inset-5 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/>
            </svg>
          </div>
        </div>

        {/* Code Brackets - Wave motion */}
        <div className="absolute animate-traverse-wave">
          <div className="w-32 h-32 relative transform-3d">
            <div className="absolute inset-0 bg-pink-500 rounded-lg blur-2xl opacity-50 animate-pulse-glow"></div>
            <div className="absolute inset-0 bg-rose-400 rounded-lg blur-xl opacity-60"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-pink-400 to-rose-600 rounded-lg shadow-2xl shadow-pink-500/50 animate-rotate-3d-slow"></div>
            <svg className="absolute inset-4 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.9)]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
            </svg>
          </div>
        </div>

        {/* Network Nodes - Spiral motion */}
        <div className="absolute animate-traverse-spiral">
          <div className="w-40 h-40 relative transform-3d">
            <div className="absolute inset-0 bg-violet-500 rounded-full blur-3xl opacity-60 animate-pulse-glow-delayed"></div>
            <div className="absolute inset-0 bg-purple-400 rounded-full blur-2xl opacity-50"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-violet-400 to-purple-600 rounded-full shadow-2xl shadow-violet-500/60 animate-rotate-3d"></div>
            <svg className="absolute inset-4 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="2" fill="currentColor"/>
              <circle cx="6" cy="6" r="2" fill="currentColor"/>
              <circle cx="18" cy="6" r="2" fill="currentColor"/>
              <circle cx="6" cy="18" r="2" fill="currentColor"/>
              <circle cx="18" cy="18" r="2" fill="currentColor"/>
              <line x1="12" y1="12" x2="6" y2="6"/>
              <line x1="12" y1="12" x2="18" y2="6"/>
              <line x1="12" y1="12" x2="6" y2="18"/>
              <line x1="12" y1="12" x2="18" y2="18"/>
            </svg>
          </div>
        </div>
      </div>
    </>
  );
};

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

      {/* Animated Geometric Shapes */}
      <FloatingShapes />

      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-indigo-500/5 animate-pulse pointer-events-none"></div>

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
