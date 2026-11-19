#!/usr/bin/env python3
"""Reorder LEVEL0 lessons in src/content/levels/level0.ts per the user's new curriculum.

New order (14 lessons):
  1. electronics          (old 1,  l0-1)
  2. electricity          (old 2,  l0-2)
  3. safety               (old 9,  l0-9   -> new l0-3)
  4. a circuit            (old 8,  l0-8   -> new l0-4)
  5. open vs closed       (old 10, l0-10  -> new l0-5)
  6. conductors           (old 11, l0-11  -> new l0-6)
  7. voltage              (old 13, l0-13  -> new l0-7)
  8. current              (old 12, l0-12  -> new l0-8)
  9. resistance (merged)  (old 6,  l0-6   -> new l0-9)
 10. TEMP old-14 resistance concept (harvest via Edit, then delete)
 11. battery              (old 3,  l0-3   -> new l0-10)
 12. wire                 (old 4,  l0-4   -> new l0-11)
 13. LED                  (old 5,  l0-5   -> new l0-12)
 14. switch               (old 7,  l0-7   -> new l0-13)
 15. symbols              (old 16, l0-16  -> new l0-14)
DROPPED: old 15 (power)
"""
import re
from pathlib import Path

SRC = Path('/home/z/my-project/src/content/levels/level0.ts')
text = SRC.read_text(encoding='utf-8')

# split point of the lessons array
arr_start = text.index('export const LEVEL0_LESSONS: Lesson[] = [')
header, rest = text[:arr_start], text[arr_start:]

# block-start comment lines: "  // ---- N. name"
marker_re = re.compile(r'^  // -{6,} (\d+)\. (.+)$', re.M)
starts = [(m.start(), m.end(), int(m.group(1)), m.group(2).strip()) for m in marker_re.finditer(rest)]
assert [s[2] for s in starts] == list(range(1, 17)), [s[2] for s in starts]

# array closes with "\n];" right after the last block's lesson object
array_close = rest.index('\n];', starts[-1][0])
body, footer = rest[:array_close], rest[array_close:]

# extract the prologue of the array (before first marker) — nothing between "=[\n" and first marker
prologue_end = starts[0][0]
prologue = body[:prologue_end]
assert prologue.strip() == body[:prologue_end].strip()

blocks = {}
for i, (s, e, num, name) in enumerate(starts):
    end = starts[i + 1][0] if i + 1 < len(starts) else len(body)
    blocks[num] = body[s:end]

NEW_ORDER = [1, 2, 9, 8, 10, 11, 13, 12, 6, 14, 3, 4, 5, 7, 16]  # 15 dropped; 14 is temp-for-merge
NAMES = {
    1: '1. electronics (robot script — do not touch)',
    2: '2. electricity',
    9: '3. safety (moved early per user curriculum)',
    8: '4. a circuit (moved early per user curriculum)',
    10: '5. open vs closed circuits',
    11: '6. conductors & insulators',
    13: '7. voltage',
    12: '8. current',
    6: '9. resistance — merged lesson (concept + part)',
    14: 'TEMP old resistance-concept: harvest screens/quiz into the lesson above, then DELETE this block',
    3: '10. battery',
    4: '11. wire',
    5: '12. LED',
    7: '13. switch',
    16: '14. circuit symbols',
}

def renumber(block: str, label: str) -> str:
    # replace the first marker line of the block with a fresh one of same dash style
    m = re.match(r'^  // (-{6,}) \d+\. .+$', block, re.M)
    assert m, block[:120]
    return f'  // {m.group(1)} {label}' + block[m.end():]

parts = [prologue]
for num in NEW_ORDER:
    parts.append(renumber(blocks[num], NAMES[num]))
new_body = ''.join(parts)

new_doc = '''/**
 * LEVEL 0 — "کاوشگر الکترونیک" (14 lessons, user-approved final order):
 * 1-2 concepts (electronics, electricity) → 3 safety → 4-5 the circuit
 * (loop idea + open/closed) → 6 conductors → 7-9 the V/I/R trio
 * → 10-13 the parts (battery, wire, LED, switch) → 14 circuit symbols.
 * Lesson ids match positions (l0-1 … l0-14); the old power lesson was removed.
 */
'''

# replace only the old doc comment in the header, keep imports intact
prefix_end = header.index('/**')
doc_end = header.index('*/\n') + len('*/\n')
out = header[:prefix_end] + new_doc + header[doc_end:] + new_body + footer

SRC.write_text(out, encoding='utf-8')
print('OK — new order:')
for m in re.finditer(r'^  // -{6,} (.+)$', out, re.M):
    print('  ', m.group(1))
