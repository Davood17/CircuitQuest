#!/usr/bin/env python3
"""Prune lessons that move/merge per the user's new curriculum:
- level1: remove 'l1-6' (push buttons — screens/quiz merge into l1-5) and
  'l1-8' (multimeter — moves to level2 as l2-1).
- level2: remove 'l2-7' (Power in circuits — dropped per user curriculum).
Run BEFORE the rename MultiEdits so id searches stay unambiguous."""
from pathlib import Path


def remove_lesson(path: Path, lid: str, must_contain: str) -> None:
    t = path.read_text(encoding='utf-8')
    i = t.index(f"    id: '{lid}',")
    assert must_contain in t[i:i + 600], f'{lid}: unexpected block content'
    start = t.rfind('\n  {', 0, i) + 1          # lesson opener line '  {'
    end = t.index('\n  },', i) + len('\n  },')  # lesson closer line '  },'
    t = t[:start] + t[end:]
    while '\n\n\n' in t:
        t = t.replace('\n\n\n', '\n\n')
    path.write_text(t, encoding='utf-8')
    print(f'{path.name}: removed {lid}')


base = Path('/home/z/my-project/src/content/levels')
remove_lesson(base / 'level1.ts', 'l1-6', 'Push buttons')
remove_lesson(base / 'level1.ts', 'l1-8', 'Meet the multimeter')
remove_lesson(base / 'level2.ts', 'l2-7', 'Power in circuits')
