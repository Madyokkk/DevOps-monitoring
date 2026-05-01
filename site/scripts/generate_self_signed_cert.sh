#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CERT_DIR="${PROJECT_DIR}/docker/certs"
mkdir -p "${CERT_DIR}"

openssl req -x509 -nodes -newkey rsa:2048 -days 365 \
  -keyout "${CERT_DIR}/privkey.pem" \
  -out "${CERT_DIR}/fullchain.pem" \
  -subj "/CN=localhost"

echo "Self-signed certs created in ${CERT_DIR}"
