#!/usr/bin/env python3
"""Measure junk strips near each edge of suspect ref assets.
A junk pixel = clearly non-background: saturation > 35 OR value < 185.
(Photos have near-white backgrounds; teal strips / dark slivers stand out.)
Prints, per edge, the depth profile of contiguous junk from that edge."""
from PIL import Image
import numpy as np
import sys

FILES = [
    'public/ref/bell/full.png', 'public/ref/bell/exploded.png', 'public/ref/bell/internal.png',
    'public/ref/robot/full.png', 'public/ref/robot/exploded.png', 'public/ref/robot/internal.png',
    'public/ref/phone/full.png', 'public/ref/phone/internal.png', 'public/ref/phone/exploded.png',
    'public/ref/car/exploded.png', 'public/ref/car/full.png', 'public/ref/car/internal.png',
    'public/ref/console/full.png', 'public/ref/console/internal.png', 'public/ref/console/exploded.png',
    'public/ref/car/parts/control.png', 'public/ref/car/parts/lights.png', 'public/ref/car/parts/motor.png',
    'public/ref/car/parts/wheels.png', 'public/ref/car/parts/wires.png',
    'public/ref/console/parts/screen.png', 'public/ref/robot/parts/board.png',
    'public/ref/phone/parts/speaker.png', 'public/ref/robot/parts/speaker.png',
    'public/ref/robot/parts/led.png', 'public/ref/bell/parts/case.png',
    'public/ref/bell/parts/wires.png', 'public/ref/bell/parts/battery.png',
]

MAXD = 18  # measure only the outer 18px

def prof(mask, edge, h, w):
    """for each index along the edge, junk depth from that edge (capped MAXD)"""
    if edge in ('top', 'bottom'):
        cols = []
        for x in range(w):
            col = mask[:, x] if edge == 'top' else mask[::-1, x]
            d = 0
            for v in col[:MAXD]:
                if v: d += 1
                else: break
            cols.append(d)
        return cols
    else:
        rows = []
        for y in range(h):
            row = mask[y, :] if edge == 'left' else mask[y, ::-1]
            d = 0
            for v in row[:MAXD]:
                if v: d += 1
                else: break
            rows.append(d)
        return rows

def summarize(name, vals, segdescr):
    if not vals: return
    mx = max(vals)
    if mx == 0:
        return
    # contiguous runs of depth>=2
    runs, s = [], None
    for i, v in enumerate(vals + [0]):
        if v >= 2 and s is None: s = i
        elif v < 2 and s is not None:
            runs.append((s, i - 1, max(vals[s:i]))); s = None
    txt = ', '.join(f'[{a}..{b}] d={d}' for a, b, d in runs if d >= 2)
    print(f'  {name:<9}: max={mx:<2} runs: {txt if txt else "(scattered <2px)"}')

for f in FILES:
    im = Image.open(f).convert('RGB')
    a = np.asarray(im).astype(int)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    mx = a.max(axis=2); mn = a.min(axis=2)
    sat = np.where(mx == 0, 0, (mx - mn) * 255 // mx)
    val = mx
    junk = (sat > 35) | (val < 185)
    h, w = junk.shape
    print(f'{f}  ({w}x{h})')
    summarize('top', prof(junk, 'top', h, w), 'x')
    summarize('bottom', prof(junk, 'bottom', h, w), 'x')
    summarize('left', prof(junk, 'left', h, w), 'y')
    summarize('right', prof(junk, 'right', h, w), 'y')
