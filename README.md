# RK Production Infrastructure

Production-ready структура для веб-приложения RK: приложение, PostgreSQL, Nginx reverse proxy, Prometheus, Grafana, Alertmanager, Node Exporter, Telegram alert bot, security hardening, backup, Jenkins CI/CD, Terraform и Ansible.

## 1. Анализ

Исходный архив содержал две независимые части:

- `rk(old)/apps/backend` и `rk(old)/apps/web` - основное NestJS + Next.js приложение.
- `monitoring/` - частично готовый monitoring stack с Prometheus, Grafana, Alertmanager, security scripts и Telegram bot.

Проблемы исходной структуры:

- несколько compose-файлов с разными именами сервисов и портами;
- monitoring и app жили отдельно;
- Telegram bot использовал не те env-переменные (`BOT_TOKEN`, `CHAT_ID`);
- Prometheus rules не совпадали с требуемыми порогами CPU/RAM/Disk;
- Fail2Ban не отправлял Telegram-сообщение;
- Nginx не был единым reverse proxy для app и Grafana;
- Docker build app использовал `npm ci`, но app-level `package-lock.json` отсутствовал.

## 2. Исправления

- Собрана единая структура:

```text
project-root/
├── app/
├── monitoring/
├── docker/
├── nginx/
├── database/
├── scripts/
├── terraform/
├── bot/
├── .env
└── README.md
```

- Создан единый `docker-compose.yml` с сервисами `app`, `api`, `nginx`, `db`, `prometheus`, `grafana`, `node-exporter`, `postgres-exporter`, `alertmanager`, `telegram-bot`.
- Все runtime-сервисы используют `env_file: .env` и `restart: always`.
- Nginx проксирует:
  - `/` -> `app:3000`
  - `/api/` -> `api:3001`
  - `/grafana/` -> `grafana:3000`
- Nginx автоматически генерирует self-signed SSL сертификат при первом старте.
- Telegram bot реализует `POST /alert` и отправляет alert payload в Telegram через Bot API.
- Alertmanager отправляет webhook на `http://telegram-bot:5001/alert`.
- Prometheus alerts, сообщения на русском:
  - CPU > 80%
  - RAM > 80%
  - Disk > 90%
- Fail2Ban банит после 5 попыток и вызывает Telegram action с текстом:

```text
⚠️ ОБНАРУЖЕНЫ ПОДОЗРИТЕЛЬНЫЕ ВХОДЫ В АККАУНТ
```

- PostgreSQL доступен извне через `${POSTGRES_BIND_ADDRESS}:${POSTGRES_PORT}`, а firewall script ограничивает доступ по `${DB_ALLOWED_CIDR}`.
- Добавлены backup/restore scripts.
- Добавлены Jenkins pipeline, Terraform inventory generation и Ansible deploy.

## 3. Ключевые файлы

- `docker-compose.yml` - единый production compose.
- `nginx/nginx.conf` - reverse proxy и SSL.
- `docker/nginx/Dockerfile` и `docker/nginx/entrypoint.sh` - bootstrap self-signed SSL.
- `bot/bot.py` - Telegram webhook service.
- `monitoring/prometheus/prometheus.yml` - scrape targets.
- `monitoring/prometheus/rules/alerts.yml` - alert rules.
- `monitoring/alertmanager/alertmanager.yml` - routing в Telegram bot.
- `security/fail2ban-jail.local` - Fail2Ban maxretry=5.
- `security/rk-telegram.conf` - Fail2Ban action.
- `scripts/fail2ban_telegram_alert.sh` - отправка Fail2Ban alert в Telegram.
- `scripts/setup_firewall.sh` - UFW hardening.
- `scripts/install_security.sh` - установка SSH hardening и Fail2Ban.
- `scripts/backup_postgres.sh` - backup PostgreSQL.
- `Jenkinsfile` - build и deploy через Docker Compose.
- `terraform/main.tf` - генерация Ansible inventory.
- `ansible/deploy.yml` - установка Docker/security и запуск compose.

## 4. Запуск

Проверьте `.env` и замените production-секреты:

```bash
cd /home/ubuntu/project-root
nano .env
```

Запуск стека:

```bash
docker compose up -d --build
```

Проверка:

```bash
docker compose ps
curl -k https://localhost/healthz
curl -k https://localhost/api/health
```

Открыть:

- App: `https://localhost/`
- Grafana: `https://localhost/grafana/`
- Prometheus: `http://localhost:9090`
- Alertmanager: `http://localhost:9093`

Установка security hardening на сервере:

```bash
cd /home/ubuntu/project-root
sudo ./scripts/install_security.sh
sudo ./scripts/setup_firewall.sh
```

Backup БД:

```bash
cd /home/ubuntu/project-root
./scripts/backup_postgres.sh
```

Restore БД:

```bash
cd /home/ubuntu/project-root
./scripts/restore_postgres.sh backups/<file>.dump.gz
```

CI/CD через Jenkins:

```bash
docker compose up -d --build
# Jenkins job должен использовать Jenkinsfile из корня проекта.
```

IaC:

```bash
cd /home/ubuntu/project-root/terraform
terraform init
terraform apply -var="server_ip=<SERVER_IP>" -var="ssh_user=<SSH_USER>"

cd /home/ubuntu/project-root
ansible-playbook -i ansible/inventory.ini ansible/deploy.yml
```
