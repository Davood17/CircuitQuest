#!/usr/bin/env python3
"""Dead-file scanner: find src files never imported by any other src file."""
import os, re, subprocess

SRC = "/home/z/my-project/src"
# gather source files (skip tests dir — entry points by definition)
targets = []
for root, dirs, files in os.walk(SRC):
    dirs[:] = [d for d in dirs if d != "tests"]
    for f in files:
        if f.endswith((".ts", ".tsx")):
            targets.append(os.path.join(root, f))

# pre-grep once: all import statements across src (incl. tests)
all_imports = subprocess.run(
    ["rg", "-o", r"(from\s+[\"'][^\"']+[\"']|import\s*\(\s*[\"'][^\"']+[\"']\s*\)|require\s*\(\s*[\"'][^\"']+[\"']\s*\))",
     "-N", "--no-filename", SRC],
    capture_output=True, text=True).stdout

def module_candidates(path):
    """possible import specifiers that resolve to this file"""
    rel = os.path.relpath(path, SRC).replace("\\", "/")
    base = rel.rsplit(".", 1)[0]
    cands = {f"@/{base}", f"./{base}", f"../{base}", f"./{rel}", f"@/{rel}"}
    cands.add(f"@/{base}.js")  # some setups use .js ext in imports
    return cands

dead = []
for t in targets:
    rel = os.path.relpath(t, SRC)
    if rel in ("app/layout.tsx", "app/page.tsx"):  # framework entries
        continue
    # app router pages/layouts/routes are referenced by the framework itself
    if "/app/" in t:
        continue
    hits = 0
    # 1) path-based imports
    for c in module_candidates(t):
        if c in all_imports:
            hits += 1
            break
    # 2) export-name based (catch aliased paths): exported symbol referenced elsewhere
    if hits == 0:
        with open(t, encoding="utf-8", errors="ignore") as fh:
            content = fh.read()
        names = re.findall(r"export\s+(?:default\s+)?(?:async\s+)?(?:function|const|class|let|var)\s+([A-Za-z0-9_]+)", content)
        names += re.findall(r"export\s+(?:type|interface)\s+([A-Za-z0-9_]+)", content)
        names = [n for n in set(names) if len(n) > 3]
        for n in names:
            cnt = subprocess.run(["rg", "-c", rf"\b{n}\b", SRC, "--glob", f"!{rel}"],
                                 capture_output=True, text=True).stdout.strip()
            if cnt:
                hits += 1
                break
    if hits == 0:
        dead.append(rel)

print("== files with NO incoming references ==")
for d in sorted(dead):
    print("  ", d)
print(f"total scanned: {len(targets)}")
