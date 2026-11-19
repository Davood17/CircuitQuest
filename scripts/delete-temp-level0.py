#!/usr/bin/env python3
"""Delete the TEMP resistance-concept block from level0.ts (its screens/quiz
were merged into the new l0-9 lesson)."""
from pathlib import Path

P = Path('/home/z/my-project/src/content/levels/level0.ts')
t = P.read_text(encoding='utf-8')

i = t.index('TEMP old resistance-concept')
start = t.rfind('\n', 0, i) + 1          # beginning of the marker line
j = t.index('10. battery')                # next block's marker text
end = t.rfind('\n', 0, j) + 1             # beginning of that line

removed = t[start:end]
assert "id: 'l0-14'," in removed and 'Resistance: the squeeze' in removed and removed.count('{') == removed.count('}'), 'unexpected block shape'
t = t[:start] + t[end:]
P.write_text(t, encoding='utf-8')
print(f'removed {removed.count(chr(10))} lines')
