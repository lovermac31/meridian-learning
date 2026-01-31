'use client';

import { useState } from 'react';
import VideoPlayer from '@/components/VideoPlayer';
import ChatPanel from '@/components/ChatPanel';
import { episodes } from '@/lib/episodes';
import { Play, CheckCircle2, ChevronRight } from 'lucide-react';

export default function Home() {
  const [currentEpisode, setCurrentEpisode] = useState(0);
  const [completedEpisodes, setCompletedEpisodes] = useState<number[]>([0, 1]); // Mock: Episodes 1 and 2 completed
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleEpisodeComplete = () => {
    if (!completedEpisodes.includes(currentEpisode)) {
      setCompletedEpisodes([...completedEpisodes, currentEpisode]);
    }
  };

  const handleNextEpisode = () => {
    if (currentEpisode < episodes.length - 1) {
      setCurrentEpisode(currentEpisode + 1);
      setIsMobileMenuOpen(false); // Close mobile menu when changing episodes
    }
  };

  const selectEpisode = (index: number) => {
    setCurrentEpisode(index);
    setIsMobileMenuOpen(false); // Close mobile menu on selection
  };

  const completedCount = completedEpisodes.length;
  const progressPercentage = (completedCount / episodes.length) * 100;

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-50">
      {/* Mobile Episode Toggle Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
      >
        <span className="text-sm font-medium">Episodes</span>
        <ChevronRight className={`w-4 h-4 transition-transform ${isMobileMenuOpen ? 'rotate-90' : ''}`} />
      </button>

      {/* Episode List Sidebar */}
      <div className={`
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        fixed lg:static top-0 left-0 h-full
        w-full sm:w-80 lg:w-1/5
        bg-white border-r border-gray-200
        flex flex-col shadow-lg lg:shadow-none
        transition-transform duration-300 ease-in-out
        z-40
      `}>
        {/* Close button for mobile */}
        <button
          onClick={() => setIsMobileMenuOpen(false)}
          className="lg:hidden absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Progress Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">Your Progress</h2>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Episodes Completed</span>
              <span className="font-semibold">{completedCount}/{episodes.length}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-green-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Episode List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          <h3 className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-3">
            All Episodes
          </h3>
          {episodes.map((episode, index) => {
            const isCompleted = completedEpisodes.includes(index);
            const isCurrent = currentEpisode === index;

            return (
              <button
                key={episode.id}
                onClick={() => selectEpisode(index)}
                className={`
                  w-full text-left p-3 sm:p-4 rounded-lg transition-all duration-200
                  ${isCurrent
                    ? 'bg-blue-50 border-2 border-blue-500 shadow-sm'
                    : 'bg-gray-50 border border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                  }
                `}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-semibold ${isCurrent ? 'text-blue-600' : 'text-gray-500'}`}>
                        Episode {index + 1}
                      </span>
                      {isCompleted && (
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                      )}
                    </div>
                    <h4 className={`text-sm sm:text-base font-semibold mb-1 line-clamp-2 ${isCurrent ? 'text-blue-900' : 'text-gray-900'}`}>
                      {episode.title}
                    </h4>
                    <p className="text-xs text-gray-500">{episode.duration}</p>
                  </div>
                  {!isCompleted && (
                    <Play className={`w-5 h-5 flex-shrink-0 ${isCurrent ? 'text-blue-600' : 'text-gray-400'}`} />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content Area - Video Player */}
      <div className="flex-1 lg:w-2/5 flex flex-col bg-white p-4 sm:p-6 lg:p-8 overflow-y-auto mt-16 lg:mt-0">
        <div className="max-w-4xl mx-auto w-full">
          <div className="mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              {episodes[currentEpisode].title}
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Episode {currentEpisode + 1} of {episodes.length} • {episodes[currentEpisode].duration}
            </p>
          </div>

          <VideoPlayer
            episode={episodes[currentEpisode]}
            onComplete={handleEpisodeComplete}
          />

          {/* Next Episode Button */}
          {currentEpisode < episodes.length - 1 && (
            <button
              onClick={handleNextEpisode}
              className="mt-4 sm:mt-6 w-full sm:w-auto mx-auto flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md text-sm sm:text-base font-medium"
            >
              <span>Next: {episodes[currentEpisode + 1].title}</span>
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}

          {/* Episode Description */}
          <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gray-50 rounded-lg">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">
              About This Episode
            </h3>
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
              {episodes[currentEpisode].description}
            </p>
          </div>
        </div>
      </div>

      {/* Chat Panel - Pass current episode title */}
      <div className="lg:w-2/5 border-t lg:border-t-0 lg:border-l border-gray-200 flex flex-col h-[60vh] lg:h-screen">
        <ChatPanel episodeTitle={episodes[currentEpisode].title} />
      </div>
    </div>
  );
}
