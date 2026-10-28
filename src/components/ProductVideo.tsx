import { useEffect, useRef, useState } from 'react';
import type { Locale } from '../i18n/locales';
import {
  PRODUCT_VIDEOS,
  VIDEO_COPY,
  VIDEO_LANG_LABELS,
  defaultVideoLang,
  videoFiles,
  type VideoLang,
} from '../i18n/content/productVideos';
import { recordClientEvent } from '../lib/tracker';

/**
 * A product film: muted, never autoplays, and nothing but the poster loads until the visitor presses play
 * (preload="none"). The 16:9 box is reserved before anything loads, so the page does not shift.
 * The subtitle picker switches the video's text tracks; it starts on the page's language.
 */
export function ProductVideo({ slug, locale, id, fallbackTitle = '' }: { slug: string; locale: Locale; id?: string; fallbackTitle?: string }) {
  const film = PRODUCT_VIDEOS[slug];
  const [lang, setLang] = useState<VideoLang>(() => defaultVideoLang(slug, locale));
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const tracks = ref.current?.textTracks;
    if (!tracks) return;
    for (const track of Array.from(tracks)) track.mode = track.language === lang ? 'showing' : 'disabled';
  }, [lang]);

  if (!film) return null;
  const files = videoFiles(slug);
  const copy = VIDEO_COPY[locale];
  const pickerId = `${slug}-subtitles`;
  const title = film.title?.[locale] ?? fallbackTitle;
  return (
    <figure id={id} className="mt-4 scroll-mt-24" data-product-video={slug}>
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-[#101820]">
        <video
          ref={ref}
          className="absolute inset-0 h-full w-full"
          controls
          muted
          playsInline
          preload="none"
          poster={files.poster}
          aria-label={title}
          data-video-player={slug}
          onPlay={() => recordClientEvent({ event: 'video_play', product_id: slug })}
        >
          <source src={files.src} type="video/mp4" />
          {film.langs.map((l) => (
            <track key={l} kind="subtitles" srcLang={l} label={VIDEO_LANG_LABELS[l]} src={files.track(l)} default={l === lang} />
          ))}
        </video>
      </div>
      <figcaption className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
        <span className="font-bold">{title}</span>
        <span id={pickerId} className="sr-only">{copy.subtitles}</span>
        <span aria-hidden="true">{copy.subtitles}:</span>
        <span role="group" aria-labelledby={pickerId} className="inline-flex rounded-full border border-sb-border p-0.5">
          {film.langs.map((l) => (
            <button
              key={l}
              type="button"
              lang={l}
              aria-pressed={l === lang}
              onClick={() => setLang(l)}
              className={`min-h-9 min-w-11 rounded-full px-3 font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sb-amber ${l === lang ? 'bg-sb-forest text-white' : 'text-sb-forest'}`}
              data-subtitle-lang={l}
            >
              {VIDEO_LANG_LABELS[l]}
            </button>
          ))}
        </span>
        <span className="basis-full text-xs">{copy.muted}</span>
      </figcaption>
    </figure>
  );
}
