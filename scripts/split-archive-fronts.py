#!/usr/bin/env python3
"""
Split the front/back flats into single garments, for the product grid.

Most archive flats photograph a garment twice, front and back, side by side
in one frame. That is right for a detail view and wrong for a grid: fitted
into a card the pair is letterboxed, so each garment ends up around half the
size it could be and the tile reads as a wholesale line sheet rather than a
storefront.

This finds the transparent gutter between the two garments and writes the
left half — the front, in every flat in this archive — to
`public/archive-front/`, at the same path with the same name. The product
CARD prefers that file; the product PAGE keeps showing the full flat, where
seeing front and back at once is exactly what you want.

Separation is found by looking for a VALLEY in the ink-per-column profile,
not a fully transparent gutter. Requiring transparency only split 7 of 56
flats: in most of them the two garments touch — a sleeve overlapping a
sleeve — so there is no empty column between them, but there is still an
obvious dip. The polo flats drop from ~430 opaque pixels per column to ~166
at the seam, which is unmistakable; a flat with no separation at all sits
between 723 and 787 across its whole middle and is correctly left alone.

Only splits when the evidence is unambiguous:
  - the deepest column in the middle third is below VALLEY_RATIO of the
    band's typical ink, i.e. an actual dip rather than a flat profile
  - both halves hold a real garment (>= HALF_MIN of the total ink)
  - the frame is wider than MIN_RATIO to begin with
Anything else is left alone and the card falls back to the full flat, so a
detail shot, a single wide garment or a three-up never gets sliced through.

Output is committed rather than built: keeping Python off a Node deploy path
is worth more than the few hundred KB. Re-run with --write after changing
the cut-outs.
"""

import glob
import os
import sys

import numpy as np
from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "public", "archive-cut")
DST = os.path.join(ROOT, "public", "archive-front")
MANIFEST = os.path.join(ROOT, "src", "lib", "archive-fronts.ts")

# The seam column must carry less than this share of the band's typical ink.
# 0.41 is what the touching polos measure and 0.97 is what an unsplittable
# flat measures, so 0.62 sits clear of both.
VALLEY_RATIO = 0.62
# The seam has to be in the middle third; a dip near an edge is a hem.
CENTRE_BAND = (0.30, 0.70)
# Each side must carry at least this share of the opaque pixels, which rules
# out slicing a lone garment away from a stray speck.
HALF_MIN = 0.22
# How much ink the seam itself may carry, as a fraction of the garment's
# span across the cut. This is what tells two garments apart from ONE
# garment with a gap in it: the sweatpants have an obvious valley between
# the legs and a perfectly good depth score, but the waistband bridges it,
# so the seam column is 52% ink. A real pair measures 27% (polos, sleeves
# touching) or 0% (stacked jerseys, clean gap). Without this the trousers
# were cut in half and the grid showed a single leg.
SEAM_MAX_FILL = 0.35
# How lopsided a frame has to be along an axis before it is worth looking
# for a pair along it. Applied to width/height for a side-by-side pair and
# to height/width for a stacked one.
MIN_RATIO = 1.25
PAD = 0.03
# Ignore antialiasing haze when deciding what counts as ink.
ALPHA_MIN = 8
# A guard, not a real limit: these flats have a handful of components.
MAX_COMPONENTS = 64
QUALITY = 86

WRITE = "--write" in sys.argv


def split_point(alpha):
    """(column index, valley depth) of the seam between two garments, or None.

    Depth is the seam's ink as a fraction of the band's typical ink, so
    lower is a cleaner separation. It is returned so the two axes can be
    compared: a frame is tried both ways and the deeper valley wins.

    `alpha` is already cropped to the content box, so column 0 is the left
    edge of the ink and the returned index is relative to that. Pass a
    transposed array to find a horizontal seam in a stacked pair.
    """
    ink = alpha.sum(axis=0).astype(float)
    w = len(ink)
    lo, hi = int(w * CENTRE_BAND[0]), int(w * CENTRE_BAND[1])
    band = ink[lo:hi]
    if band.size == 0:
        return None

    # Median of the band, not the peak: a single tall column (a collar, a
    # hanging cord) would otherwise set the bar too high and split a frame
    # that has no seam in it.
    typical = float(np.median(band))
    if typical <= 0:
        return None

    seam = lo + int(band.argmin())
    depth = float(ink[seam]) / typical
    if depth > VALLEY_RATIO:
        return None
    return seam, depth


def largest_component(img):
    """Keep the main garment, discard detached fragments.

    The seam lands at the thinnest column, which is usually just inside the
    real boundary — so on a couple of flats a piece of the BACK garment
    survived: on the Fight or Flight tees it is the back's left sleeve,
    sitting low and to the right of the front.

    That fragment cannot be found by looking for empty rows or columns,
    which is what this did first. The sleeve's rows overlap the front tee's
    rows and its columns overlap the front tee's columns, so by either axis
    the whole thing is one unbroken run. The only thing that actually
    separates them is that they do not touch, which is a connected-component
    question and has to be answered as one.

    Flood-filled rather than labelled by hand: ImageDraw.floodfill is the C
    implementation already in the dependency set, and these images have a
    handful of components, not thousands.
    """
    alpha = np.array(img.getchannel("A"))
    ink = alpha > ALPHA_MIN
    if not ink.any():
        return img

    # Labelled in RGB, not "L", and that is not a style choice: in Pillow
    # 12.3 ImageDraw.floodfill is a SILENT NO-OP on an "L" image — it
    # returns having changed nothing, with no error. The first version of
    # this labelled in "L", every component came back empty, every garment
    # was blanked, and the script reported "0 split" while cheerfully
    # skipping all 56 files down a path that does not print a reason. RGB
    # fills work, which is also why the cut-out script beside this one uses
    # them.
    #
    # White = ink not yet claimed. Each component is claimed as (tag, 0, 0).
    lab = Image.fromarray(
        np.where(ink[..., None], 255, 0).astype(np.uint8).repeat(3, axis=2), "RGB"
    )
    sizes = []
    for tag in range(1, MAX_COMPONENTS + 1):
        arr = np.array(lab)
        unclaimed = np.all(arr == 255, axis=2)
        ys, xs = np.nonzero(unclaimed)
        if len(ys) == 0:
            break
        ImageDraw.floodfill(lab, (int(xs[0]), int(ys[0])), (tag, 0, 0))
        arr = np.array(lab)
        claimed = (arr[..., 0] == tag) & (arr[..., 1] == 0) & (arr[..., 2] == 0)
        sizes.append((int(claimed.sum()), tag))

    if len(sizes) <= 1:
        return img

    _, keep = max(sizes)
    arr = np.array(lab)
    mask = (arr[..., 0] == keep) & (arr[..., 1] == 0) & (arr[..., 2] == 0)
    out = np.array(img)
    out[..., 3] = np.where(mask, out[..., 3], 0)
    return Image.fromarray(out, "RGBA")


def trim_pad(img):
    box = img.getbbox()
    if not box:
        return None
    img = img.crop(box)
    pad = int(max(img.size) * PAD)
    canvas = Image.new("RGBA", (img.width + pad * 2, img.height + pad * 2), (0, 0, 0, 0))
    canvas.paste(img, (pad, pad), img)
    return canvas


def write_manifest(paths):
    """Emit the list of flats that have a front crop.

    The storefront needs to know which ones exist BEFORE it renders a URL —
    pointing <Image> at a file that was never produced is a 404 and a broken
    tile, not a graceful fallback. A generated set is cheaper and more
    honest than trying to probe the filesystem at render time.
    """
    body = "\n".join(f'  "{p}",' for p in sorted(paths))
    with open(MANIFEST, "w") as fh:
        fh.write(
            "// GENERATED by scripts/split-archive-fronts.py — do not edit.\n"
            "//\n"
            "// Archive flats that have a single-garment front crop under\n"
            "// /archive-front. Product CARDS use it so the grid shows one\n"
            "// garment large instead of a front-and-back pair letterboxed\n"
            "// into a tile; the product PAGE keeps the full flat, where\n"
            "// seeing both at once is the point.\n"
            "export const ARCHIVE_FRONTS: ReadonlySet<string> = new Set([\n"
            + body
            + "\n]);\n"
        )


def main():
    flats = sorted(glob.glob(os.path.join(SRC, "**", "*.webp"), recursive=True))
    if not flats:
        raise SystemExit(f"No cut-outs found under {SRC}")

    print(f"{'' if WRITE else 'DRY RUN — pass --write to save. '}{len(flats)} flats\n")
    split = skipped = 0
    written = []

    for path in flats:
        rel = os.path.relpath(path, SRC)
        im = Image.open(path).convert("RGBA")
        alpha = np.array(im.getchannel("A")) > 0

        box = im.getbbox()
        bw, bh = box[2] - box[0], box[3] - box[1]

        # Most flats lay the pair out side by side, but some stack it — the
        # long-sleeve jerseys are front above back. Both are tried and the
        # DEEPER valley wins, rather than gating on the frame's aspect
        # ratio: a stacked pair of long-sleeve jerseys is 0.95 wide-to-tall,
        # because each jersey is wide with the sleeves out, so an aspect
        # test called it "not a pair" and left it whole.
        #
        # Taking the near half either way: left for a side-by-side pair,
        # top for a stacked one. In every flat in this archive that is the
        # front.
        total = alpha.sum()
        best = None
        for axis, found in (
            ("h", split_point(alpha[:, box[0]:box[2]])),
            ("v", split_point(alpha[box[1]:box[3], :].T)),
        ):
            if found is None:
                continue
            seam, depth = found
            # Span ACROSS the cut: a vertical seam is measured against the
            # content height, a horizontal one against its width.
            span = (box[3] - box[1]) if axis == "h" else (box[2] - box[0])
            strip = (
                alpha[:, box[0] + seam] if axis == "h" else alpha[box[1] + seam, :]
            )
            if strip.sum() > span * SEAM_MAX_FILL:
                continue

            seam += box[0] if axis == "h" else box[1]
            if axis == "h":
                near = alpha[:, :seam].sum() / total
            else:
                near = alpha[:seam, :].sum() / total
            far = 1 - near
            if min(near, far) < HALF_MIN:
                continue
            if best is None or depth < best[3]:
                best = (axis, seam, near, depth)

        if best is None:
            print(f"  skip  {rel:60} no seam found")
            skipped += 1
            continue

        axis, cut, near, _ = best
        left_share, right_share = near, 1 - near

        half = (
            im.crop((0, 0, cut, im.height)) if axis == "h" else im.crop((0, 0, im.width, cut))
        )
        left_share, right_share = near, far
        front = trim_pad(largest_component(half))
        if front is None:
            # Reached only if the whole left half came back empty, which
            # would mean the seam or the component pick was wrong. Say so —
            # this path silently swallowed all 56 files once.
            print(f"  skip  {rel:60} front came back empty")
            skipped += 1
            continue

        out = os.path.join(DST, rel)
        if WRITE:
            os.makedirs(os.path.dirname(out), exist_ok=True)
            front.save(out, "WEBP", quality=QUALITY, method=6)
        print(f"  split {rel:60} {front.width}x{front.height} ({left_share:.0%}/{right_share:.0%})")
        written.append(rel.replace(os.sep, "/"))
        split += 1

    print(f"\n{split} split, {skipped} left whole")

    if WRITE:
        write_manifest(written)
        print(f"Wrote {MANIFEST}")
    else:
        print("Nothing written.")


if __name__ == "__main__":
    main()
