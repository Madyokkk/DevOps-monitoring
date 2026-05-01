#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 <backup_file.dump.gz|backup_file.dump>"
  exit 1
fi

BACKUP_FILE="$1"
if [[ ! -f "${BACKUP_FILE}" ]]; then
  echo "Backup file not found: ${BACKUP_FILE}"
  exit 1
fi

POSTGRES_USER="${POSTGRES_USER:-postgres}"
POSTGRES_DB="${POSTGRES_DB:-gulder_db}"
POSTGRES_CONTAINER="${POSTGRES_CONTAINER:-gulder_db}"

TMP_FILE="${BACKUP_FILE}"
if [[ "${BACKUP_FILE}" == *.gz ]]; then
  TMP_FILE="$(mktemp /tmp/gulder_restore_XXXXXX.dump)"
  gunzip -c "${BACKUP_FILE}" > "${TMP_FILE}"
fi

docker exec -i "${POSTGRES_CONTAINER}" pg_restore -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" --clean --if-exists < "${TMP_FILE}"

if [[ "${BACKUP_FILE}" == *.gz ]]; then
  rm -f "${TMP_FILE}"
fi

echo "Restore completed from: ${BACKUP_FILE}"
