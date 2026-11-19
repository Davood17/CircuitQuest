#!/usr/bin/env python3
"""Generate PWA icons for CircuitQuest with PIL (no SVG toolchain needed).
Design: teal rounded square, white circuit loop, yellow LED, white bolt.
- regular: rounded teal square with transparent corners (purpose: any)
- maskable: FULL-BLEED opaque teal square, artwork inside the 80% safe zone
Drawn at 2048px with LANCZOS downscale for crisp edges."""
from PIL import Image, ImageDraw
import os

OUT = "/home/z/my-project/public/icons"
os.makedirs(OUT, exist_ok=True)

TEAL = (13, 148, 136, 255)        # #0d9488
CREAM = (255, 253, 248, 255)
WHITE = (255, 255, 255, 255)
YELLOW = (250, 204, 21, 255)      # #facc15

S = 2048


def bolt_points(cx, cy, w, h):
    l = cx - w / 2
    r = cx + w / 2
    t = cy - h / 2
    b = cy + h / 2
    k = w * 0.62
    return [
        (cx - k / 2, t),
        (r, t + h * 0.08),
        (cx + w * 0.10, cy - h * 0.12),
        (cx + k / 2, cy - h * 0.10),
        (l, b),
        (l + w * 0.02, cy + h * 0.20),
    ]


def draw_art(d, cx, cy, sq, ring_in, ring_w):
    """the circuit-loop artwork; sq = artwork bounding size"""
    # white circuit loop ring (rounded rect outline)
    d.rounded_rectangle(
        [cx - ring_in, cy - ring_in, cx + ring_in, cy + ring_in],
        radius=int(ring_in * 0.55),
        outline=WHITE, width=ring_w,
    )
    # electron dots centered on the ring sides
    er = int(sq * 0.028)
    for ex in (cx - ring_in - ring_w // 2, cx + ring_in + ring_w // 2):
        d.ellipse([ex - er, cy - er, ex + er, cy + er], fill=CREAM)
    # yellow LED lamp sitting on the top of the ring
    led_r = int(sq * 0.13)
    led_cy = cy - ring_in - ring_w // 2
    d.ellipse([cx - led_r, led_cy - led_r, cx + led_r, led_cy + led_r], fill=YELLOW, outline=WHITE, width=int(sq * 0.028))
    # small glow ticks above the lamp
    rw = int(sq * 0.02)
    for dx in (-1, 1):
        x = cx + dx * int(sq * 0.07)
        d.line([x, led_cy - led_r - int(sq * 0.05), x, led_cy - led_r - int(sq * 0.015)], fill=YELLOW, width=rw)
    # white lightning bolt in the center of the loop
    d.polygon(bolt_points(cx, cy + int(sq * 0.01), int(sq * 0.16), int(sq * 0.34)), fill=WHITE)


def make_regular() -> Image.Image:
    """rounded teal square, transparent corners, art fills the square"""
    img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([0, 0, S - 1, S - 1], radius=int(S * 0.22), fill=TEAL)
    sq = S
    ring_in = int(sq * 0.30)
    ring_w = int(sq * 0.075)
    draw_art(d, S // 2, S // 2, sq, ring_in, ring_w)
    return img


def make_maskable() -> Image.Image:
    """full-bleed opaque teal square; artwork inside the 80% safe zone"""
    img = Image.new("RGBA", (S, S), TEAL)
    d = ImageDraw.Draw(img)
    sq = int(S * 0.80)          # artwork bounding box = safe zone
    ring_in = int(sq * 0.30)
    ring_w = int(sq * 0.075)
    draw_art(d, S // 2, S // 2, sq, ring_in, ring_w)
    return img


def save(img, name, size):
    img.resize((size, size), Image.LANCZOS).save(f"{OUT}/{name}", "PNG", optimize=True)
    print(f"{name}: {size}x{size}")


regular = make_regular()
save(regular, "icon-192.png", 192)
save(regular, "icon-512.png", 512)
save(regular, "apple-touch-icon.png", 180)
save(regular, "favicon-32.png", 32)

maskable = make_maskable()
save(maskable, "maskable-192.png", 192)
save(maskable, "maskable-512.png", 512)

# verification: maskable must be fully opaque, regular must contain teal+white+yellow
for name, need_opaque in [("icon-512.png", False), ("maskable-512.png", True), ("maskable-192.png", True)]:
    px = list(Image.open(f"{OUT}/{name}").convert("RGBA").getdata())
    n = len(px)
    alpha0 = sum(1 for p in px if p[3] < 250)
    teal = sum(1 for p in px if abs(p[0]-13) < 30 and abs(p[1]-148) < 40 and abs(p[2]-136) < 40)
    white = sum(1 for p in px if p[0] > 240 and p[1] > 240 and p[2] > 240)
    yellow = sum(1 for p in px if p[0] > 220 and p[1] > 170 and p[2] < 90)
    status = "OK" if (alpha0 == 0 if need_opaque else alpha0 > 0) and teal > 0 and white > 0 and yellow > 0 else "FAIL"
    print(f"verify {name}: opaque={100-alpha0/n*100:.1f}% teal={teal/n:.1%} white={white/n:.1%} yellow={yellow/n:.1%} -> {status}")
