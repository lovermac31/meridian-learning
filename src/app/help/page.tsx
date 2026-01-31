// File: src/app/help/page.tsx
// Comprehensive Help/FAQ page for Meridian Learning platform

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Search, Home, BookOpen, Shield, Smartphone, AlertCircle, Rocket, Code, Mail } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  // Getting Started
  {
    question: "What is Meridian Learning?",
    answer: "Meridian Learning is an AI-powered educational platform designed to transform your learning journey. It combines video-based lessons with real-time AI assistance powered by Claude Sonnet 4.5, offering personalized support, measurable progress tracking, and an engaging learning experience focused on React development and modern web technologies.",
    category: "Getting Started"
  },
  {
    question: "What are the system requirements?",
    answer: "Meridian Learning works on any modern device with a web browser (Chrome, Firefox, Safari, Edge). For the best experience, we recommend: stable internet connection (minimum 5 Mbps for video streaming), desktop/laptop for primary learning (tablet/mobile supported), and JavaScript enabled in your browser.",
    category: "Getting Started"
  },
  {
    question: "How do I get started?",
    answer: "Simply visit the login page, enter your email address, and you'll be instantly logged in. No password required! Once logged in, you'll see Episode 1 ready to play. Start watching, interact with the AI assistant for questions, and track your progress as you complete each episode.",
    category: "Getting Started"
  },

  // Account & Authentication
  {
    question: "Why don't I need a password?",
    answer: "We use a streamlined authentication system designed for educational environments. For the current version, you only need an email address to maintain your learning progress and preferences. This reduces friction and lets you focus on learning. Future builds will include enhanced authentication options for enterprise deployments.",
    category: "Account & Authentication"
  },
  {
    question: "Is my data secure?",
    answer: "Yes. All user data is stored securely in Firebase Cloud Firestore with industry-standard encryption. Your learning progress, chat history, and profile information are protected and only accessible to you. We never share your data with third parties. Your API interactions with Claude are processed securely through Anthropic's infrastructure.",
    category: "Account & Authentication"
  },
  {
    question: "Can I access my account from multiple devices?",
    answer: "Absolutely! Your progress is saved in the cloud. Simply log in with the same email address on any device, and you'll see all your completed episodes, progress tracking, and chat history synchronized automatically. Your learning journey continues seamlessly across desktop, tablet, and mobile.",
    category: "Account & Authentication"
  },

  // Learning Features
  {
    question: "How many episodes are available?",
    answer: "Currently, there are 5 comprehensive episodes covering React fundamentals, component architecture, state management, hooks, and modern best practices. Each episode is 15-20 minutes long and includes hands-on examples. More episodes are planned for future releases covering advanced topics like Next.js, TypeScript, testing, and deployment strategies.",
    category: "Learning Features"
  },
  {
    question: "How does progress tracking work?",
    answer: "Your progress is automatically tracked as you complete episodes. The sidebar shows a visual progress bar, completed episode count, and checkmarks for finished lessons. You can revisit any episode at any time—your progress is saved in real-time and persists across sessions and devices.",
    category: "Learning Features"
  },
  {
    question: "What can the AI assistant help me with?",
    answer: "The AI assistant (powered by Claude Sonnet 4.5) is context-aware and focused on the current episode you're watching. Ask questions about concepts, request code explanations, get clarification on techniques, discuss best practices, or explore related topics. The assistant understands the learning material and provides educational, helpful responses tailored to your learning journey.",
    category: "Learning Features"
  },
  {
    question: "Can I ask questions about topics outside the current episode?",
    answer: "Yes! While the AI assistant is optimized for the episode you're watching, you can ask about general programming concepts, React ecosystem questions, or career advice. The assistant is designed to support your broader learning goals while keeping focus on the structured curriculum.",
    category: "Learning Features"
  },

  // Mobile Experience
  {
    question: "Does Meridian Learning work on mobile devices?",
    answer: "Yes! The platform is fully responsive and optimized for mobile, tablet, and desktop. On smaller screens, the episode list becomes a slide-out menu, and the layout adapts for comfortable viewing and interaction. You can watch videos, chat with the AI assistant, and track progress seamlessly on any device.",
    category: "Mobile Experience"
  },
  {
    question: "How do I access episodes on mobile?",
    answer: "Tap the 'Episodes' button in the top-left corner to open the episode list. Select any episode to start watching. The menu automatically closes when you select an episode, giving you full-screen access to the video and AI assistant.",
    category: "Mobile Experience"
  },

  // Troubleshooting
  {
    question: "The video won't play. What should I do?",
    answer: "Try these steps: (1) Refresh the page, (2) Check your internet connection, (3) Try a different browser, (4) Clear your browser cache and cookies, (5) Ensure JavaScript is enabled. If the issue persists, contact support with your browser type and error message.",
    category: "Troubleshooting"
  },
  {
    question: "My progress isn't saving. Why?",
    answer: "Progress is saved automatically to the cloud. If it's not saving: (1) Ensure you're logged in with the correct email, (2) Check your internet connection, (3) Try logging out and back in, (4) Clear browser cache and refresh. Your progress should sync within a few seconds of completing an episode.",
    category: "Troubleshooting"
  },
  {
    question: "The AI assistant isn't responding. What's wrong?",
    answer: "If the AI assistant doesn't respond: (1) Check your internet connection, (2) Verify the message sent successfully, (3) Wait 10-15 seconds (complex answers take time), (4) Try refreshing the page, (5) Check if you're still logged in. If errors persist, there may be temporary API issues—try again in a few minutes.",
    category: "Troubleshooting"
  },

  // Upcoming Features
  {
    question: "What new features are coming soon?",
    answer: "We have an exciting roadmap! Upcoming features include: enhanced authentication with social login (Build 7.1), admin dashboard for content management (Build 8), quiz and assessment tools (Build 9), interactive code playgrounds (Build 10), downloadable resources and certificates (Build 11), discussion forums and peer collaboration (Build 12), and advanced analytics with personalized learning paths (Build 13). Stay tuned!",
    category: "Upcoming Features"
  },
  {
    question: "Can I request specific topics or features?",
    answer: "Absolutely! We value learner feedback. Use the contact information at the bottom of this page to submit topic requests, feature suggestions, or report issues. Your input directly influences our development roadmap and helps us create the best learning experience possible.",
    category: "Upcoming Features"
  },

  // Technical Details
  {
    question: "What technology powers Meridian Learning?",
    answer: "Meridian Learning is built with modern web technologies: Next.js 15 (React framework), TypeScript (type-safe development), Tailwind CSS (responsive styling), Firebase (authentication & cloud database), Anthropic Claude Sonnet 4.5 (AI assistant), and Vercel (hosting & deployment). This stack ensures fast performance, scalability, and cutting-edge AI capabilities.",
    category: "Technical Details"
  },
  {
    question: "Is Meridian Learning open source?",
    answer: "The current version is proprietary, but we're exploring open-source educational components for future releases. We believe in knowledge sharing and community-driven development. Stay connected for announcements about open-source initiatives and collaboration opportunities.",
    category: "Technical Details"
  },

  // Support & Contact
  {
    question: "How do I contact support?",
    answer: "For technical support, feature requests, or general inquiries, email us at support@worldwiselearning.com. We aim to respond within 24-48 hours. For urgent issues, include 'URGENT' in the subject line with details about your problem, browser type, and any error messages.",
    category: "Support & Contact"
  },
  {
    question: "Are there any community resources?",
    answer: "We're building a learning community! Future builds will include discussion forums, peer collaboration tools, and live study sessions. In the meantime, bookmark this Help page, join our email updates, and follow us on social media for learning tips, platform updates, and community announcements.",
    category: "Support & Contact"
  }
];

const categories = [
  { name: "Getting Started", icon: Home },
  { name: "Account & Authentication", icon: Shield },
  { name: "Learning Features", icon: BookOpen },
  { name: "Mobile Experience", icon: Smartphone },
  { name: "Troubleshooting", icon: AlertCircle },
  { name: "Upcoming Features", icon: Rocket },
  { name: "Technical Details", icon: Code },
  { name: "Support & Contact", icon: Mail }
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const toggleItem = (index: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = searchQuery === "" ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === null || faq.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-purple-700">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                Help & FAQ
              </h1>
              <p className="text-purple-100 text-sm sm:text-base">
                Everything you need to know about Meridian Learning
              </p>
            </div>
            <Link
              href="/"
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all shadow-lg border-2 border-purple-500 flex items-center gap-2 font-semibold"
            >
              <Home className="w-5 h-5" />
              <span>Home</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Floating Home Button - Mobile */}
      <Link
        href="/"
        className="md:hidden fixed bottom-6 right-6 z-50 p-4 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-2xl transition-all border-2 border-purple-500"
        title="Return to Home"
      >
        <Home className="w-6 h-6" />
      </Link>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-white/30 bg-white/95 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-500 shadow-lg"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-8 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg">
          <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
            Filter by Category
          </h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === null
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Categories
            </button>
            {categories.map(({ name, icon: Icon }) => (
              <button
                key={name}
                onClick={() => setSelectedCategory(name)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  selectedCategory === name
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {name}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Items */}
        <div className="space-y-3">
          {filteredFaqs.length === 0 ? (
            <div className="bg-white/95 backdrop-blur-sm rounded-xl p-8 text-center shadow-lg">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 text-lg">
                No results found. Try a different search term or category.
              </p>
            </div>
          ) : (
            filteredFaqs.map((faq, index) => {
              const isExpanded = expandedItems.has(index);
              const CategoryIcon = categories.find(c => c.name === faq.category)?.icon || BookOpen;

              return (
                <div
                  key={index}
                  className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden transition-all hover:shadow-xl"
                >
                  <button
                    onClick={() => toggleItem(index)}
                    className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <CategoryIcon className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <span className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-1 block">
                          {faq.category}
                        </span>
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                          {faq.question}
                        </h3>
                      </div>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-500 transition-transform flex-shrink-0 ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {isExpanded && (
                    <div className="px-6 pb-5 pt-2">
                      <div className="pl-8 border-l-2 border-purple-200">
                        <p className="text-gray-700 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Quick Links */}
        <div className="mt-12 bg-white/95 backdrop-blur-sm rounded-xl p-6 sm:p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Still Need Help?
          </h2>
          <p className="text-gray-700 mb-6">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="mailto:support@worldwiselearning.com"
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-center flex items-center justify-center gap-2"
            >
              <Mail className="w-5 h-5" />
              Email Support
            </a>
            <Link
              href="/"
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium text-center flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Return to Learning
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white/10 backdrop-blur-sm border-t border-white/20 py-6 mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-purple-100 text-sm">
            © 2026 WorldWise Learning. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
