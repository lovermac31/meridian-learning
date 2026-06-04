/**
 * pageI18n — applies the YL trilingual dictionary to the static HTML page.
 *
 * Strategy: the pristine English content already lives in the HTML (best for
 * no-JS users and as the SEO default), so on init we CAPTURE it from the DOM.
 * EN is then always restored from the capture (never re-authored), which means
 * en→vi→en switching can never drift. VI / zh-CN come from src/yl/i18n.ts.
 *
 * Translatable elements opt in via attributes:
 *   data-i18n="key"        → element.textContent is swapped
 *   data-i18n-html="key"   → element.innerHTML is swapped (inline <span>/<strong>/<br>)
 *
 * Metadata (title, description, og/twitter, canonical, <html lang>) and the
 * language-selector active state are updated on every language change.
 */
import {
  LANGS,
  type Lang,
  HTML_LANG,
  OG_LOCALE,
  resolveInitialLang,
  setLang,
  subscribeLang,
  STRINGS,
} from './i18n';

const SITE = 'https://jurassicenglish.com/young-learners-speaking/';
function canonicalFor(lang: Lang): string {
  return lang === 'en' ? SITE : `${SITE}?lang=${lang}`;
}

const capturedText = new Map<string, string>();
const capturedHtml = new Map<string, string>();
const capturedMeta: Record<string, string> = {};
let didCapture = false;

function getMeta(attr: string, val: string): string {
  return document.querySelector(`meta[${attr}="${val}"]`)?.getAttribute('content') ?? '';
}
function setMeta(attr: string, val: string, content: string): void {
  const el = document.querySelector(`meta[${attr}="${val}"]`);
  if (el) el.setAttribute('content', content);
}

function captureOnce(): void {
  if (didCapture) return;
  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
    const k = el.getAttribute('data-i18n');
    if (k && !capturedText.has(k)) capturedText.set(k, el.textContent ?? '');
  });
  document.querySelectorAll<HTMLElement>('[data-i18n-html]').forEach((el) => {
    const k = el.getAttribute('data-i18n-html');
    if (k && !capturedHtml.has(k)) capturedHtml.set(k, el.innerHTML);
  });
  capturedMeta.title = document.title;
  capturedMeta.description = getMeta('name', 'description');
  capturedMeta.ogTitle = getMeta('property', 'og:title');
  capturedMeta.ogDescription = getMeta('property', 'og:description');
  capturedMeta.twitterTitle = getMeta('name', 'twitter:title');
  capturedMeta.twitterDescription = getMeta('name', 'twitter:description');
  didCapture = true;
}

/** Resolve a page string for a language, falling back to the captured pristine EN. */
function pageVal(lang: Lang, key: string, isHtml: boolean): string {
  const captured = isHtml ? capturedHtml.get(key) : capturedText.get(key);
  if (lang === 'en') return captured ?? STRINGS.en[key] ?? '';
  const translated = STRINGS[lang]?.[key];
  return translated ?? captured ?? STRINGS.en[key] ?? '';
}

function applyText(lang: Lang): void {
  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
    const k = el.getAttribute('data-i18n');
    if (k) el.textContent = pageVal(lang, k, false);
  });
  document.querySelectorAll<HTMLElement>('[data-i18n-html]').forEach((el) => {
    const k = el.getAttribute('data-i18n-html');
    if (k) el.innerHTML = pageVal(lang, k, true);
  });
}

function metaVal(lang: Lang, dictKey: string, capturedKey: string): string {
  if (lang === 'en') return capturedMeta[capturedKey] ?? STRINGS.en[dictKey] ?? '';
  return STRINGS[lang]?.[dictKey] ?? capturedMeta[capturedKey] ?? STRINGS.en[dictKey] ?? '';
}

function applyMeta(lang: Lang): void {
  document.documentElement.lang = HTML_LANG[lang];
  document.title = metaVal(lang, 'meta.title', 'title');
  setMeta('name', 'description', metaVal(lang, 'meta.description', 'description'));
  setMeta('property', 'og:title', metaVal(lang, 'meta.ogTitle', 'ogTitle'));
  setMeta('property', 'og:description', metaVal(lang, 'meta.ogDescription', 'ogDescription'));
  setMeta('name', 'twitter:title', metaVal(lang, 'meta.twitterTitle', 'twitterTitle'));
  setMeta('name', 'twitter:description', metaVal(lang, 'meta.twitterDescription', 'twitterDescription'));
  setMeta('property', 'og:locale', OG_LOCALE[lang]);
  setMeta('property', 'og:url', canonicalFor(lang));
  const canon = document.querySelector('link[rel="canonical"]');
  if (canon) canon.setAttribute('href', canonicalFor(lang));
}

const SELECTOR_ARIA: Record<Lang, string> = { en: 'Language', vi: 'Ngôn ngữ', 'zh-CN': '语言' };

function highlightSelector(lang: Lang): void {
  document.querySelectorAll<HTMLElement>('[data-lang-btn]').forEach((btn) => {
    const active = btn.getAttribute('data-lang-btn') === lang;
    btn.setAttribute('aria-pressed', String(active));
    btn.classList.toggle('is-active', active);
  });
  const group = document.querySelector('[data-lang-selector]');
  if (group) group.setAttribute('aria-label', SELECTOR_ARIA[lang]);
}

function applyAll(lang: Lang): void {
  applyMeta(lang);
  applyText(lang);
  highlightSelector(lang);
}

/**
 * Initialise page localization: capture EN, resolve the active language,
 * apply it, and wire the language-selector buttons. Call once on page load
 * before/around mounting the BotUI island.
 */
export function initPageI18n(): void {
  captureOnce();
  const lang = resolveInitialLang();
  applyAll(lang);

  document.querySelectorAll<HTMLElement>('[data-lang-btn]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const v = btn.getAttribute('data-lang-btn');
      if (v && (LANGS as readonly string[]).includes(v)) setLang(v as Lang);
    });
  });

  // Keep the page in sync if any other surface (e.g. the BotUI) changes language.
  subscribeLang(applyAll);
}
