#!/bin/bash
# Build a portable ZIP of the whole project for laptop transfer.
set -e
cd /home/z/my-project

STAMP=$(TZ=Asia/Tehran date +%Y-%m-%d)
OUT="download/CircuitQuest-FINAL-${STAMP}.zip"

# 1) Temporarily point .env to a portable relative path (restore afterwards)
cp .env .env.sandbox-backup
printf 'DATABASE_URL=file:./db/custom.db\n' > .env

# 2) Create the zip (excluding regenerable + sandbox-internal artifacts)
rm -f "$OUT"
zip -r -q "$OUT" . \
  -x "node_modules/*" \
  -x ".next/*" \
  -x ".git/*" \
  -x "skills/*" \
  -x ".zscripts/*" \
  -x "tool-results/*" \
  -x "download/*" \
  -x ".env.sandbox-backup" \
  -x "dev.log" \
  -x "server.log" \
  -x "*.tsbuildinfo" \
  -x "*.zip"

# 3) Restore the sandbox .env
mv .env.sandbox-backup .env

echo "=== DONE: $OUT ==="
du -h "$OUT"
unzip -t "$OUT" > /dev/null && echo "ZIP integrity: OK"
echo "=== key entries check ==="
unzip -l "$OUT" | grep -E "(AGENTS.md|ARCHITECTURE.md|worklog.md|\.env$|\.env\.example|custom\.db|bun\.lock|package\.json|جزوه|دنیای|ChatGPT)" | head -15
echo "=== total files ==="
unzip -l "$OUT" | tail -1
