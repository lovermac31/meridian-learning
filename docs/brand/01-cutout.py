import sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

src, out = sys.argv[1], sys.argv[2]
im = Image.open(src).convert("RGB")
a = np.asarray(im).astype(np.int16)
mx, mn = a.max(axis=2), a.min(axis=2)
# checkerboard = light, near-neutral pixels (white and light grey squares, with JPEG noise)
bg_like = (mx > 150) & ((mx - mn) < 26)
mask = Image.fromarray(np.where(bg_like, 255, 0).astype(np.uint8), "L").copy()
w, h = mask.size
# flood from every border pixel that is background-like
for x in range(0, w, 7):
    for y in (0, h - 1):
        if mask.getpixel((x, y)) == 255:
            ImageDraw.floodfill(mask, (x, y), 128)
for y in range(0, h, 7):
    for x in (0, w - 1):
        if mask.getpixel((x, y)) == 255:
            ImageDraw.floodfill(mask, (x, y), 128)
m = np.array(mask)
alpha = Image.fromarray(np.where(m == 128, 0, 255).astype(np.uint8), "L")
# pull the edge in past the JPEG fringe, then feather slightly
alpha = alpha.filter(ImageFilter.MinFilter(7)).filter(ImageFilter.GaussianBlur(1.2))
rgba = im.convert("RGBA"); rgba.putalpha(alpha)
bbox = alpha.point(lambda v: 255 if v > 8 else 0).getbbox()
rgba = rgba.crop(bbox)
side = max(rgba.size)
sq = Image.new("RGBA", (side, side), (0, 0, 0, 0))
sq.paste(rgba, ((side - rgba.width) // 2, (side - rgba.height) // 2), rgba)
sq.save(out)
print("bbox", bbox, "square", sq.size, "transparent%", round(100 * (np.asarray(sq)[:, :, 3] == 0).mean(), 1))
