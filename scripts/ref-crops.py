#!/usr/bin/env python3
"""Crop realistic device/part photos from the user's 5 reference pages.
Outputs to public/ref/** so they ship with the app, plus a contact sheet for visual QA."""
from PIL import Image, ImageDraw, ImageFont
import os

SRC = '/home/z/my-project/upload/ref-pages/elec'
OUT = '/home/z/my-project/public/ref'
SHEET = '/home/z/my-project/tool-results/crops'
os.makedirs(SHEET, exist_ok=True)

FILES = {
    'car': 'ChatGPT Image Sep 12, 2026, 05_20_38 PM.png',
    'bell': '1220c474-b220-48d9-938f-f539a8569798.png',
    'robot': 'b56fef39-0de2-4311-a180-aefcf8409c25.png',
    'phone': 'd9a75207-51b2-4b67-bdee-3b31af92894c.png',
    'console': 'f3770db5-f116-4895-9ac8-a78015e721c0.png',
}

# views: (x1, y1, x2, y2)
VIEWS = {
    'car': {
        'full': (28, 130, 470, 444),
        'internal': (492, 130, 897, 460),
        'exploded': (910, 135, 1297, 485),
    },
    'bell': {
        'full': (30, 128, 380, 442),
        'internal': (410, 140, 742, 505),
        'exploded': (762, 140, 1285, 528),
    },
    'robot': {
        'full': (25, 62, 385, 558),
        'internal': (408, 62, 782, 552),
        'exploded': (798, 68, 1262, 558),
    },
    'phone': {
        'full': (40, 108, 375, 468),
        'internal': (408, 142, 782, 542),
        'exploded': (802, 142, 1288, 545),
    },
    'console': {
        'full': (28, 135, 438, 418),
        'internal': (462, 138, 842, 428),
        'exploded': (862, 138, 1305, 462),
    },
}

# part photos: id → (x1, y1, x2, y2) — y band per device
PARTS = {
    'car': {
        'battery': (18, 505, 258, 697), 'motor': (274, 505, 500, 697),
        'control': (518, 505, 748, 697), 'wires': (776, 505, 1000, 697),
        'lights': (1024, 505, 1250, 697), 'wheels': (1274, 505, 1500, 697),
    },
    'bell': {
        'button': (18, 548, 235, 712), 'board': (248, 548, 455, 712),
        'speaker': (482, 548, 684, 712), 'battery': (712, 548, 910, 712),
        'wires': (938, 548, 1135, 712), 'case': (1158, 548, 1352, 712),
        'screws': (1384, 548, 1530, 712),
    },
    'robot': {
        'battery': (18, 578, 242, 738), 'board': (255, 578, 486, 738),
        'motor': (516, 578, 738, 738), 'sensor': (764, 578, 980, 738),
        'led': (1002, 578, 1138, 738), 'wires': (1150, 578, 1310, 738),
        'speaker': (1340, 578, 1530, 738),
    },
    'phone': {
        'battery': (18, 558, 258, 712), 'board': (270, 558, 500, 712),
        'camera': (520, 558, 700, 712), 'screen': (730, 558, 898, 712),
        'cpu': (930, 558, 1098, 712), 'port': (1130, 558, 1298, 712),
        'speaker': (1330, 558, 1530, 712),
    },
    'console': {
        'battery': (18, 512, 253, 676), 'board': (265, 512, 495, 676),
        'fan': (527, 512, 738, 676), 'screen': (770, 512, 978, 676),
        'joystick': (1012, 512, 1128, 676), 'buttons': (1164, 512, 1313, 676),
    },
}

crops = []  # (label, PIL image) for contact sheet

for dev, fname in FILES.items():
    im = Image.open(os.path.join(SRC, fname)).convert('RGB')
    ddir = os.path.join(OUT, dev)
    os.makedirs(os.path.join(ddir, 'parts'), exist_ok=True)
    for view, box in VIEWS[dev].items():
        c = im.crop(box)
        c.save(os.path.join(ddir, f'{view}.png'))
        crops.append((f'{dev}/{view}', c))
    for part, box in PARTS[dev].items():
        c = im.crop(box)
        c.save(os.path.join(ddir, 'parts', f'{part}.png'))
        crops.append((f'{dev}/{part}', c))
    print(dev, 'views:', len(VIEWS[dev]), 'parts:', len(PARTS[dev]))

# contact sheet: thumbnails 220px wide, labeled, 6 per row
TH_W, TH_H, LBL, COLS = 220, 150, 22, 6
rows = (len(crops) + COLS - 1) // COLS
sheet = Image.new('RGB', (COLS * (TH_W + 8) + 8, rows * (TH_H + LBL + 8) + 8), (240, 240, 240))
d = ImageDraw.Draw(sheet)
try:
    font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 15)
except Exception:
    font = ImageFont.load_default()
for i, (label, im) in enumerate(crops):
    r, cidx = divmod(i, COLS)
    x = 8 + cidx * (TH_W + 8)
    y = 8 + r * (TH_H + LBL + 8)
    th = im.copy()
    th.thumbnail((TH_W, TH_H))
    sheet.paste(th, (x + (TH_W - th.width) // 2, y + (TH_H - th.height) // 2))
    d.text((x + 2, y + TH_H + 3), label, fill=(20, 20, 20), font=font)
sheet.save(os.path.join(SHEET, 'contact-sheet.png'))
print('contact sheet:', os.path.join(SHEET, 'contact-sheet.png'), sheet.size)
print('total crops:', len(crops))
