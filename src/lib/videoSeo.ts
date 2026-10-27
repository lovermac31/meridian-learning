import type { Locale } from '../i18n/locales';
import { PRODUCTS, type Product } from '../i18n/content/products';
import { PRODUCT_VIDEOS, STORY_CLUB_VIDEOS, VIDEO_DIR } from '../i18n/content/productVideos';
import { getProductByPath } from '../i18n/content/productSeo';
import videoMeta from '../content/videoMeta.json';

/**
 * Video SEO (Jay, 27 Oct 2026): every film shown on a page is described to search engines twice, from the same
 * manifest the players use (productVideos.ts + each product's `video`), so a new film needs no extra work:
 *   - a VideoObject in the page's JSON-LD (structuredData via routeMetadata), the transcript added at prerender;
 *   - a <video:video> entry on the page's URL in sitemap.xml (scripts/generate-sitemap.mjs).
 * Lengths come from the mp4 files (src/content/videoMeta.json, scripts/generate-video-meta.mjs).
 */
const SITE_URL = 'https://jurassicenglish.com';
// The day the films went live (PR #205).
export const VIDEO_UPLOAD_DATE = '2026-10-27';

export type PageVideo = {
  slug: string;
  pageUrl: string;
  name: string;
  description: string;
  thumbnailUrl: string;
  contentUrl: string;
  seconds: number;
};

const STORY_CLUB_DESCRIPTION: Record<Locale, string> = {
  en: 'A short film from Story Club with Mr. Jay, a small online English story group for children aged 5–8.',
  vi: 'Một video ngắn từ Câu lạc bộ Truyện cùng thầy Jay, nhóm nhỏ học tiếng Anh qua truyện trực tuyến cho bé 5–8 tuổi.',
};

const seconds = (slug: string) => (videoMeta as Record<string, { seconds: number }>)[slug]?.seconds ?? 0;

function pageVideo(slug: string, pageUrl: string, name: string, description: string): PageVideo {
  return {
    slug,
    pageUrl,
    name,
    description,
    thumbnailUrl: `${SITE_URL}${VIDEO_DIR}/${slug}/poster.webp`,
    contentUrl: `${SITE_URL}${VIDEO_DIR}/${slug}/video.mp4`,
    seconds: seconds(slug),
  };
}

/** A product page's film, or null when the product has none. */
export function productPageVideo(product: Product, locale: Locale): PageVideo | null {
  if (!product.video || !PRODUCT_VIDEOS[product.video]) return null;
  const pageUrl = `${SITE_URL}${locale === 'vi' ? '/vi' : ''}/products/${product.id}`;
  const text = product[locale];
  return pageVideo(product.video, pageUrl, PRODUCT_VIDEOS[product.video].title?.[locale] ?? text.title, `${text.problem} ${text.inside}`);
}

/** The three Story Club films (01–03) on /story-club and /vi/story-club. */
export function storyClubVideos(locale: Locale): PageVideo[] {
  const pageUrl = `${SITE_URL}${locale === 'vi' ? '/vi' : ''}/story-club`;
  return STORY_CLUB_VIDEOS.map((slug) => {
    const name = PRODUCT_VIDEOS[slug].title?.[locale] ?? slug;
    return pageVideo(slug, pageUrl, name, `${name}. ${STORY_CLUB_DESCRIPTION[locale]}`);
  });
}

/** Every film on a sitemap path (EN or /vi), for the video sitemap. */
export function videosForPath(pathname: string): PageVideo[] {
  const locale: Locale = pathname === '/vi' || pathname.startsWith('/vi/') ? 'vi' : 'en';
  const canonical = locale === 'vi' ? pathname.slice(3) || '/' : pathname;
  if (canonical === '/story-club') return storyClubVideos(locale);
  const product = getProductByPath(canonical);
  const video = product ? productPageVideo(product, locale) : null;
  return video ? [video] : [];
}

/** "PT28S", "PT1M15S" from seconds (rounded). */
export function isoDuration(value: number): string {
  const total = Math.max(1, Math.round(value));
  const minutes = Math.floor(total / 60);
  return `PT${minutes ? `${minutes}M` : ''}${total % 60 ? `${total % 60}S` : ''}`;
}

/** The VideoObject's @id on its page. */
export const videoId = (video: PageVideo) => `${video.pageUrl}#video-${video.slug}`;

/**
 * schema.org VideoObject. The films are narrated in English (VI and 中文 are subtitles), so inLanguage is "en";
 * the transcript in the page language is added by scripts/prerender-route-metadata.mjs (kept out of the app bundle).
 */
export function createVideoJsonLd(video: PageVideo) {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    '@id': videoId(video),
    name: video.name,
    description: video.description,
    thumbnailUrl: [video.thumbnailUrl],
    contentUrl: video.contentUrl,
    uploadDate: VIDEO_UPLOAD_DATE,
    duration: isoDuration(video.seconds),
    inLanguage: 'en',
    isFamilyFriendly: true,
    publisher: { '@id': `${SITE_URL}/#organization` },
  };
}

/** Every product that shows a film (for tests and the sitemap). */
export const PRODUCTS_WITH_VIDEO = PRODUCTS.filter((product) => product.live && product.video && PRODUCT_VIDEOS[product.video]);
