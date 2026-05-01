#!/usr/bin/env sh
set -eu

CERT_DIR="/etc/nginx/ssl"
CERT_FILE="${CERT_DIR}/selfsigned.crt"
KEY_FILE="${CERT_DIR}/selfsigned.key"
DOMAIN="${DOMAIN_NAME:-localhost}"

mkdir -p "${CERT_DIR}"

if [ ! -s "${CERT_FILE}" ] || [ ! -s "${KEY_FILE}" ]; then
  openssl req -x509 -nodes -newkey rsa:4096 -days 365 \
    -keyout "${KEY_FILE}" \
    -out "${CERT_FILE}" \
    -subj "/CN=${DOMAIN}" \
    -addext "subjectAltName=DNS:${DOMAIN},DNS:localhost,IP:127.0.0.1"
fi

exec /docker-entrypoint.sh "$@"
