#!/usr/bin/env python3
"""QA contact sheets for public/ref assets — 2 sheets: views (15) + parts (33)."""
from PIL import Image, ImageDraw
import os, glob

TILE = 300
COLS = 5
LABEL_H = 22

def sheet(files, out, cols=COLS):
    rows = (len(files) + cols - 1) // cols
    W = cols * TILE
    H = rows * (TILE + LABEL_H)
    canvas = Image.new('RGB', (W, H), (240, 240, 245))
    d = ImageDraw.Draw(canvas)
    for i, f in enumerate(files):
        r, c = divmod(i, cols)
        x, y = c * TILE, r * (TILE + LABEL_H)
        try:
            im = Image.open(f).convert('RGB')
            im.thumbnail((TILE - 8, TILE - 8))
            canvas.paste(im, (x + (TILE - im.width) // 2, y + LABEL_H + (TILE - im.height) // 2))
        except Exception as e:
            d.text((x + 6, y + LABEL_H + 6), f'ERR {e}', fill=(200, 0, 0))
        d.text((x + 6, y + 4), os.path.relpath(f, 'public/ref'), fill=(20, 20, 20))
        d.rectangle([x, y, x + TILE - 1, y + LABEL_H + TILE - 1], outline=(180, 180, 190))
    canvas.save(out)
    print(f'{out}: {canvas.size}, {len(files)} tiles')

views = sorted(glob.glob('public/ref/*/full.png') + glob.glob('public/ref/*/internal.png') + glob.glob('public/ref/*/exploded.png'))
parts = sorted(glob.glob('public/ref/*/parts/*.png'))
sheet(views, 'tool-results/contact-views.png')
sheet(parts, 'tool-results/contact-parts.png', cols=6)
