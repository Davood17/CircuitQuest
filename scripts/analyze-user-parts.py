#!/usr/bin/env python3
"""Analyze row structure of user card crops: find bg color, content blocks,
and teal-icon rows so we can split the photo area from the baked-in text."""
import os
import numpy as np
from PIL import Image

STAGE = '/home/z/my-project/upload/user-parts-staged'

def analyze(path):
    im = Image.open(path).convert('RGB')
    a = np.asarray(im).astype(int)
    h, w, _ = a.shape
    # per-row bg = row median (bg dominates every row; adapts to the card gradient)
    rowbg = np.median(a, axis=1)                # (h, 3)
    diff = np.abs(a - rowbg[:, None, :]).max(axis=2)
    content = diff > 30                         # non-bg mask
    frac = content.mean(axis=1)                 # per-row content fraction
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    teal = (r < 110) & (g > 110) & (b > 110) & (g > r + 50) & (np.abs(g - b) < 60)
    teal_frac = teal.mean(axis=1)

    # group content rows into blocks (gap >= 3 bg-ish rows splits)
    rows = frac > 0.004
    blocks = []
    y = 0
    while y < h:
        if rows[y]:
            y0 = y
            while y < h and (rows[y] or (y + 2 < h and (rows[y + 1] or rows[y + 2]))):
                y += 1
            blocks.append((y0, y - 1))
        else:
            y += 1
    return im, rowbg, frac, teal_frac, blocks

for dev in ['robot', 'bell', 'car', 'console', 'phone']:
    d = os.path.join(STAGE, dev)
    for f in sorted(os.listdir(d)):
        path = os.path.join(d, f)
        im, rowbg, frac, teal_frac, blocks = analyze(path)
        h, w = im.height, im.width
        desc = ' | '.join(f'{b0}-{b1}(h{b1-b0+1}{",TEAL" if teal_frac[b0:b1+1].max() > 0.01 else ""})' for b0, b1 in blocks)
        print(f'{dev:8s} {f} {w}x{h} blocks: {desc}')
