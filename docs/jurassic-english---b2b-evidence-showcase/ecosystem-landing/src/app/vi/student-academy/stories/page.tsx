import type { Metadata } from "next";
import { LevelStories } from "@/components/student-academy/LevelStories";
import { STORIES_PATH, STORIES_VI_PATH } from "@/lib/academy/levelBooks";

// Vietnamese story collections (W-1, Jay 27 Oct 2026): the same structure as /student-academy/stories. Served on
// jurassicenglish.com through the /vi/student-academy/stories rewrite in the main site's vercel.json.
// Copy is machine-drafted: native read needed.

export const metadata: Metadata = {
  title: "Truyện theo cấp độ | Học viện Jurassic English™",
  description: "Hai truyện tranh gốc của Jurassic English cho mỗi cấp độ của Học viện, và bước tiếp theo cùng thầy Jay.",
  alternates: { canonical: STORIES_VI_PATH, languages: { en: STORIES_PATH, vi: STORIES_VI_PATH } },
};

export default function LevelStoriesViPage() {
  return <LevelStories locale="vi" />;
}
