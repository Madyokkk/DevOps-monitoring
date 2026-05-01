#!/usr/bin/env bash
set -euo pipefail

IP="${1:-unknown}"
JAIL="${2:-unknown}"
PROJECT_ENV="${PROJECT_ENV:-/opt/project-root/.env}"

if [[ ! -f "${PROJECT_ENV}" ]]; then
  PROJECT_ENV="/home/ubuntu/project-root/.env"
fi

set -a
# shellcheck disable=SC1090
source "${PROJECT_ENV}"
set +a

MESSAGE="⚠️ ОБНАРУЖЕНЫ ПОДОЗРИТЕЛЬНЫЕ ПОВТОРНЫЕ ВХОДЫ В АККАУНТ

IP заблокирован на 5 секунд.
Jail: ${JAIL}
IP: ${IP}
Время: $(date '+%Y-%m-%d %H:%M:%S %Z')"

curl -fsS -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
  -d "chat_id=${TELEGRAM_CHAT_ID}" \
  --data-urlencode "text=${MESSAGE}" >/dev/null
