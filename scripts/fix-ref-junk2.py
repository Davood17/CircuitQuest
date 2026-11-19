#!/usr/bin/env python3
"""Pass 2 — full-rect bg fill for chip ghost edges (regions verified to contain
only chip + background, objects are far away). Sample pixels are filtered to
bg-like only (with widening fallback) so object pixels can never bleed in."""
from PIL import Image
import numpy as np
import os

OUT = '/home/z/my-project/public/ref'

# (file, edge, x0, x1 | y0, y1, depth) — full-rect paint, no color mask
RECTS = [
    ('phone/full.png', 'top',    0, 118, 24),
    ('phone/full.png', 'left',   0, 30,  28),
    ('bell/full.png',  'top',    0, 118, 10),
]

def bg_like(px):
    mx = int(px.max()); mn = int(px.min())
    sat = (mx - mn) * 255 // max(mx, 1)
    return sat <= 14 and mx >= 243

def clean_sample(vals):
    """vals: (n,3) candidate pixels → median of bg-like ones, widening search"""
    for _ in range(3):
        keep = [v for v in vals if bg_like(v)]
        if len(keep) >= 4:
            return np.median(np.array(keep), axis=0)
    return None

for rel, edge, a0, a1, depth in RECTS:
    path = os.path.join(OUT, rel)
    im = np.asarray(Image.open(path).convert('RGB')).copy()
    h, w = im.shape[:2]
    fixed = 0
    if edge == 'top':
        for x in range(a0, a1):
            for widen in (0, 8, 20):
                y_lo, y_hi = depth + 2 + widen, depth + 16 + widen
                fill = clean_sample(im[y_lo:y_hi, x, :])
                if fill is not None:
                    break
            if fill is None:
                fill = np.array([246, 250, 252])
            im[0:depth, x, :] = fill
            fixed += depth
    else:  # left
        for y in range(a0, a1):
            for widen in (0, 8, 20):
                x_lo, x_hi = depth + 2 + widen, depth + 16 + widen
                fill = clean_sample(im[y, x_lo:x_hi, :])
                if fill is not None:
                    break
            if fill is None:
                fill = np.array([246, 250, 252])
            im[y, 0:depth, :] = fill
            fixed += 1 * depth
    Image.fromarray(im).save(path)
    print(f'{rel} {edge}: rect-filled {fixed} px')
