import { ZH_ENGLISH_TOOL_PATH, ZH_PRACTICE_URL, getZhPreviewPage } from '../i18n/content/zhPreview';

// Unlisted Chinese preview (noindex, no sitemap, no inbound links). Renders without the site header and footer, like the
// centre-licence page: a slim brand bar, the explainer, and one practice block.
export function ZhPreviewPage({ pathname }: { pathname: string }) {
  const page = getZhPreviewPage(pathname);
  if (!page) return null;
  return (
    <>
      <div className="centre-licence-bar border-b border-sb-border bg-sb-cream">
        <div className="mx-auto flex h-14 max-w-4xl items-center px-5">
          <a href="/" className="font-wordmark text-[1.05rem] text-sb-forest" dir="ltr">
            Jurassic English<sup className="text-sb-amber-deep">™</sup>
          </a>
        </div>
      </div>
      <main id="main-content" tabIndex={-1} className="insights-page min-h-screen" lang={page.script}>
        <article className="mx-auto max-w-3xl px-5 py-10" style={{ fontFamily: 'system-ui, "PingFang SC", "PingFang TC", "Microsoft JhengHei", "Microsoft YaHei", "Noto Sans CJK SC", "Noto Sans CJK TC", sans-serif' }}>
          <h1 className="text-3xl font-semibold text-sb-forest">{page.h1}</h1>
          <p className="mt-4 leading-8">{page.intro}</p>
          <p className="mt-2 leading-8 font-semibold">{page.estimate}</p>
          <p className="mt-4">
            <a className="insights-button-primary" href={ZH_ENGLISH_TOOL_PATH} data-cta="zh-preview-tool">{page.toolLabel}</a>
          </p>
          <h2 className="mt-10 text-xl font-semibold text-sb-forest">{page.roundingTitle}</h2>
          <p className="mt-3 leading-8">{page.roundingIntro}</p>
          <table className="mt-4 w-full max-w-sm border-collapse text-left">
            <thead>
              <tr><th className="border-b border-sb-border py-2">{page.averageHeading}</th><th className="border-b border-sb-border py-2">{page.overallHeading}</th></tr>
            </thead>
            <tbody>
              {page.rounding.map(([average, overall]) => (
                <tr key={average}><td className="border-b border-sb-border py-2">{average}</td><td className="border-b border-sb-border py-2">{overall}</td></tr>
              ))}
            </tbody>
          </table>
          <p className="mt-4 leading-8">{page.example}</p>
          <p className="mt-4 leading-8">{page.planner}</p>
          <section className="mt-10 rounded-lg border border-sb-border p-5">
            <h2 className="text-xl font-semibold text-sb-forest">{page.practiceTitle}</h2>
            <p className="mt-3 leading-8">{page.practice}</p>
            <p className="mt-3 leading-8">{page.affiliation}</p>
            <p className="mt-3 leading-8">{page.teacher}</p>
            <p className="mt-4">
              <a className="insights-button-primary" href={ZH_PRACTICE_URL} target="_blank" rel="noopener noreferrer" data-cta="zh-preview-practice">{page.practiceLabel}</a>
            </p>
          </section>
        </article>
      </main>
    </>
  );
}
