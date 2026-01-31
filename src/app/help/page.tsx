// File: src/app/help/page.tsx
// Comprehensive Help & FAQ page for Meridian Learning

'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpen,
  Lock,
  Video,
  Smartphone,
  Wrench,
  Rocket,
  Code,
  Mail,
  Search,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Home,
  MessageCircle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  icon: React.ReactNode;
}

const faqs: FAQ[] = [
  // GETTING STARTED
  {
    id: 'what-is-meridian',
    question: 'What is Meridian Learning?',
    answer: 'Meridian Learning is an AI-powered educational platform designed to teach React development through interactive video lessons with real-time AI assistance. Built on standards-aligned curriculum (CEFR, CCSS, iPGCE), the platform combines professional video instruction with Claude AI to provide personalized learning support.',
    category: 'Getting Started',
    icon: <BookOpen className="w-5 h-5" />,
  },
  {
    id: 'system-requirements',
    question: 'What are the system requirements?',
    answer: 'Modern web browser (Chrome, Safari, Firefox, Edge - latest 2 versions), stable internet connection (minimum 5 Mbps for video streaming), JavaScript enabled, and cookies/localStorage enabled for session management. Recommended: Desktop or tablet for optimal experience (mobile responsive design available).',
    category: 'Getting Started',
    icon: <BookOpen className="w-5 h-5" />,
  },
  {
    id: 'how-to-start',
    question: 'How do I get started?',
    answer: 'Simply visit meridian-learning.vercel.app and enter your email address. No password required during demo phase. Your progress is automatically saved and linked to your email.',
    category: 'Getting Started',
    icon: <BookOpen className="w-5 h-5" />,
  },
  {
    id: 'is-it-free',
    question: 'Is Meridian Learning free?',
    answer: 'Currently in demo mode, Meridian Learning is free to use. Future pricing plans will be announced before the production launch. All demo users will receive early access benefits.',
    category: 'Getting Started',
    icon: <BookOpen className="w-5 h-5" />,
  },

  // ACCOUNT & AUTHENTICATION
  {
    id: 'why-no-password',
    question: 'Why don\'t I need a password?',
    answer: 'Currently in demo mode, Meridian Learning uses email-based authentication for quick access. Your email serves as your unique identifier, and all progress is securely saved to your account. Full password protection will be added in a future update (Build 7.1).',
    category: 'Account & Auth',
    icon: <Lock className="w-5 h-5" />,
  },
  {
    id: 'data-security',
    question: 'Is my data secure?',
    answer: 'Yes. All user data is stored in Google Firebase Firestore with enterprise-grade security. Your email and progress data are never shared with third parties. Session data is stored locally in your browser using industry-standard localStorage.',
    category: 'Account & Auth',
    icon: <Lock className="w-5 h-5" />,
  },
  {
    id: 'multiple-devices',
    question: 'Can I use multiple devices?',
    answer: 'Yes! Your progress is saved to the cloud. Log in with the same email on any device to continue where you left off.',
    category: 'Account & Auth',
    icon: <Lock className="w-5 h-5" />,
  },
  {
    id: 'how-to-logout',
    question: 'How do I log out?',
    answer: 'Click the logout button in the top-right corner (shows your name/email). You\'ll be asked to confirm before logging out.',
    category: 'Account & Auth',
    icon: <Lock className="w-5 h-5" />,
  },
  {
    id: 'change-email',
    question: 'Can I change my email address?',
    answer: 'During demo mode, you can simply log out and log back in with a different email. Your previous progress will remain linked to the original email. Account management features including email changes will be available in Build 7.1.',
    category: 'Account & Auth',
    icon: <Lock className="w-5 h-5" />,
  },

  // LEARNING FEATURES
  {
    id: 'how-many-episodes',
    question: 'How many episodes are available?',
    answer: 'Currently 5 episodes covering React fundamentals: 1. Understanding React Hooks (21:03), 2. State Management Patterns (30:00), 3. Component Lifecycle Methods (24:00), 4. Advanced Hooks Patterns (35:00), 5. Performance Optimization (32:00). Additional episodes will be added in future content updates.',
    category: 'Learning Features',
    icon: <Video className="w-5 h-5" />,
  },
  {
    id: 'progress-tracking',
    question: 'How does video progress tracking work?',
    answer: 'Your video progress is automatically saved every 15 seconds while watching. When you return to an episode, it will resume from where you left off (if you\'ve watched more than 5 seconds). Episodes are marked complete when you reach 90% completion or finish the video.',
    category: 'Learning Features',
    icon: <Video className="w-5 h-5" />,
  },
  {
    id: 'ai-assistant',
    question: 'What is the AI Learning Assistant?',
    answer: 'The AI Learning Assistant is powered by Claude Sonnet 4.5, Anthropic\'s advanced AI model. It provides real-time answers to questions about the current episode, explains concepts, provides code examples, and helps you understand React development. The assistant has full context of the episode you\'re watching.',
    category: 'Learning Features',
    icon: <Video className="w-5 h-5" />,
  },
  {
    id: 'how-to-use-chat',
    question: 'How do I use the AI chat?',
    answer: 'The chat panel is on the right side of the screen (or swipe up on mobile). Type your question and press Enter or click the send button. The AI will respond in real-time with streaming text. All responses are contextually aware of your current episode.',
    category: 'Learning Features',
    icon: <Video className="w-5 h-5" />,
  },
  {
    id: 'chat-history',
    question: 'Does my conversation history persist?',
    answer: 'Currently, conversation history is maintained during your current session but resets when you navigate away or refresh. Persistent chat history will be added in Build 8.',
    category: 'Learning Features',
    icon: <Video className="w-5 h-5" />,
  },
  {
    id: 'completed-vs-not',
    question: 'What\'s the difference between episodes I\'ve completed vs. not completed?',
    answer: 'Completed episodes show a green checkmark icon. Your progress bar at the top shows X/5 episodes completed. You can rewatch any episode at any time regardless of completion status.',
    category: 'Learning Features',
    icon: <Video className="w-5 h-5" />,
  },
  {
    id: 'certificates',
    question: 'Do I get a certificate after completing all episodes?',
    answer: 'Completion certificates will be available in Build 9. For now, you can track your progress through the progress bar and completion checkmarks in the episode list.',
    category: 'Learning Features',
    icon: <Video className="w-5 h-5" />,
  },

  // MOBILE EXPERIENCE
  {
    id: 'mobile-support',
    question: 'Does Meridian Learning work on mobile?',
    answer: 'Yes! The platform is fully responsive with a mobile-first design: Mobile: Episode list accessed via "Episodes" button (top-left), Tablet: Adaptive layout with collapsible sidebar, Desktop: Full three-column layout (episodes, video, chat).',
    category: 'Mobile',
    icon: <Smartphone className="w-5 h-5" />,
  },
  {
    id: 'mobile-episode-list',
    question: 'How do I access the episode list on mobile?',
    answer: 'Tap the "Episodes" button in the top-left corner. The episode list will slide out from the left. Tap outside or the X button to close it.',
    category: 'Mobile',
    icon: <Smartphone className="w-5 h-5" />,
  },
  {
    id: 'mobile-video-quality',
    question: 'Will video quality adjust on mobile?',
    answer: 'Yes, the video player automatically adjusts quality based on your connection speed and device capabilities. You can manually control playback quality in the video player settings if needed.',
    category: 'Mobile',
    icon: <Smartphone className="w-5 h-5" />,
  },

  // TROUBLESHOOTING
  {
    id: 'video-wont-play',
    question: 'The video won\'t play. What should I do?',
    answer: '1. Check your internet connection, 2. Try refreshing the page (Cmd+Shift+R on Mac, Ctrl+Shift+F5 on Windows), 3. Clear your browser cache, 4. Try a different browser, 5. Ensure JavaScript is enabled, 6. Check that you\'re using a supported browser.',
    category: 'Troubleshooting',
    icon: <Wrench className="w-5 h-5" />,
  },
  {
    id: 'progress-not-saving',
    question: 'My progress isn\'t saving. Help!',
    answer: '1. Ensure cookies and localStorage are enabled in your browser, 2. Check that you\'re logged in (your email should appear in top-right), 3. Verify you have a stable internet connection, 4. Try logging out and back in, 5. Contact support if the issue persists.',
    category: 'Troubleshooting',
    icon: <Wrench className="w-5 h-5" />,
  },
  {
    id: 'chat-not-responding',
    question: 'The AI chat isn\'t responding. What\'s wrong?',
    answer: '1. Check your internet connection (chat requires real-time connectivity), 2. Ensure the message was sent (you should see it in the chat history), 3. Wait 5-10 seconds for streaming response to begin, 4. Refresh the page and try again, 5. If persistent, the API service may be temporarily unavailable.',
    category: 'Troubleshooting',
    icon: <Wrench className="w-5 h-5" />,
  },
  {
    id: 'cant-see-logout',
    question: 'I can\'t see my logout button. Where is it?',
    answer: 'The logout button is in the top-right corner showing your name/email. On very small screens, it shows only the logout icon. If you don\'t see it, try: 1. Scrolling to the top of the page, 2. Refreshing the browser, 3. Checking if you\'re actually logged in.',
    category: 'Troubleshooting',
    icon: <Wrench className="w-5 h-5" />,
  },
  {
    id: 'slow-loading',
    question: 'The page is loading slowly. What can I do?',
    answer: '1. Check your internet connection speed, 2. Close other browser tabs/applications, 3. Clear browser cache and cookies, 4. Try using a different browser, 5. Disable browser extensions that might interfere, 6. Check if you\'re on a VPN that might slow connection.',
    category: 'Troubleshooting',
    icon: <Wrench className="w-5 h-5" />,
  },

  // UPCOMING FEATURES
  {
    id: 'upcoming-features',
    question: 'What features are planned for future updates?',
    answer: 'Our roadmap includes: Build 7.1: Full Firebase Authentication with password protection. Build 8: Persistent chat history, AI-powered study notes. Build 9: Advanced progress analytics, learning streaks, completion certificates. Build 10: Custom learning paths, skill assessments. Build 11: Community features, discussion forums. Build 12: Real React video content, code playground. Build 13: Multi-language support, accessibility enhancements.',
    category: 'Upcoming Features',
    icon: <Rocket className="w-5 h-5" />,
  },
  {
    id: 'real-videos',
    question: 'When will real React tutorial videos be available?',
    answer: 'Production-quality React tutorial videos aligned to the episode metadata are scheduled for Phase 2 (post-February 10 demo). Currently, the platform uses high-quality open-licensed test videos to demonstrate all core functionality.',
    category: 'Upcoming Features',
    icon: <Rocket className="w-5 h-5" />,
  },
  {
    id: 'mobile-apps',
    question: 'Will there be mobile apps?',
    answer: 'Native mobile apps (iOS/Android) are under consideration for Phase 3, pending user feedback and demand. The current web app is fully mobile-responsive and works excellently on all devices.',
    category: 'Upcoming Features',
    icon: <Rocket className="w-5 h-5" />,
  },
  {
    id: 'suggest-features',
    question: 'Can I suggest features?',
    answer: 'Absolutely! We value user feedback. Contact us at feedback@worldwiselearning.com with suggestions. (Note: Update with real contact info when available)',
    category: 'Upcoming Features',
    icon: <Rocket className="w-5 h-5" />,
  },

  // TECHNICAL
  {
    id: 'technology-stack',
    question: 'What technology powers Meridian Learning?',
    answer: 'Frontend: Next.js 16.1.6 with React 18, TypeScript, Tailwind CSS. AI: Anthropic Claude Sonnet 4.5 API. Database: Google Firebase Firestore. Hosting: Vercel (global CDN, edge network). Video: HTML5 video with custom progress tracking.',
    category: 'Technical',
    icon: <Code className="w-5 h-5" />,
  },
  {
    id: 'open-source',
    question: 'Is the platform open source?',
    answer: 'The codebase is currently proprietary. Educational partnerships and licensing opportunities may be available. Contact business@worldwiselearning.com for inquiries.',
    category: 'Technical',
    icon: <Code className="w-5 h-5" />,
  },
  {
    id: 'data-usage',
    question: 'How is my data used?',
    answer: 'We collect only essential data: email for authentication, video progress for learning continuity, and anonymized usage analytics to improve the platform. We never sell user data. Full privacy policy available at Terms of Service link.',
    category: 'Technical',
    icon: <Code className="w-5 h-5" />,
  },
  {
    id: 'browser-compatibility',
    question: 'Which browsers are supported?',
    answer: 'We support the latest 2 versions of Chrome, Safari, Firefox, and Edge. Internet Explorer is not supported. For best experience, use Chrome or Safari on desktop, and Safari or Chrome on mobile.',
    category: 'Technical',
    icon: <Code className="w-5 h-5" />,
  },

  // SUPPORT
  {
    id: 'get-help',
    question: 'How do I get help?',
    answer: '1. Check this FAQ first, 2. Review the platform documentation, 3. Contact support: support@worldwiselearning.com, 4. Report bugs: bugs@worldwiselearning.com, 5. Business inquiries: business@worldwiselearning.com. (Note: Update with real contact information when available)',
    category: 'Support',
    icon: <Mail className="w-5 h-5" />,
  },
  {
    id: 'support-hours',
    question: 'What are your support hours?',
    answer: 'During beta/demo phase, support is provided on a best-effort basis. Full support hours will be announced with the production launch.',
    category: 'Support',
    icon: <Mail className="w-5 h-5" />,
  },
];

const categories = [
  { name: 'Getting Started', icon: <BookOpen className="w-5 h-5" />, color: 'text-indigo-600' },
  { name: 'Account & Auth', icon: <Lock className="w-5 h-5" />, color: 'text-purple-600' },
  { name: 'Learning Features', icon: <Video className="w-5 h-5" />, color: 'text-blue-600' },
  { name: 'Mobile', icon: <Smartphone className="w-5 h-5" />, color: 'text-green-600' },
  { name: 'Troubleshooting', icon: <Wrench className="w-5 h-5" />, color: 'text-orange-600' },
  { name: 'Upcoming Features', icon: <Rocket className="w-5 h-5" />, color: 'text-pink-600' },
  { name: 'Technical', icon: <Code className="w-5 h-5" />, color: 'text-gray-600' },
  { name: 'Support', icon: <Mail className="w-5 h-5" />, color: 'text-red-600' },
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const [helpfulFeedback, setHelpfulFeedback] = useState<Set<string>>(new Set());
  const router = useRouter();

  const filteredFAQs = useMemo(() => {
    if (!searchQuery.trim()) return faqs;
    const query = searchQuery.toLowerCase();
    return faqs.filter(
      (faq) =>
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query) ||
        faq.category.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const toggleItem = (id: string) => {
    const newOpen = new Set(openItems);
    if (newOpen.has(id)) {
      newOpen.delete(id);
    } else {
      newOpen.add(id);
    }
    setOpenItems(newOpen);
  };

  const handleHelpful = (id: string, isHelpful: boolean) => {
    const newFeedback = new Set(helpfulFeedback);
    newFeedback.add(`${id}-${isHelpful}`);
    setHelpfulFeedback(newFeedback);
  };

  const scrollToCategory = (category: string) => {
    const element = document.getElementById(`category-${category.replace(/\s+/g, '-').toLowerCase()}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const groupedFAQs = useMemo(() => {
    const grouped: { [key: string]: FAQ[] } = {};
    filteredFAQs.forEach((faq) => {
      if (!grouped[faq.category]) {
        grouped[faq.category] = [];
      }
      grouped[faq.category].push(faq);
    });
    return grouped;
  }, [filteredFAQs]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <HelpCircle className="w-8 h-8" />
              <div>
                <h1 className="text-3xl font-bold">Help Center</h1>
                <p className="text-indigo-200 text-sm">Find answers to common questions</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link
                href="/"
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              <button
                onClick={() => router.push('/login')}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Contact</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for questions, answers, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-lg"
            />
          </div>
          {searchQuery && (
            <p className="mt-2 text-sm text-gray-600">
              Found {filteredFAQs.length} result{filteredFAQs.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Table of Contents */}
        {!searchQuery && (
          <div className="mb-8 bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              Table of Contents
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {categories.map((category) => (
                <button
                  key={category.name}
                  onClick={() => scrollToCategory(category.name)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-50 hover:bg-indigo-50 hover:border-indigo-200 border border-transparent transition-all text-left group"
                >
                  <span className={category.color}>{category.icon}</span>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-700">
                    {category.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* FAQ Sections */}
        <div className="space-y-8">
          {Object.entries(groupedFAQs).map(([category, categoryFAQs]) => {
            const categoryInfo = categories.find((c) => c.name === category);
            return (
              <div key={category} id={`category-${category.replace(/\s+/g, '-').toLowerCase()}`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={categoryInfo?.color || 'text-gray-600'}>
                    {categoryInfo?.icon || <HelpCircle className="w-6 h-6" />}
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">{category}</h2>
                  <span className="text-sm text-gray-500">({categoryFAQs.length})</span>
                </div>

                <div className="space-y-3">
                  {categoryFAQs.map((faq) => {
                    const isOpen = openItems.has(faq.id);
                    const hasFeedback = helpfulFeedback.has(`${faq.id}-true`) || helpfulFeedback.has(`${faq.id}-false`);

                    return (
                      <div
                        key={faq.id}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-md"
                      >
                        <button
                          onClick={() => toggleItem(faq.id)}
                          className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start gap-4 flex-1">
                            <div className="text-indigo-600 mt-0.5">{faq.icon}</div>
                            <span className="font-semibold text-gray-900 flex-1">{faq.question}</span>
                          </div>
                          {isOpen ? (
                            <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0 ml-4" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0 ml-4" />
                          )}
                        </button>

                        {isOpen && (
                          <div className="px-6 pb-4 pt-2 border-t border-gray-100 animate-in slide-in-from-top-2">
                            <div className="pt-4 text-gray-700 leading-relaxed whitespace-pre-line">
                              {faq.answer}
                            </div>

                            {!hasFeedback && (
                              <div className="mt-4 pt-4 border-t border-gray-100">
                                <p className="text-sm text-gray-600 mb-2">Was this helpful?</p>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleHelpful(faq.id, true)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors text-sm font-medium"
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                    Yes
                                  </button>
                                  <button
                                    onClick={() => handleHelpful(faq.id, false)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-colors text-sm font-medium"
                                  >
                                    <XCircle className="w-4 h-4" />
                                    No
                                  </button>
                                </div>
                              </div>
                            )}

                            {hasFeedback && (
                              <div className="mt-4 pt-4 border-t border-gray-100">
                                <p className="text-sm text-green-600 flex items-center gap-2">
                                  <CheckCircle2 className="w-4 h-4" />
                                  Thank you for your feedback!
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* No Results */}
        {filteredFAQs.length === 0 && (
          <div className="text-center py-12">
            <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-600 mb-6">Try searching with different keywords</p>
            <button
              onClick={() => setSearchQuery('')}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Clear Search
            </button>
          </div>
        )}

        {/* Contact Section */}
        <div className="mt-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-8 text-white">
          <div className="flex items-start gap-4">
            <Mail className="w-8 h-8 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">Still have questions?</h2>
              <p className="text-indigo-100 mb-6">
                Can't find what you're looking for? Our support team is here to help.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="mailto:support@worldwiselearning.com"
                  className="px-6 py-3 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors font-medium"
                >
                  Contact Support
                </a>
                <a
                  href="mailto:bugs@worldwiselearning.com"
                  className="px-6 py-3 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors font-medium"
                >
                  Report a Bug
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600">
            © 2026 WorldWise Learning. All rights reserved.
          </p>
          <div className="mt-4 flex justify-center gap-6 text-sm">
            <a href="#" className="text-indigo-600 hover:text-indigo-700 transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-indigo-600 hover:text-indigo-700 transition-colors">
              Privacy Policy
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
