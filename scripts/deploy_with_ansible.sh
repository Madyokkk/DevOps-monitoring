#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ANSIBLE_DIR="${PROJECT_DIR}/infra/ansible"

if [[ ! -f "${ANSIBLE_DIR}/inventory.ini" ]]; then
  echo "inventory.ini not found. Create it from inventory.ini.example or run Terraform first."
  exit 1
fi

ansible-playbook -i "${ANSIBLE_DIR}/inventory.ini" "${ANSIBLE_DIR}/deploy.yml"
