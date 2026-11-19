#!/usr/bin/env python3
"""Magnified edge strips (outer 24px, x3 zoom) for every suspect ref asset.
One row per file: [top | bottom | left | right] — to eyeball exact junk depths."""
from PIL import Image, ImageDraw
import numpy as np, os

BAND = 24
ZOOM = 3
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

MAXW = max(Image.open(f).size for f in FILES)[0]
TILE_W = MAXW * ZOOM // 2 + 20   # longest horizontal edge band
TILE_H = BAND * ZOOM
ROW_H = TILE_H * 2 + 40
COLS = 2
rows = (len(FILES) + COLS - 1) // COLS
W = COLS * TILE_W
H = rows * ROW_H
canvas = Image.new('RGB', (W, H), (250, 250, 252))
d = ImageDraw.Draw(canvas)

for i, f in enumerate(FILES):
    r, c = divmod(i, COLS)
    ox, oy = c * TILE_W, r * ROW_H
    im = Image.open(f).convert('RGB')
    w, h = im.size
    a = np.asarray(im)
    bands = {
        'top': a[:BAND, :], 'bottom': a[-BAND:, :],
        'left': a[:, :BAND], 'right': a[:, -BAND:],
    }
    d.text((ox + 6, oy + 2), os.path.relpath(f, 'public/ref'), fill=(0, 0, 0))
    # top & bottom stacked; left & right rotated to horizontal below
    t = Image.fromarray(bands['top']).resize((w * ZOOM, BAND * ZOOM), Image.NEAREST)
    b = Image.fromarray(bands['bottom'][::-1]).resize((w * ZOOM, BAND * ZOOM), Image.NEAREST)
    l = Image.fromarray(np.rot90(bands['left'], k=1)).resize((w * ZOOM, BAND * ZOOM), Image.NEAREST)  # left edge, rotated so it reads top->bottom
    rr = Image.fromarray(np.rot90(bands['right'], k=1)).resize((w * ZOOM, BAND * ZOOM), Image.NEAREST)
    canvas.paste(t, (ox + 10, oy + 16))
    d.text((ox + 2, oy + 16), 'T', fill=(200, 0, 0))
    canvas.paste(b, (ox + 10, oy + 16 + TILE_H + 2))
    d.text((ox + 2, oy + 18 + TILE_H), 'B', fill=(200, 0, 0))
    canvas.paste(l, (ox + 10, oy + 16 + (TILE_H + 2) * 2))
    d.text((ox + 2, oy + 20 + (TILE_H + 2) * 2 - 2), 'L', fill=(200, 0, 0))
    canvas.paste(rr, (ox + 10, oy + 16 + (TILE_H + 2) * 3))
    d.text((ox + 2, oy + 22 + (TILE_H + 2) * 3 - 2), 'R', fill=(200, 0, 0))
    d.rectangle([ox, oy, ox + TILE_W - 1, oy + ROW_H - 1], outline=(190, 190, 200))

canvas.save('tool-results/edge-strips.png')
print('saved tool-results/edge-strips.png', canvas.size)
