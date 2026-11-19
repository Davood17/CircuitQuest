#!/usr/bin/env python3
"""Post-process lesson-redesign docx for WPS/Office compat:
1) remove empty <w:pgNumType/> (cover section artifact)
2) patch footer PAGE fields with explicit format switches:
   - footer referenced by section 2 (TOC, Roman) -> PAGE \\* ROMAN \\* MERGEFORMAT
   - footer referenced by section 3 (body, Arabic) -> PAGE \\* arabic \\* MERGEFORMAT
Section->footer mapping is resolved via document.xml sectPr order + rels."""
import re
import sys
import zipfile
import shutil

DOCX = "/home/z/my-project/download/lesson-redesign-l0-1-fa.docx"
TMP = "/tmp/lesson-docx-patch"

shutil.rmtree(TMP, ignore_errors=True)
with zipfile.ZipFile(DOCX) as z:
    z.extractall(TMP)

doc_path = f"{TMP}/word/document.xml"
with open(doc_path, encoding="utf-8") as f:
    doc = f.read()

# 1) strip empty pgNumType
doc_new, n = re.subn(r"<w:pgNumType/>", "", doc)
print(f"removed {n} empty pgNumType")
with open(doc_path, "w", encoding="utf-8") as f:
    f.write(doc_new)

# 2) resolve section -> footer rIds (in sectPr order)
sectprs = re.findall(r"<w:sectPr.*?</w:sectPr>|<w:sectPr[^>]*/>", doc_new, flags=re.S)
print(f"sections found: {len(sectprs)}")
sect_footers = []
for sp in sectprs:
    ids = re.findall(r'<w:footerReference w:type="default" r:id="(rId\d+)"', sp)
    fmt = re.search(r'<w:pgNumType[^>]*w:fmt="([^"]+)"', sp)
    sect_footers.append((ids, fmt.group(1) if fmt else None))
    print("  sect footers:", ids, "fmt:", fmt.group(1) if fmt else None)

with open(f"{TMP}/word/_rels/document.xml.rels", encoding="utf-8") as f:
    rels = f.read()
rid_to_target = dict(re.findall(r'Id="(rId\d+)"[^>]*Target="([^"]+)"', rels))

for ids, fmt in sect_footers:
    if not ids or not fmt:
        continue
    switch = "ROMAN" if "Roman" in fmt or "roman" in fmt.lower() else "arabic"
    for rid in ids:
        target = rid_to_target.get(rid)
        if not target or "footer" not in target:
            continue
        fp = f"{TMP}/word/{target}"
        with open(fp, encoding="utf-8") as f:
            fx = f.read()
        fx2, n2 = re.subn(
            r"(<w:instrText[^>]*>)\s*PAGE\s*(</w:instrText>)",
            rf"\1 PAGE \\* {switch} \\* MERGEFORMAT \2",
            fx,
        )
        if n2:
            with open(fp, "w", encoding="utf-8") as f:
                f.write(fx2)
            print(f"patched {target} -> {switch} ({n2} field)")

# repack
out_tmp = "/tmp/lesson-docx-patched.docx"
import os
if os.path.exists(out_tmp):
    os.remove(out_tmp)
with zipfile.ZipFile(out_tmp, "w", zipfile.ZIP_DEFLATED) as z:
    for root, _, files in os.walk(TMP):
        for name in files:
            full = os.path.join(root, name)
            rel = os.path.relpath(full, TMP)
            z.write(full, rel)
shutil.copyfile(out_tmp, DOCX)
print("patched docx written back:", DOCX)
