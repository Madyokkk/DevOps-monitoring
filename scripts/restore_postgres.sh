#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 <backup_file.dump.gz|backup_file.dump>"
  exit 1
fi

BACKUP_FILE="$1"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${PROJECT_DIR}/.env"

if [[ -f "${ENV_FILE}" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "${ENV_FILE}"
  set +a
fi

POSTGRES_USER="${POSTGRES_USER:-rk_user}"
POSTGRES_DB="${POSTGRES_DB:-rk_app}"
POSTGRES_CONTAINER="${POSTGRES_CONTAINER:-rk-db}"

if [[ ! -f "${BACKUP_FILE}" ]]; then
  echo "Backup file not found: ${BACKUP_FILE}"
  exit 1
fi

TMP_FILE="${BACKUP_FILE}"
if [[ "${BACKUP_FILE}" == *.gz ]]; then
  TMP_FILE="$(mktemp /tmp/rk_restore_XXXXXX.dump)"
  gunzip -c "${BACKUP_FILE}" > "${TMP_FILE}"
fi

docker exec -i "${POSTGRES_CONTAINER}" pg_restore -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" --clean --if-exists < "${TMP_FILE}"

if [[ "${BACKUP_FILE}" == *.gz ]]; then
  rm -f "${TMP_FILE}"
fi

echo "Restore completed from: ${BACKUP_FILE}"
