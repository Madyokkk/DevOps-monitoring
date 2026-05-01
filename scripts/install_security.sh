#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if ! command -v fail2ban-client >/dev/null 2>&1; then
  sudo apt-get update
  sudo apt-get install -y fail2ban
fi

sudo mkdir -p /opt/project-root/scripts
sudo mkdir -p /etc/fail2ban/jail.d /etc/fail2ban/action.d

if [[ -f "${PROJECT_DIR}/.env" ]]; then
  sudo install -m 0600 "${PROJECT_DIR}/.env" /opt/project-root/.env
fi

sudo install -m 0644 "${PROJECT_DIR}/security/sshd_hardening.conf" /etc/ssh/sshd_config.d/99-rk-hardening.conf
sudo install -m 0644 "${PROJECT_DIR}/security/fail2ban-jail.local" /etc/fail2ban/jail.d/rk.local
sudo install -m 0644 "${PROJECT_DIR}/security/rk-telegram.conf" /etc/fail2ban/action.d/rk-telegram.conf
sudo install -m 0755 "${PROJECT_DIR}/scripts/fail2ban_telegram_alert.sh" /opt/project-root/scripts/fail2ban_telegram_alert.sh

sudo sshd -t
sudo systemctl reload ssh
sudo systemctl enable --now fail2ban
sudo systemctl restart fail2ban
sudo fail2ban-client status sshd
