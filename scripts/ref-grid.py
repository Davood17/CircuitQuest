#!/usr/bin/env python3
"""Overlay a labeled coordinate grid on the reference images to find crop boxes."""
from PIL import Image, ImageDraw, ImageFont
import os

SRC = '/home/z/my-project/upload/ref-pages/elec'
OUT = '/home/z/my-project/tool-results/grids'
os.makedirs(OUT, exist_ok=True)

FILES = {
    'car': 'ChatGPT Image Sep 12, 2026, 05_20_38 PM.png',
    'bell': '1220c474-b220-48d9-938f-f539a8569798.png',
    'robot': 'b56fef39-0de2-4311-a180-aefcf8409c25.png',
    'phone': 'd9a75207-51b2-4b67-bdee-3b31af92894c.png',
    'console': 'f3770db5-f116-4895-9ac8-a78015e721c0.png',
}

try:
    font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 22)
except Exception:
    font = ImageFont.load_default()

for key, fname in FILES.items():
    im = Image.open(os.path.join(SRC, fname)).convert('RGB')
    d = ImageDraw.Draw(im)
    for x in range(0, im.width, 50):
        major = x % 100 == 0
        d.line([(x, 0), (x, im.height)], fill=(255, 0, 0) if major else (255, 160, 160), width=2 if major else 1)
        if major:
            d.text((x + 3, 3), str(x), fill=(255, 0, 0), font=font)
            d.text((x + 3, im.height - 26), str(x), fill=(255, 0, 0), font=font)
    for y in range(0, im.height, 50):
        major = y % 100 == 0
        d.line([(0, y), (im.width, y)], fill=(0, 90, 255) if major else (150, 180, 255), width=2 if major else 1)
        if major:
            d.text((3, y + 2), str(y), fill=(0, 90, 255), font=font)
            d.text((im.width - 60, y + 2), str(y), fill=(0, 90, 255), font=font)
    im.save(os.path.join(OUT, f'grid-{key}.png'))
    print('saved', key)
