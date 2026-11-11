# Small-size mark: the T-rex head from the same artwork inside a gold ring (no ribbon text, which cannot be read at 16-32 px).
import sys
import numpy as np
from PIL import Image, ImageDraw
src = Image.open(sys.argv[1]).convert("RGBA")
out = sys.argv[2]
cx, cy, r = int(sys.argv[3]), int(sys.argv[4]), int(sys.argv[5])
a = np.asarray(src)
def col(x, y): return tuple(int(v) for v in a[y-3:y+4, x-3:x+4, :3].reshape(-1, 3).mean(0))
gold_top, gold_bot, navy = col(757, 75), col(757 - 610, 900), col(757, 1150)
print("gold_top", gold_top, "gold_bot", gold_bot, "navy", navy)
N = 2048  # supersampled canvas
art = src.crop((cx - r, cy - r, cx + r, cy + r))
R_art = int(N * 0.5 * 0.80)                      # art circle = 80% of the icon radius
art = art.resize((2 * R_art, 2 * R_art), Image.LANCZOS)
def disc(rad):
    m = Image.new("L", (N, N), 0); ImageDraw.Draw(m).ellipse((N/2 - rad, N/2 - rad, N/2 + rad, N/2 + rad), fill=255); return m
icon = Image.new("RGBA", (N, N), (0, 0, 0, 0))
icon.paste(Image.new("RGBA", (N, N), navy + (255,)), (0, 0), disc(N * 0.5 * 0.995))          # outer navy edge
grad = np.linspace(0, 1, N)[:, None, None]
g = (np.array(gold_top)[None, None, :] * (1 - grad) + np.array(gold_bot)[None, None, :] * grad)
gold = Image.fromarray(np.broadcast_to(g, (N, N, 3)).astype(np.uint8), "RGB").convert("RGBA")
icon.paste(gold, (0, 0), disc(N * 0.5 * 0.945))                                              # gold ring
icon.paste(Image.new("RGBA", (N, N), navy + (255,)), (0, 0), disc(N * 0.5 * 0.835))          # inner navy line
layer = Image.new("RGBA", (N, N), navy + (255,))
layer.alpha_composite(art, (N // 2 - R_art, N // 2 - R_art))
icon.paste(layer, (0, 0), disc(R_art))
icon.resize((1024, 1024), Image.LANCZOS).save(out)
