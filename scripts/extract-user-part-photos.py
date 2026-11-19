#!/usr/bin/env python3
"""Extract clean photo regions from the user's card crops and install them as
public/ref/{dev}/parts/{id}.png. Old files are backed up first.
Method: find the name row via its teal icon (last teal group, merging gaps
<=15px), crop above it, drop 4px edges (borders/rounding), bbox-trim, pad 6px."""
import os, shutil
import numpy as np
from PIL import Image

STAGE = '/home/z/my-project/upload/user-parts-staged'
REF = '/home/z/my-project/public/ref'
BACKUP = '/home/z/my-project/upload/old-parts-backup'
SHEETS = '/home/z/my-project/tool-results/user-parts-sheets'

MAP = {
    'robot': {'145446': 'battery', '145502': 'board', '145512': 'motor', '145524': 'sensor',
              '145537': 'led', '145548': 'wires', '145601': 'speaker'},
    'bell':  {'145206': 'button', '145235': 'board', '145250': 'speaker', '145306': 'battery',
              '145320': 'wires', '145332': 'case', '145344': 'screws'},
    'car':   {'145619': 'battery', '145643': 'motor', '145656': 'control', '145710': 'wires',
              '145722': 'lights', '145733': 'wheels'},
    'console': {'145950': 'battery', '150011': 'board', '150023': 'fan', '150034': 'screen',
                '150048': 'joystick', '150100': 'buttons'},
    'phone': {'145752': 'battery', '145818': 'board', '145831': 'camera', '145842': 'screen',
              '145855': 'cpu', '145906': 'port', '145917': 'speaker'},
}

# backup current parts once
if not os.path.exists(BACKUP):
    shutil.copytree(REF, BACKUP)
    print('backed up old public/ref ->', BACKUP)

def name_top(a):
    """first row of the last (gap<=15 merged) teal-icon group"""
    h, w, _ = a.shape
    rowbg = np.median(a, axis=1)
    diff = np.abs(a - rowbg[:, None, :]).max(axis=2)
    frac = (diff > 30).mean(axis=1)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    teal = (r < 120) & (g > 115) & (b > 115) & (g > r + 45) & (np.abs(g - b) < 70)
    tcount = teal.sum(axis=1)
    cand = [y for y in range(h) if tcount[y] >= 8 and frac[y] < 0.62]
    groups = []
    for y in cand:
        if groups and y - groups[-1][-1] <= 15:
            groups[-1].append(y)
        else:
            groups.append([y])
    if not groups:
        raise ValueError('no teal name row found')
    return groups[-1][0]

def bbox_trim(a, pad=6):
    """trim to content bbox vs per-row/col median, then pad (clamped)"""
    h, w, _ = a.shape
    rowbg = np.median(a, axis=1)
    diff = np.abs(a - rowbg[:, None, :]).max(axis=2)
    rows = (diff > 30).mean(axis=1) > 0.006
    colbg = np.median(a, axis=0)
    diffc = np.abs(a - colbg[None, :, :]).max(axis=2)
    cols = (diffc > 30).mean(axis=0) > 0.006
    ys = np.where(rows)[0]
    xs = np.where(cols)[0]
    if len(ys) == 0 or len(xs) == 0:
        return a
    y0, y1 = max(0, ys[0] - pad), min(h, ys[-1] + 1 + pad)
    x0, x1 = max(0, xs[0] - pad), min(w, xs[-1] + 1 + pad)
    return a[y0:y1, x0:x1]

results = []
for dev, m in MAP.items():
    for ts, part_id in m.items():
        src = os.path.join(STAGE, dev, f'{ts}.png')
        im = Image.open(src).convert('RGB')
        a = np.asarray(im).astype(int)
        nt = name_top(a)
        region = a[:max(nt - 6, 10)]            # photo area above the name row
        region = region[4:-4, 4:-4]             # drop card border/rounded corners
        trimmed = bbox_trim(region)
        out = Image.fromarray(trimmed.astype(np.uint8))
        dst_dir = os.path.join(REF, dev, 'parts')
        os.makedirs(dst_dir, exist_ok=True)
        dst = os.path.join(dst_dir, f'{part_id}.png')
        out.save(dst)
        results.append((dev, part_id, f'{im.width}x{im.height}', f'nt={nt}', f'{out.width}x{out.height}'))
        print(f'{dev:8s} {part_id:9s} <- {ts} card {im.width}x{im.height} name_top={nt:3d} -> photo {out.width}x{out.height}')

# verification contact sheets of the installed crops
from PIL import ImageDraw, ImageFont
try:
    font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 16)
except Exception:
    font = ImageFont.load_default()
for dev in MAP:
    files = sorted(os.listdir(os.path.join(REF, dev, 'parts')))
    TW = 220
    pad, lab = 10, 24
    thumbs = []
    for f in files:
        im = Image.open(os.path.join(REF, dev, 'parts', f)).convert('RGB')
        th = max(1, int(im.height * TW / im.width))
        thumbs.append((f, im.resize((TW, th))))
    cols = 4
    rows = (len(thumbs) + cols - 1) // cols
    cell = max(t[1].height for t in thumbs) + lab
    W, H = cols * (TW + pad) + pad, rows * (cell + pad) + pad
    sheet = Image.new('RGB', (W, H), (230, 235, 240))
    dr = ImageDraw.Draw(sheet)
    for i, (f, tim) in enumerate(thumbs):
        r_, c_ = divmod(i, cols)
        x, y = pad + c_ * (TW + pad), pad + r_ * (cell + pad)
        sheet.paste(tim, (x, y + lab))
        dr.text((x, y + 3), f, fill=(15, 23, 42), font=font)
    out = os.path.join(SHEETS, f'installed-{dev}.png')
    sheet.save(out)
    print('sheet:', out)
print('DONE')
