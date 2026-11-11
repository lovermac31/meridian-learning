import sys, base64, io
from PIL import Image, ImageFilter
badge = Image.open(sys.argv[1]).convert("RGBA")     # full badge, transparent
emblem = Image.open(sys.argv[2]).convert("RGBA")    # small-size mark
pub, brand = sys.argv[3], sys.argv[4]
def scaled(im, size, sharpen=0):
    r = im.convert("RGBa").resize((size, size), Image.LANCZOS).convert("RGBA")
    if sharpen:
        rgb = r.convert("RGB").filter(ImageFilter.UnsharpMask(radius=0.6, percent=sharpen, threshold=0))
        rgb.putalpha(r.getchannel("A")); r = rgb
    return r
e16, e32, e48 = scaled(emblem, 16, 80), scaled(emblem, 32, 60), scaled(emblem, 48, 40)
e16.save(f"{pub}/favicon-16x16.png", optimize=True)
e32.save(f"{pub}/favicon-32x32.png", optimize=True)
e48.save(f"{pub}/favicon.ico", format="ICO", sizes=[(16, 16), (32, 32), (48, 48)], append_images=[e16, e32])
scaled(badge, 192).save(f"{pub}/icon-192.png", optimize=True)
scaled(badge, 512).save(f"{pub}/icon-512.png", optimize=True)
at = Image.new("RGBA", (180, 180), (16, 24, 32, 255))      # iOS paints transparency black: brand navy tile instead
at.alpha_composite(scaled(badge, 156), (12, 12))
at.convert("RGB").save(f"{pub}/apple-touch-icon.png", optimize=True)
buf = io.BytesIO(); scaled(emblem, 128).save(buf, format="PNG", optimize=True)
b64 = base64.b64encode(buf.getvalue()).decode()
open(f"{pub}/favicon.svg", "w").write(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-label="Jurassic English">\n'
    f'  <image width="128" height="128" href="data:image/png;base64,{b64}"/>\n</svg>\n')
scaled(badge, 1024).save(f"{brand}/jurassic-english-logo-1024.png", optimize=True)
scaled(emblem, 512).save(f"{brand}/jurassic-english-mark-512.png", optimize=True)
