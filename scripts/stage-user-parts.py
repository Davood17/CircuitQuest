#!/usr/bin/env python3
"""Stage user-cropped part images into ASCII-named files + build contact sheets."""
import os, re, shutil
from PIL import Image

SRC = '/home/z/my-project/upload/user-parts'
STAGE = '/home/z/my-project/upload/user-parts-staged'
SHEETS = '/home/z/my-project/tool-results/user-parts-sheets'

FOLDERS = {  # Persian folder name -> device id
    'ربات': 'robot',
    'زنگ': 'bell',
    'ماشین': 'car',
    'کنسول': 'console',
    'گوشی': 'phone',
}

os.makedirs(STAGE, exist_ok=True)
os.makedirs(SHEETS, exist_ok=True)

index = []  # (device, staged_name, path, w, h)
for fa, dev in FOLDERS.items():
    d = os.path.join(SRC, fa)
    files = sorted(f for f in os.listdir(d) if f.lower().endswith('.png'))
    dev_dir = os.path.join(STAGE, dev)
    os.makedirs(dev_dir, exist_ok=True)
    for i, f in enumerate(files, 1):
        # staged name keeps timestamp digits for traceability
        m = re.search(r'(\d{6})\.png$', f)
        ts = m.group(1) if m else f'{i:02d}'
        dst = os.path.join(dev_dir, f'{ts}.png')
        shutil.copyfile(os.path.join(d, f), dst)
        im = Image.open(dst)
        index.append((dev, ts, dst, im.width, im.height))
        print(f'{dev:8s} {ts}.png  {im.width}x{im.height}  <- {f}')

# contact sheets: one per device, thumbnails 240px wide with labels
from PIL import ImageDraw, ImageFont
try:
    font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 18)
except Exception:
    font = ImageFont.load_default()

for dev in FOLDERS.values():
    items = [x for x in index if x[0] == dev]
    if not items:
        continue
    TW = 240
    pad = 12
    lab_h = 28
    thumbs = []
    for (_, ts, path, w, h) in items:
        im = Image.open(path).convert('RGB')
        th = int(h * TW / w)
        thumbs.append((ts, im.resize((TW, th))))
    cols = 3
    rows = (len(thumbs) + cols - 1) // cols
    cell_h = max(t[1].height for t in thumbs) + lab_h
    W = cols * (TW + pad) + pad
    H = rows * (cell_h + pad) + pad
    sheet = Image.new('RGB', (W, H), (245, 245, 245))
    dr = ImageDraw.Draw(sheet)
    for i, (ts, tim) in enumerate(thumbs):
        r, c = divmod(i, cols)
        x = pad + c * (TW + pad)
        y = pad + r * (cell_h + pad)
        sheet.paste(tim, (x, y + lab_h))
        dr.text((x, y + 4), f'{ts}.png  {tim.width}x{tim.height}', fill=(20, 20, 20), font=font)
    out = os.path.join(SHEETS, f'{dev}.png')
    sheet.save(out)
    print('sheet:', out, sheet.size)
print('DONE')
