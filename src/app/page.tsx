'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Send, Play, Pause } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export default function MeridianLearning() {
  // Video state
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Chat state
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Hello! Welcome to Meridian Learning. How can I help you with this lesson today?',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Video handlers
  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
  };

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Chat handlers
  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: "That's a great question! Let me help you understand this concept better. Could you elaborate on what part you'd like me to explain?",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    }, 500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Auto-scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex h-screen w-full flex-col bg-background lg:flex-row">
      {/* Left Panel - Video Player */}
      <div className="flex h-1/2 w-full flex-col bg-black lg:h-full lg:w-3/5">
        {/* Video Container */}
        <div className="relative flex flex-1 items-center justify-center bg-black">
          <video
            ref={videoRef}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleEnded}
            className="h-full w-full object-contain"
            crossOrigin="anonymous"
          >
            <source
              src="https://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.mp4"
              type="video/mp4"
            />
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Video Controls */}
        <div className="space-y-3 bg-neutral-900 p-4">
          {/* Progress Bar */}
          <div className="space-y-1">
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={(e) => {
                const time = parseFloat(e.target.value);
                if (videoRef.current) {
                  videoRef.current.currentTime = time;
                  setCurrentTime(time);
                }
              }}
              className="w-full cursor-pointer"
            />
            <div className="flex justify-between text-xs text-neutral-400">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Title and Controls */}
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-white">
              Understanding React Hooks
            </h2>
            <button
              onClick={handlePlayPause}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 active:bg-blue-800"
            >
              {isPlaying ? (
                <>
                  <Pause size={20} />
                  Pause
                </>
              ) : (
                <>
                  <Play size={20} />
                  Play
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Right Panel - Chat Interface */}
      <div className="flex h-1/2 w-full flex-col bg-background lg:h-full lg:w-2/5">
        {/* Chat Header */}
        <div className="border-b border-border bg-card px-4 py-3">
          <h3 className="font-semibold text-foreground">Learning Assistant</h3>
          <p className="text-sm text-muted-foreground">Ask questions about the lesson</p>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-3 p-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.type === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-xs rounded-lg px-4 py-2 text-sm ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
        </div>

        {/* Message Input */}
        <div className="border-t border-border bg-card p-4">
          <div className="flex gap-2">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask a question..."
              className="flex-1 resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              rows={2}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
              className="rounded-lg bg-blue-600 p-2 text-white transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
