#!/usr/bin/env bash
set -e
echo "Resetting Dear Diary demo (Cognee forget + remember seed)..."
curl -X POST http://127.0.0.1:8787/seed/load \
  -H "Content-Type: application/json" \
  -d '{"profile":"maya-30d"}'
echo ""
echo "Done. Loaded maya-30d into Cognee graph."
