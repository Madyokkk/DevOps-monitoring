#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${PROJECT_DIR}/.env"

if [[ -f "${ENV_FILE}" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "${ENV_FILE}"
  set +a
fi

SSH_PORT="${SSH_PORT:-22}"
POSTGRES_PORT="${POSTGRES_PORT:-5432}"
DB_ALLOWED_CIDR="${DB_ALLOWED_CIDR:-127.0.0.1/32}"

sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow "${SSH_PORT}/tcp"
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

if [[ "${DB_ALLOWED_CIDR}" != "none" ]]; then
  sudo ufw allow from "${DB_ALLOWED_CIDR}" to any port "${POSTGRES_PORT}" proto tcp
fi

sudo ufw --force enable
sudo ufw status verbose
