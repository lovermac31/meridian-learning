#!/usr/bin/env python3
"""Read only explicitly named sample PDFs; never discover or open full editions."""
import argparse, hashlib, json, pathlib, re, sys
from pypdf import PdfReader, __version__ as pypdf_version
if pypdf_version != '6.11.0': raise RuntimeError('Use pinned pypdf 6.11.0 for deterministic sample extraction')

def sha(data): return hashlib.sha256(data).hexdigest()
def extract(root, public, config, ocr):
    allowed_ocr = {('centre-licence', n) for n in range(14, 19)} | {('printable-pack-l1', n) for n in [5,6,7,8,9,10,11,13,15]}
    supplements = {}
    if ocr.get('version') != 1: raise ValueError('Invalid reviewed OCR version')
    for entry in ocr.get('pages', []):
        key = (entry.get('stem'), entry.get('page'))
        if key not in allowed_ocr or key in supplements or entry.get('reviewed') is not True or not isinstance(entry.get('text'), str) or not entry['text'].strip() or not re.fullmatch('[0-9a-f]{64}', entry.get('imageSha256', '')): raise ValueError('Invalid reviewed OCR entry')
        supplements[key] = entry
    if set(supplements) != allowed_ocr: raise ValueError('All 14 reviewed OCR pages are required')
    documents = []
    for item in config:
        stem, count, product_id = item['stem'], item['count'], item['id']
        if not re.fullmatch('[a-z0-9-]+', stem): raise ValueError('Unsafe sample stem')
        sample_dir = root / stem / 'samples'
        try: sample_dir.resolve(strict=True).relative_to(root.resolve(strict=True))
        except ValueError: raise ValueError(f'{stem}: sample directory escapes approved source root')
        manifest = json.loads((sample_dir / 'pages' / 'pages.json').read_text())
        expected_names = [f'{stem}-pg{n:02d}.webp' for n in range(1, count + 1)]
        if manifest.get('id') != stem or manifest.get('source') != f'{stem}-sample.pdf' or manifest.get('pageCount') != count or [p.get('file') for p in manifest.get('pages', [])] != expected_names: raise ValueError(f'{stem}: manifest does not match public page order')
        pdf = sample_dir / manifest['source']
        if pdf.is_symlink() or not pdf.is_file() or pdf.resolve().parent != sample_dir.resolve(): raise ValueError(f'{stem}: unsafe sample PDF path')
        pdf_bytes = pdf.read_bytes()
        reader = PdfReader(pdf)
        if len(reader.pages) != count: raise ValueError(f'{stem}: PDF count differs from public sample')
        pages = []
        for index, (pdf_page, record) in enumerate(zip(reader.pages, manifest['pages'])):
            image = public / record['file']; local = sample_dir / 'pages' / record['file']
            current = image.read_bytes(); export = local.read_bytes()
            if len(export) != record['bytes'] or sha(current) != sha(export): raise ValueError(f'{stem}: public page {index + 1} differs from approved export')
            text = (pdf_page.extract_text() or '').replace('\r\n', '\n').replace('\r', '\n').strip()
            method = 'pdf-text'
            if len(re.sub(r'\s', '', text)) < 60 and (stem, index + 1) not in supplements: raise ValueError(f'{stem}: page {index + 1} has no meaningful text layer; reviewed public-image transcription required')
            if (stem, index + 1) in supplements:
                supplement = supplements[(stem, index + 1)]
                if supplement['imageSha256'] != sha(current): raise ValueError(f'{stem}: reviewed OCR image changed')
                text = supplement['text'].strip() + '\n\n' + text
                method = 'pdf-text+reviewed-ocr'
            if not text or len(text) > 40000: raise ValueError(f'{stem}: invalid sample text page {index + 1}')
            pages.append({'page': index + 1, 'image': record['file'], 'imageSha256': sha(current), 'text': text, 'textSha256': sha(text.encode()), 'method': method})
        documents.append({'version': 1, 'productId': product_id, 'sampleStem': stem, 'pageCount': count, 'source': {'file': manifest['source'], 'sha256': sha(pdf_bytes)}, 'pages': pages})
    return documents

def main():
    parser = argparse.ArgumentParser(); parser.add_argument('--source-root', required=True); parser.add_argument('--public-pages', required=True); parser.add_argument('--ocr', required=True)
    args = parser.parse_args(); root = pathlib.Path(args.source_root).resolve(); public = pathlib.Path(args.public_pages).resolve()
    documents = extract(root, public, json.load(sys.stdin), json.loads(pathlib.Path(args.ocr).read_text()))
    print(json.dumps(documents, ensure_ascii=False))
if __name__ == '__main__':
    try: main()
    except Exception as error:
        print(f'Sample text generation refused: {error}', file=sys.stderr); sys.exit(1)
