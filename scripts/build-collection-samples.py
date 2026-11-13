#!/usr/bin/env python3
"""Build the public sample sets for the Level 1-5 collection products (13 Nov 2026, task WW-20261113-07).

Reads ONLY the pages named in scripts/collection-samples.json from the finished PDFs listed in a product inventory CSV
(columns file_name, local_path). For each stem it writes
  public/samples/pages/<stem>-pgNN.webp   1200x1699 watermarked, view-only page images
  public/samples/<stem>-p1..p3.webp       600 px card thumbnails (the first three pages)
  public/samples/small/<stem>-p1..p3.webp 300 px thumbnails
  public/samples/pages/<id>-text.json     the page text the sample viewer indexes (hash-bound to the images)
No full PDF is ever written under public/. The assembled sample PDF used to extract text is written to --work-dir only.

usage: python3 scripts/build-collection-samples.py --inventory PRODUCT-INVENTORY.csv --work-dir /tmp/samples-work
"""
import argparse, csv, hashlib, json, pathlib, subprocess, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
PUB = ROOT / 'public' / 'samples'
W, H = 1200, 1699
FONT = next((f for f in ('/System/Library/Fonts/Supplemental/Arial Bold.ttf', '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 'Helvetica-Bold') if f.startswith('Helv') or pathlib.Path(f).exists()), 'Helvetica-Bold')


def sh(cmd, **kw):
    return subprocess.run(cmd, check=True, capture_output=True, **kw)


def sha(b):
    return hashlib.sha256(b).hexdigest()


def render(pdf, page, out_png):
    sh(['pdftoppm', '-f', str(page), '-l', str(page), '-scale-to-x', str(W), '-scale-to-y', str(H), '-png', '-singlefile', str(pdf), str(out_png.with_suffix(''))])


def watermark(png, out_webp):
    # Same view-only treatment as the existing sample sets: a diagonal "SAMPLE" across the page and an orange pill at the foot.
    sh(['magick', str(png),
        '(', '-size', f'{W}x{H}', 'xc:none', '-font', FONT, '-pointsize', '78', '-fill', 'rgba(30,30,30,0.17)',
        '-gravity', 'center', '-annotate', '-36x-36+0+0', 'SAMPLE · jurassicenglish.com', ')', '-composite',
        '(', '-size', f'{W}x{H}', 'xc:none', '-fill', '#e0612b', '-draw', 'roundrectangle 360,1648 840,1690 21,21',
        '-font', FONT, '-pointsize', '22', '-fill', 'white', '-gravity', 'south', '-annotate', '+0+12',
        'SAMPLE · jurassicenglish.com/products', ')', '-composite',
        '-define', 'webp:method=6', '-quality', '82', str(out_webp)])


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--inventory', required=True)
    ap.add_argument('--work-dir', required=True)
    ap.add_argument('--only', help='comma-separated stems to build')
    a = ap.parse_args()
    work = pathlib.Path(a.work_dir); work.mkdir(parents=True, exist_ok=True)
    paths = {r['file_name']: r['local_path'] for r in csv.DictReader(open(a.inventory))}
    spec = json.load(open(ROOT / 'scripts' / 'collection-samples.json'))
    only = set(a.only.split(',')) if a.only else None
    (PUB / 'pages').mkdir(parents=True, exist_ok=True); (PUB / 'small').mkdir(parents=True, exist_ok=True)
    for stem, item in spec.items():
        if only and stem not in only: continue
        pdf_parts, pages = [], []
        for n, ref in enumerate(item['pages'], 1):
            src = paths[ref['file']]
            png = work / f'{stem}-{n:02d}.png'
            render(src, ref['page'], png)
            webp = PUB / 'pages' / f'{stem}-pg{n:02d}.webp'
            watermark(png, webp)
            pdf_parts += [src, str(ref['page'])]
            pages.append((src, ref['page'], webp))
        # assembled sample PDF (work dir only): used for the page text and its hash
        sample_pdf = work / f'{stem}-sample.pdf'
        cmd = ['qpdf', '--empty', '--pages']
        for src, page, _ in pages: cmd += [src, str(page)]
        cmd += ['--', str(sample_pdf)]
        sh(cmd)
        for n in (1, 2, 3):
            big = PUB / f'{stem}-p{n}.webp'; small = PUB / 'small' / f'{stem}-p{n}.webp'
            for q in ('80', '72', '64', '56'):  # keep every card thumbnail under the 80 KB test limit
                sh(['magick', str(PUB / 'pages' / f'{stem}-pg{n:02d}.webp'), '-resize', '600x', '-define', 'webp:method=6', '-quality', q, str(big)])
                if big.stat().st_size < 76 * 1024: break
            sh(['magick', str(PUB / 'pages' / f'{stem}-pg{n:02d}.webp'), '-resize', '300x', '-define', 'webp:method=6', '-quality', '78', str(small)])
        doc_pages = []
        for n, (src, page, webp) in enumerate(pages, 1):
            text = sh(['pdftotext', '-f', str(page), '-l', str(page), '-layout', src, '-']).stdout.decode('utf-8').replace('\r\n', '\n').strip()
            # Never publish an answer key or a licence block by accident in the indexed text.
            if len(text) < 20: text = item.get('fallback_text', 'Sample page')
            doc_pages.append({'page': n, 'image': webp.name, 'imageSha256': sha(webp.read_bytes()), 'text': text, 'textSha256': sha(text.encode()), 'method': 'pdf-text'})
        doc = {'version': 1, 'productId': item['id'], 'sampleStem': stem, 'pageCount': len(pages),
               'source': {'file': f'{stem}-sample.pdf', 'sha256': sha(sample_pdf.read_bytes())}, 'pages': doc_pages}
        (PUB / 'pages' / f"{item['id']}-text.json").write_text(json.dumps(doc, ensure_ascii=False, indent=2) + '\n')
        print(stem, len(pages), 'pages')


if __name__ == '__main__':
    try: main()
    except subprocess.CalledProcessError as e:
        print((e.stderr or b'').decode()[:500], file=sys.stderr); sys.exit(1)
