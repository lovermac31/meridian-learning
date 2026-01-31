export interface Episode {
  id: string;
  title: string;
  duration: string;
  videoUrl: string;
  description: string;
}

export const episodes: Episode[] = [
  {
    id: '1',
    title: 'Understanding React Hooks',
    duration: '21:03',
    videoUrl: '/videos/react-hooks-intro.mp4',
    description: 'Learn the fundamentals of React Hooks including useState, useEffect, and custom hooks. Perfect for developers transitioning from class components to modern React patterns.'
  },
  {
    id: '2',
    title: 'State Management Patterns',
    duration: '30:00',
    videoUrl: '/videos/state-management.mp4',
    description: 'Explore advanced state management patterns using Context API, useReducer, and best practices for organizing application state in large-scale React applications.'
  },
  {
    id: '3',
    title: 'Component Lifecycle Methods',
    duration: '24:00',
    videoUrl: '/videos/lifecycle-methods.mp4',
    description: 'Deep dive into React component lifecycle, understanding mounting, updating, and unmounting phases with practical examples and common use cases.'
  },
  {
    id: '4',
    title: 'Advanced Hooks Patterns',
    duration: '35:00',
    videoUrl: '/videos/advanced-hooks.mp4',
    description: 'Master advanced hook patterns including useCallback, useMemo, useRef, and creating your own custom hooks for reusable logic across your application.'
  },
  {
    id: '5',
    title: 'Performance Optimization',
    duration: '32:00',
    videoUrl: '/videos/performance-optimization.mp4',
    description: 'Learn techniques to optimize React application performance including code splitting, lazy loading, and React.memo for component memoization and efficient rendering.'
  }
];
