#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_DIR="${PROJECT_DIR}/backups"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
ENV_FILE="${PROJECT_DIR}/.env"

if [[ -f "${ENV_FILE}" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "${ENV_FILE}"
  set +a
fi

mkdir -p "${BACKUP_DIR}"

POSTGRES_USER="${POSTGRES_USER:-rk_user}"
POSTGRES_DB="${POSTGRES_DB:-rk_app}"
POSTGRES_CONTAINER="${POSTGRES_CONTAINER:-rk-db}"
OUT_FILE="${BACKUP_DIR}/${POSTGRES_DB}_${TIMESTAMP}.dump"

docker exec -t "${POSTGRES_CONTAINER}" pg_dump -U "${POSTGRES_USER}" -Fc "${POSTGRES_DB}" > "${OUT_FILE}"
gzip -f "${OUT_FILE}"

echo "Backup created: ${OUT_FILE}.gz"
