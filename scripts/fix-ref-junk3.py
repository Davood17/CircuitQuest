#!/usr/bin/env python3
"""Task 17 pass 3 — unified junk cleaner for ALL ref crops.

Junk (neighbor-tile rounded-corner arcs, tile washes, border lines, bleed
slivers) shows up as connected components that live ENTIRELY inside the outer
RING px of the image and are small. Object parts always extend inward (their
component's bbox escapes the ring), so they are protected by construction.
Fill = bg-verified per-column/row median (never samples object pixels).
"""
from PIL import Image
import numpy as np
from collections import deque
import os, glob

OUT = '/home/z/my-project/public/ref'
RING = 26          # junk must live entirely within this outer band
AREA_CAP = 2600    # and be smaller than this (chip ~2200, arcs ~150)

def bglike(a):
    mx = a.max(axis=2); mn = a.min(axis=2)
    sat = np.where(mx == 0, 0, (mx - mn) * 255 // np.maximum(mx, 1))
    return (sat <= 14) & (mx >= 240)

def components(nonbg):
    h, w = nonbg.shape
    lab = np.zeros((h, w), int); cur = 0; comps = []
    for y, x in zip(*np.nonzero(nonbg)):
        if lab[y, x]: continue
        cur += 1; q = deque([(y, x)]); lab[y, x] = cur; px = []
        while q:
            cy, cx = q.popleft(); px.append((cy, cx))
            for dy in (-1, 0, 1):
                for dx in (-1, 0, 1):
                    ny, nx = cy + dy, cx + dx
                    if 0 <= ny < h and 0 <= nx < w and nonbg[ny, nx] and not lab[ny, nx]:
                        lab[ny, nx] = cur; q.append((ny, nx))
        comps.append(px)
    return comps

def clean(path):
    im = np.asarray(Image.open(path).convert('RGB')).copy()
    h, w = im.shape[:2]
    bg = bglike(im)
    nonbg = ~bg
    junk = np.zeros((h, w), bool)
    for comp in components(nonbg):
        ys = [p[0] for p in comp]; xs = [p[1] for p in comp]
        y0, y1, x0, x1 = min(ys), max(ys), min(xs), max(xs)
        hugs_edge = (y1 < RING) or (y0 > h - 1 - RING) or (x1 < RING) or (x0 > w - 1 - RING)
        if len(comp) <= AREA_CAP and hugs_edge:
            for y, x in comp: junk[y, x] = True
    if not junk.any():
        return 0
    # fill: bg-verified sampling — sample runs perpendicular from the junk
    # pixel toward the interior (or the whole column as fallback)
    filled = 0
    ys, xs = np.nonzero(junk)
    for y, x in zip(ys, xs):
        if y < h / 2:   cand = im[y + 4:y + 22, x, :]
        else:           cand = im[max(0, y - 22):max(0, y - 4), x, :]
        flat = cand.reshape(-1, 3)
        keep = flat[bglike(flat.reshape(1, -1, 3)).reshape(-1)]
        if len(keep) < 3:
            flat = im[:, x, :]
            keep = flat[bglike(flat.reshape(1, -1, 3)).reshape(-1)]
        if len(keep) < 3:
            continue
        im[y, x] = np.median(keep, axis=0)
        filled += 1
    Image.fromarray(im).save(path)
    return filled

total = 0; touched = []
files = sorted(glob.glob(f'{OUT}/*/full.png') + glob.glob(f'{OUT}/*/internal.png') +
               glob.glob(f'{OUT}/*/exploded.png') + glob.glob(f'{OUT}/*/parts/*.png'))
for f in files:
    n = clean(f)
    if n:
        touched.append((os.path.relpath(f, OUT), n))
        total += n
for t, n in touched:
    print(f'{t:34s} cleaned {n:5d} px')
print('files touched:', len(touched), ' total px:', total)
