#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 <file_path>"
  exit 1
fi

TARGET="$1"
if [[ ! -f "${TARGET}" ]]; then
  echo "File not found: ${TARGET}"
  exit 1
fi

if command -v shred >/dev/null 2>&1; then
  shred -u -n 3 "${TARGET}"
else
  rm -P "${TARGET}" || rm -f "${TARGET}"
fi

echo "Secure delete completed: ${TARGET}"
