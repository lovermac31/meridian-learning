# Jurassic English logo and site icons (11 Nov 2026)

Source: the Jurassic English badge Jay supplied on 11 Nov 2026 (a JPEG with a checkerboard background baked in).

| File | Use |
|---|---|
| `jurassic-english-logo-1024.png` | Full badge, transparent background |
| `jurassic-english-mark-512.png` | Small-size mark: the T-rex head from the same artwork in a gold ring |
| `public/favicon.ico` (16, 32, 48), `favicon-16x16.png`, `favicon-32x32.png`, `favicon.svg` | Browser tab: the mark, because the ribbon text cannot be read below about 48 px |
| `public/apple-touch-icon.png` (180) | Full badge on brand navy `#101820` (iOS paints transparency black) |
| `public/icon-192.png`, `icon-512.png` | Full badge, transparent. `icon-512.png` is also the Organization logo in the structured data |

To rebuild from a new source image (Python 3 with Pillow and NumPy):

1. `python3 01-cutout.py <source.jpg> logo-cutout.png` removes the checkerboard and squares the canvas.
2. `python3 02-mark.py logo-cutout.png mark.png 835 515 350` cuts the head (centre x, centre y, radius in cut-out pixels) and draws the ring.
3. `python3 03-icons.py logo-cutout.png mark.png ../../public .` writes every icon file.

`index.html` and `public/404.html` link the ICO and PNG icons only, so browsers use the size-tuned PNGs. `favicon.svg` stays for the older static film pages that link it.
