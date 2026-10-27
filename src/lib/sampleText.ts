/** Only the approved, public sample page set is accepted by the viewer. */
export type SampleTextPage = { page: number; image: string; imageSha256: string; text: string; textSha256: string; method: 'pdf-text' | 'pdf-text+reviewed-ocr' };
export type SampleTextDocument = { version: 1; productId: string; sampleStem: string; pageCount: number; source: { file: string; sha256: string }; pages: SampleTextPage[] };
export const SAMPLE_TEXT_MAX_BYTES = 1_000_000;
const hash = /^[0-9a-f]{64}$/;
const exactKeys = (value: object, keys: string[]) => Object.keys(value).sort().join('|') === [...keys].sort().join('|');
export function validateSampleText(value: unknown, productId: string, stem: string, count: number): SampleTextDocument {
  const d = value as SampleTextDocument;
  if (!d || typeof d !== 'object' || !exactKeys(d, ['version', 'productId', 'sampleStem', 'pageCount', 'source', 'pages']) || d.version !== 1 || d.productId !== productId || d.sampleStem !== stem || d.pageCount !== count || !Array.isArray(d.pages) || d.pages.length !== count || !d.source || !exactKeys(d.source, ['file', 'sha256']) || d.source.file !== `${stem}-sample.pdf` || !hash.test(d.source.sha256)) throw new Error('Invalid sample text');
  for (const [index, p] of d.pages.entries()) {
    if (!p || !exactKeys(p, ['page', 'image', 'imageSha256', 'text', 'textSha256', 'method']) || p.page !== index + 1 || p.image !== `${stem}-pg${String(index + 1).padStart(2, '0')}.webp` || !hash.test(p.imageSha256) || !hash.test(p.textSha256) || typeof p.text !== 'string' || !p.text.trim() || p.text.length > 40_000 || !['pdf-text', 'pdf-text+reviewed-ocr'].includes(p.method)) throw new Error('Invalid sample text');
  }
  return d;
}
export async function fetchSampleText(productId: string, stem: string, count: number, signal?: AbortSignal): Promise<SampleTextDocument> {
  if (!/^[a-z0-9-]+$/.test(productId) || !/^[a-z0-9-]+$/.test(stem)) throw new Error('Invalid sample text');
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (signal?.aborted) abort();
  signal?.addEventListener('abort', abort, { once: true });
  const timer = setTimeout(abort, 8_000);
  try {
    const response = await fetch(`/samples/pages/${productId}-text.json`, { signal: controller.signal, redirect: 'error', cache: 'no-cache' });
    if (!response.ok || Number(response.headers.get('Content-Length')) > SAMPLE_TEXT_MAX_BYTES || !response.body) throw new Error('Sample text unavailable');
    const reader = response.body.getReader();
    const chunks: Uint8Array[] = []; let size = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > SAMPLE_TEXT_MAX_BYTES) { await reader.cancel(); throw new Error('Sample text unavailable'); }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size); let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    return validateSampleText(JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)), productId, stem, count);
  } finally { clearTimeout(timer); signal?.removeEventListener('abort', abort); }
}
