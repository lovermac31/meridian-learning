/**
 * engagement.ts: one anonymous "engaged" signal per visit.
 *
 * A visit is engaged when the visitor scrolls past the middle of a page, keeps a page visible for 20 seconds, or views a
 * second page. The caller sends one `engaged` event (Vercel Analytics, through analytics.ts, so consent, Do Not Track and
 * the staff ignore flag all apply). It stores only a "sent" flag and the page paths seen, in sessionStorage (this tab,
 * cleared when it closes), and never an identifier. Automated browsers are skipped.
 */
export const ENGAGED_SCROLL_DEPTH = 0.5;
export const ENGAGED_SECONDS = 20;
export type EngagedTrigger = 'scroll' | 'time' | 'pages';

export const ENGAGED_SENT_KEY = 'je-engaged-sent';
export const ENGAGED_PATHS_KEY = 'je-engaged-paths';

/** Pure state machine; each method returns the trigger the first time the visit becomes engaged, otherwise null. */
export function createEngagementWatcher(seenPaths: string[] = []) {
  const paths = new Set(seenPaths);
  let seconds = 0;
  let done = false;
  const hit = (trigger: EngagedTrigger): EngagedTrigger | null => {
    if (done) return null;
    done = true;
    return trigger;
  };
  return {
    pathSeen(path: string) { paths.add(path); return paths.size >= 2 ? hit('pages') : null; },
    scrolled(depth: number) { return Number.isFinite(depth) && depth >= ENGAGED_SCROLL_DEPTH ? hit('scroll') : null; },
    tick(visible: boolean) { if (visible) seconds += 1; return seconds >= ENGAGED_SECONDS ? hit('time') : null; },
    paths: () => [...paths],
    isDone: () => done,
  };
}

function sessionStore(): Storage | null {
  try { return window.sessionStorage; } catch { return null; }
}

/** Starts watching the current page. Returns a function that stops it. Safe to call during prerender (does nothing). */
export function startEngagementWatch(send: (trigger: EngagedTrigger) => void): () => void {
  if (typeof window === 'undefined' || typeof document === 'undefined' || navigator.webdriver === true) return () => {};
  const store = sessionStore();
  if (store?.getItem(ENGAGED_SENT_KEY) === '1') return () => {};
  let earlier: string[] = [];
  try { earlier = JSON.parse(store?.getItem(ENGAGED_PATHS_KEY) ?? '[]'); } catch { earlier = []; }
  const watcher = createEngagementWatcher(Array.isArray(earlier) ? earlier.filter(p => typeof p === 'string').slice(0, 20) : []);
  let timer: ReturnType<typeof setInterval> | undefined;
  const stop = () => {
    if (timer !== undefined) clearInterval(timer);
    window.removeEventListener('scroll', onScroll);
  };
  const fire = (trigger: EngagedTrigger | null) => {
    if (!trigger) return;
    try { store?.setItem(ENGAGED_SENT_KEY, '1'); } catch { /* One event may repeat on later pages if storage is unavailable. */ }
    stop();
    send(trigger);
  };
  const remember = () => {
    try { store?.setItem(ENGAGED_PATHS_KEY, JSON.stringify(watcher.paths().slice(0, 20))); } catch { /* ignore */ }
  };
  function onScroll() {
    const root = document.documentElement;
    if (!root.scrollHeight || window.scrollY <= 0) return;
    fire(watcher.scrolled((window.scrollY + window.innerHeight) / root.scrollHeight));
  }
  fire(watcher.pathSeen(window.location.pathname));
  remember();
  if (watcher.isDone()) return stop;
  window.addEventListener('scroll', onScroll, { passive: true });
  timer = setInterval(() => {
    fire(watcher.pathSeen(window.location.pathname));
    remember();
    fire(watcher.tick(document.visibilityState === 'visible'));
  }, 1000);
  return stop;
}
