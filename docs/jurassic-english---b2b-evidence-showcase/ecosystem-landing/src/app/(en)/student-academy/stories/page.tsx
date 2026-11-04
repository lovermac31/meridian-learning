import type { Metadata } from "next";
import { LevelStories } from "@/components/student-academy/LevelStories";
import { STORIES_PATH, STORIES_VI_PATH } from "@/lib/academy/levelBooks";

// Story collections for the five Student Academy levels (English). The Vietnamese twin is
// /vi/student-academy/stories; both render src/components/student-academy/LevelStories.tsx.

export const metadata: Metadata = {
  title: "Level stories | Jurassic English™ Student Academy",
  description:
    "Two original Jurassic English storybooks for each Student Academy level, and the next step with Mr. Jay.",
  alternates: { canonical: STORIES_PATH, languages: { en: STORIES_PATH, vi: STORIES_VI_PATH } },
};

export default function LevelStoriesPage() {
  return <LevelStories locale="en" />;
}
