import { ArrowLeft } from 'lucide-react';
import { legalDocuments, isLegalPath, type ContentBlock } from '../lib/legalContent';

export { isLegalPath };

type LegalPageProps = {
  onBack: () => void;
};

const BlockRenderer = ({ block }: { block: ContentBlock }) => {
  switch (block.type) {
    case 'paragraph':
      return (
        <p className="text-[15px] leading-[1.75] text-gray-700 mb-4 last:mb-0">
          {block.text}
        </p>
      );

    case 'list':
      return (
        <ul className="mb-4 last:mb-0 space-y-2 pl-5">
          {block.items.map((item, i) => (
            <li
              key={i}
              className="text-[15px] leading-[1.7] text-gray-700 list-disc marker:text-jurassic-accent/60"
            >
              {item}
            </li>
          ))}
        </ul>
      );

    case 'table':
      return (
        <div className="mb-4 last:mb-0 -mx-1 rounded-lg overflow-x-auto [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-jurassic-soft/50">
          <table className="text-sm border-collapse min-w-[700px] w-full">
            <thead>
              <tr className="bg-jurassic-dark text-white">
                {block.headers.map((h, i) => (
                  <th
                    key={i}
                    className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, ri) => (
                <tr
                  key={ri}
                  className={
                    ri % 2 === 0
                      ? 'bg-jurassic-soft/15'
                      : 'bg-white'
                  }
                >
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      className={`px-4 py-3 text-gray-700 border-b border-jurassic-soft/30 ${ci === 0 ? 'font-semibold text-jurassic-dark' : ''}`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case 'subsection':
      return (
        <div className="mb-5 last:mb-0">
          <h4 className="text-base font-bold text-jurassic-dark mb-3">
            {block.heading}
          </h4>
          {block.blocks.map((b, i) => (
            <BlockRenderer key={i} block={b} />
          ))}
        </div>
      );

    default:
      return null;
  }
};

export const LegalPage = ({ onBack }: LegalPageProps) => {
  const pathname = window.location.pathname;
  const doc = legalDocuments[pathname];

  if (!doc) return null;

  return (
    <div className="min-h-screen bg-white pt-28 pb-20">
      <main className="max-w-3xl mx-auto px-6">
        {/* Back nav */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-jurassic-dark transition-colors mb-10"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Jurassic English
        </button>

        {/* Header */}
        <span className="text-jurassic-accent font-bold uppercase tracking-[0.22em] text-xs mb-4 block">
          Legal
        </span>
        <h1 className="text-3xl md:text-4xl font-bold text-jurassic-dark tracking-tight mb-3">
          {doc.title}
        </h1>
        <p className="text-sm text-gray-500 mb-8">
          Effective Date: {doc.effectiveDate} · Last Updated: {doc.lastUpdated}
        </p>

        {/* Callout */}
        <div className="rounded-2xl border border-jurassic-soft/60 bg-jurassic-soft/10 p-6 md:p-8 mb-10">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-jurassic-accent mb-3">
            {doc.callout.label}
          </p>
          <p className="text-[15px] text-gray-700 leading-relaxed">
            {doc.callout.body}
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {doc.sections.map((section) => (
            <section key={section.number}>
              <h2 className="text-lg md:text-xl font-bold text-jurassic-dark mb-4 pb-2 border-b border-jurassic-soft/40">
                {section.number}. {section.heading}
              </h2>
              <div>
                {section.blocks.map((block, i) => (
                  <BlockRenderer key={i} block={block} />
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Contact block */}
        {doc.contact.length > 0 && (
          <div className="mt-10 rounded-xl bg-jurassic-dark p-6 md:p-8">
            <div className="space-y-2">
              {doc.contact.map((item, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:gap-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-white/55 sm:w-40 shrink-0">
                    {item.label}
                  </span>
                  <span className="text-sm text-white/85">
                    {item.value.includes('@') ? (
                      <a
                        href={`mailto:${item.value}`}
                        className="text-jurassic-accent hover:underline"
                      >
                        {item.value}
                      </a>
                    ) : (
                      item.value
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer copyright */}
        <p className="mt-8 text-sm text-gray-500">
          © 2026 World Wise Learning. All rights reserved.
        </p>
      </main>
    </div>
  );
};
