export interface Episode {
  id: string;
  title: string;
  description: string;
  courseType: string; // e.g., "HS Literature"
  duration: number; // seconds
  videoUrl: string;
  transcript: string;
  thumbnailUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const SAMPLE_EPISODES: Episode[] = [
  {
    id: "understanding-react-hooks",
    title: "Understanding React Hooks",
    description: "Learn how to use React Hooks to manage state in functional components",
    courseType: "HS Literature",
    duration: 1263, // 21 minutes
    videoUrl: "https://example.com/videos/react-hooks.mp4",
    transcript: `In this lesson, we explore React Hooks, a feature that lets you use state in functional components.

Before Hooks, you could only use state in class components. Hooks changed that.

The most common Hook is useState. It lets you add state to a functional component.

Another important Hook is useEffect. It handles side effects like data fetching or DOM updates.

Hooks follow two rules: only call them at the top level, and only from React functions.

Understanding these concepts will make you a better React developer.`,
    createdAt: new Date("2026-01-30"),
    updatedAt: new Date("2026-01-30"),
  },
];

export async function getEpisodeById(id: string): Promise<Episode | null> {
  return SAMPLE_EPISODES.find((ep) => ep.id === id) || null;
}

export async function getAllEpisodes(): Promise<Episode[]> {
  return SAMPLE_EPISODES;
}
