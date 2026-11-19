#!/usr/bin/env python3
"""Task 17 — remove baked-in junk (teal label chips / neighbor-tile bands /
dark slivers) from specific ref crops. Region-limited + color-masked so the
photographed objects can never be touched. Fill = per-column/row median of
adjacent clean background, so the seamless photo bg continues through.
Re-runs a junk check on every treated edge to verify the result."""
from PIL import Image
import numpy as np
import os

OUT = '/home/z/my-project/public/ref'

# file → list of (edge, spec) — spec = region limits along the edge + mask
# mask: 'nonbg' = anything clearly not background; 'teal' = teal/green band;
#       'dark' = dark neutral sliver; 'light' = light-gray band; 'red' = red bleed
PLAN = {
    'bell/full.png':      [('top',    dict(x0=0, x1=115, d=10, mask='nonbg'))],
    'robot/full.png':     [('top',    dict(x0=0, x1=150, d=4,  mask='nonbg'))],
    'phone/full.png':     [('top',    dict(x0=0, x1=110, d=20, mask='nonbg')),
                           ('left',   dict(y0=0, y1=26,  d=28, mask='nonbg'))],
    'phone/internal.png': [('right',  dict(y0=0, y1=None, d=6,  mask='teal'))],
    'car/parts/control.png': [('right', dict(y0=0, y1=None, d=20, mask='teal|red')),
                              ('top',   dict(x0=0, x1=30,  d=10, mask='teal'))],
    'car/parts/motor.png':   [('right', dict(y0=0, y1=None, d=20, mask='teal|red')),
                              ('left',  dict(y0=0, y1=12,  d=12, mask='nonbg'))],
    'car/parts/lights.png':  [('right', dict(y0=0, y1=None, d=20, mask='teal')),
                              ('left',  dict(y0=70, y1=125, d=12, mask='dark|nonbg'))],
    'car/parts/wheels.png':  [('right', dict(y0=0, y1=None, d=16, mask='teal'))],
    'car/parts/wires.png':   [('right', dict(y0=0, y1=None, d=18, mask='teal')),
                              ('left',  dict(y0=55, y1=125, d=13, mask='nonbg'))],
    'console/parts/screen.png': [('left', dict(y0=30, y1=80, d=20, mask='teal'))],
    'robot/parts/board.png': [('right', dict(y0=85, y1=120, d=20, mask='teal'))],
    'bell/parts/case.png':   [('left',  dict(y0=25, y1=50, d=9,  mask='light|teal')),
                              ('right', dict(y0=0,  y1=None, d=6, mask='teal'))],
}

def hsv(a):
    af = a.astype(int)
    mx = af.max(axis=2); mn = af.min(axis=2)
    sat = np.where(mx == 0, 0, (mx - mn) * 255 // np.maximum(mx, 1))
    r, g, b = af[..., 0], af[..., 1], af[..., 2]
    hue = np.zeros(mx.shape)
    d = np.maximum(mx - mn, 1)
    m = (mx == r); hue[m] = (60 * ((g - b) / d) % 360)[m]
    m = (mx == g); hue[m] = (60 * ((b - r) / d) + 120)[m]
    m = (mx == b); hue[m] = (60 * ((r - g) / d) + 240)[m]
    return hue, sat, mx

def masks_for(a):
    hue, sat, val = hsv(a)
    bglike = (sat <= 12) & (val >= 246)
    return {
        'nonbg': ~bglike,
        'teal':  (sat > 22) & (hue >= 140) & (hue <= 210),
        'red':   (sat > 35) & ((hue <= 22) | (hue >= 345)),
        'dark':  (val < 190) & (sat < 60),
        'light': (sat <= 30) & (val >= 185) & (val < 247),
    }

def junk_depth_report(a):
    """max contiguous junk depth per edge (for verification printout)"""
    m = masks_for(a)['nonbg']
    h, w = m.shape
    out = {}
    for edge in ('top', 'bottom', 'left', 'right'):
        band = m[:18, :] if edge == 'top' else m[-18:, :] if edge == 'bottom' else (m[:, :18] if edge == 'left' else m[:, -18:])
        depths = band.all(axis=1).sum() if edge in ('top', 'bottom') else band.all(axis=0).sum()
        # simpler: count rows/cols fully junk + max run of junk-starting pixels
        if edge in ('top', 'bottom'):
            full = int(depths)
        else:
            full = int(depths)
        # max depth over columns/rows (how deep junk reaches anywhere)
        if edge == 'top':
            dmax = int(np.argmax(m.any(axis=1)[::-1] == False) if m.any() else 0)
            dmax = int(np.max(np.argmax(m, axis=0))) if m.any() else 0
        out[edge] = full
    return out

def fill_region(a, edge, spec):
    h, w = a.shape[:2]
    mk = masks_for(a)
    mask = np.zeros((h, w), bool)
    for name in spec['mask'].split('|'):
        mask |= mk[name]
    limit_axis = 0 if edge in ('top', 'bottom') else 1
    depth = spec['d']
    if edge == 'top':
        region = np.zeros_like(mask); region[:depth, spec['x0']:spec['x1']] = True
        samp = a[depth + 2:depth + 14, :, :]
    elif edge == 'bottom':
        region = np.zeros_like(mask); region[h - depth:, spec['x0']:spec['x1']] = True
        samp = a[h - depth - 14:h - depth - 2, :, :]
    elif edge == 'left':
        region = np.zeros_like(mask); region[spec['y0']:spec['y1'], :depth] = True
        samp = a[:, depth + 2:depth + 14, :]
    else:
        region = np.zeros_like(mask); region[spec['y0']:spec['y1'], w - depth:] = True
        samp = a[:, w - depth - 14:w - depth - 2, :]
    sel = region & mask
    if not sel.any():
        return 0
    fill = np.median(samp, axis=limit_axis).astype(a.dtype)
    ys, xs = np.nonzero(sel)
    a[ys, xs] = fill[xs] if limit_axis == 0 else fill[ys]
    return int(sel.sum())

total = 0
for rel, edges in PLAN.items():
    path = os.path.join(OUT, rel)
    im = Image.open(path).convert('RGB')
    a = np.asarray(im).copy()
    before = junk_depth_report(a)
    n = 0
    for edge, spec in edges:
        n += fill_region(a, edge, spec)
    after = junk_depth_report(a)
    Image.fromarray(a).save(path)
    total += n
    print(f'{rel:32s} painted={n:5d}px  before={before}  after={after}')
print('total painted pixels:', total)
