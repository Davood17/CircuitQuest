#!/usr/bin/env python3
"""Detect the name row via its teal icon (strict teal + row mostly bg),
then propose crop line = first icon row - gap. Print per-image diagnostics."""
import os
import numpy as np
from PIL import Image

STAGE = '/home/z/my-project/upload/user-parts-staged'

def teal_rows(path):
    im = Image.open(path).convert('RGB')
    a = np.asarray(im).astype(int)
    h, w, _ = a.shape
    rowbg = np.median(a, axis=1)
    diff = np.abs(a - rowbg[:, None, :]).max(axis=2)
    frac = (diff > 30).mean(axis=1)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    teal = (r < 120) & (g > 115) & (b > 115) & (g > r + 45) & (np.abs(g - b) < 70)
    tcount = teal.sum(axis=1)
    cand = [(y, int(tcount[y]), round(float(frac[y]), 2)) for y in range(h) if tcount[y] >= 8 and frac[y] < 0.62]
    # group consecutive candidate rows
    groups = []
    for y, c, f in cand:
        if groups and y - groups[-1][-1][0] <= 4:
            groups[-1].append((y, c, f))
        else:
            groups.append([(y, c, f)])
    return im, groups, frac

for dev in ['robot', 'bell', 'car', 'console', 'phone']:
    d = os.path.join(STAGE, dev)
    for f in sorted(os.listdir(d)):
        im, groups, frac = teal_rows(os.path.join(d, f))
        gs = ['%d-%d(max%dpix)' % (g[0][0], g[-1][0], max(c for _, c, _ in g)) for g in groups]
        print(f'{dev:8s} {f} {im.width}x{im.height}  teal-row-groups: {", ".join(gs) if gs else "NONE"}')
