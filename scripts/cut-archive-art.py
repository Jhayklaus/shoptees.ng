#!/usr/bin/env python3
"""
Cut the grey studio background off the Collection Archive flats, and pull a
detail crop of each collection's defining graphic.

    python3 scripts/cut-archive-art.py          # report only
    python3 scripts/cut-archive-art.py --write

Run this by hand when artwork is added to public/archive, and COMMIT THE
OUTPUT. It is deliberately not part of `npm run build`: the derived files are
static assets that change only when the artwork does, so making every Vercel
build re-run a Python image pass would be cost with no benefit — and would put
a Python dependency in the deploy path of a Node project.

Why it exists
-------------
All 56 flats ship with a solid grey studio background baked in (#b3b3b3,
with a few at #cccccc / #e6e6e6). Rendered on the storefront that puts every
garment inside a grey rectangle inside a white tile — two frames nobody
art-directed. Knocking the grey out lets the garment sit directly on the page.

How the knockout works
----------------------
A flood fill from the border with a tolerance, not a global colour match: only
grey that is CONNECTED to the edge is removed, so grey inside a garment (a
zip, a shadow, a print) survives. The result is trimmed to its content and
re-padded square, so every card in a grid shares one frame and the garment
fills it.

Outputs
-------
    public/archive-cut/<collection>/<category>/<file>.webp   transparent flat
    public/archive-crop/<name>.webp                          graphic detail

Crop boxes are hand-set per collection below — there is no reliable way to
find "the chest graphic" automatically, and there are only six of them.
"""

import sys
import os
import glob
from PIL import Image, ImageDraw
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "public", "archive")
OUT_CUT = os.path.join(ROOT, "public", "archive-cut")
OUT_CROP = os.path.join(ROOT, "public", "archive-crop")

WRITE = "--write" in sys.argv

# Tolerance for "same colour as the background". High enough to take the
# anti-aliased fringe with it, low enough to leave a light garment alone.
THRESH = 34
# Sentinel colour for the flood fill. Compared against the original so a
# pixel that happened to be this colour already is not mistaken for fill.
SENT = (255, 0, 255)
MAX_EDGE = 1200
PAD = 0.06

# Detail crops: (source path under public/archive, output name, box as
# fractions of width/height). Chosen by eye, then checked for leftover grey.
CROPS = [
    ("fight-or-flight/tees/tee-red-graffiti-back_nnshptzx47.png", "ff-wall", (0.56, 0.42, 0.84, 0.76)),
    ("trap-house/beanies/beanie-allover-dice_nnshptzx10.png", "th-allover", (0.30, 0.28, 0.62, 0.62)),
    ("trap-house/buckets/bucket-hat-black-pink-dice_shptzBKT1.png", "th-dice", (0.40, 0.31, 0.62, 0.55)),
    ("urban-classic/tees/tee-black-gold-script_nnshptzx35.png", "uc-script", (0.53, 0.28, 0.78, 0.45)),
    # The seal on the BLACK polo is a dark red on black — legible on the
    # garment, near-invisible as a tile. Same mark on the white polo reads.
    ("shptz-wrld/polos/polo-white-red-seal_nnshptzx13.png", "sw-seal", (0.26, 0.28, 0.42, 0.51)),
    ("live-laugh-love/polos/polo-red-white-collar_nnshptzx8.png", "lll-script", (0.13, 0.36, 0.40, 0.54)),
    ("previous-season/long-sleeve-jerseys/ls-jersey-shoptees-black-blue_shptzBLU.png", "ps-26", (0.36, 0.58, 0.64, 0.82)),
    ("previous-season/jerseys/jersey-classic-white-pink_shp3.png", "ps-squiggle", (0.58, 0.55, 0.88, 0.76)),
]


def cut(path):
    """Return (RGBA image with the background removed, fraction removed)."""
    im = Image.open(path).convert("RGB")
    w, h = im.size

    work = im.copy()
    seeds = [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1),
             (w // 2, 0), (w // 2, h - 1), (0, h // 2), (w - 1, h // 2)]
    for s in seeds:
        ImageDraw.floodfill(work, s, SENT, thresh=THRESH)

    orig = np.array(im)
    filled = np.array(work)
    is_sentinel = np.all(filled == np.array(SENT), axis=2)
    changed = np.any(orig != filled, axis=2)
    background = is_sentinel & changed

    rgba = np.dstack([orig, np.where(background, 0, 255).astype(np.uint8)])
    out = Image.fromarray(rgba, "RGBA")

    # Trim to the garment, then re-pad square so every tile frames alike.
    bbox = out.getbbox()
    if bbox:
        out = out.crop(bbox)
    cw, ch = out.size
    side = max(cw, ch)
    pad = int(side * PAD)
    canvas = Image.new("RGBA", (side + pad * 2, side + pad * 2), (0, 0, 0, 0))
    canvas.paste(out, ((side - cw) // 2 + pad, (side - ch) // 2 + pad), out)
    if canvas.width > MAX_EDGE:
        canvas = canvas.resize((MAX_EDGE, MAX_EDGE), Image.LANCZOS)
    return canvas, float(background.mean())


def grey_fraction(img):
    """How much of a crop is still studio background — a crop with any is wrong."""
    a = np.array(img.convert("RGB")).astype(int)
    near = np.abs(a - 179).max(axis=2) < 12
    return float(near.mean())


def main():
    flats = sorted(glob.glob(os.path.join(SRC, "**", "*.png"), recursive=True))
    if not flats:
        raise SystemExit(f"No flats found under {SRC}")

    print(f"{'' if WRITE else 'DRY RUN — pass --write to save. '}{len(flats)} flats\n")

    total = 0
    suspicious = []
    for f in flats:
        rel = os.path.relpath(f, SRC)
        dest = os.path.join(OUT_CUT, os.path.splitext(rel)[0] + ".webp")
        img, removed = cut(f)
        # A flat that loses almost nothing, or nearly everything, means the
        # flood fill found the wrong thing — worth a human look either way.
        if removed < 0.35 or removed > 0.92:
            suspicious.append((rel, removed))
        if WRITE:
            os.makedirs(os.path.dirname(dest), exist_ok=True)
            img.save(dest, "WEBP", quality=86, method=5)
            total += os.path.getsize(dest)

    print(f"  cut      {len(flats)} flats" + (f" · {total // 1024} KB total" if WRITE else ""))
    for rel, r in suspicious:
        print(f"  ! check  {rel} — {r * 100:.0f}% removed")

    for rel, name, box in CROPS:
        src = os.path.join(SRC, rel)
        if not os.path.exists(src):
            print(f"  ! miss   {rel}")
            continue
        im = Image.open(src).convert("RGB")
        w, h = im.size
        crop = im.crop((int(box[0] * w), int(box[1] * h), int(box[2] * w), int(box[3] * h)))
        stray = grey_fraction(crop)
        crop.thumbnail((MAX_EDGE, MAX_EDGE), Image.LANCZOS)
        if WRITE:
            os.makedirs(OUT_CROP, exist_ok=True)
            crop.save(os.path.join(OUT_CROP, name + ".webp"), "WEBP", quality=86)
        flag = f"  ! {stray * 100:.0f}% studio grey — retune the box" if stray > 0.02 else ""
        print(f"  crop     {name}{flag}")

    print("\nDone." if WRITE else "\nNothing written.")


if __name__ == "__main__":
    main()
