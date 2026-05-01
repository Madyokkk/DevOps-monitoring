# РК СЕРВЕР талаптары бойынша чеклист

Бұл файл `/Users/ibra/Downloads/РК СЕРВЕР.docx` құжатындағы талаптарға сәйкес жобаның дайындық күйін көрсетеді.

## 1) ОС таңдау
- РК талабы бойынша серверлік ОС: **Linux/Unix** немесе **Windows Server**.
- Ұсынылған нұсқа: Ubuntu Server 22.04/24.04 LTS (Linux/Unix бағыты).

## 2) Қауіпсіздік
- SSH hardening үлгісі: `docker/security/sshd_hardening.conf`
- SSL/TLS reverse proxy: `docker/nginx.prod.conf`
- Nginx reverse proxy: `docker/nginx.conf`
- Firewall скрипті: `scripts/setup_firewall.sh`
- Backup/restore: `scripts/backup_postgres.sh`, `scripts/restore_postgres.sh`
- Fail2Ban конфигі: `docker/security/jail.local`
- Қауіпсіз жою: `scripts/secure_delete.sh`

## 3) БД (PostgreSQL)
- БД контейнері: `docker-compose.yml` (`postgres`)
- Қашықтан қосылу: `${POSTGRES_PORT}` порты арқылы
- Логин/пароль: `.env` (`POSTGRES_USER`, `POSTGRES_PASSWORD`)
- Тақырыптық деректер: Prisma seed (`apps/backend/prisma/seed.ts`)

## 4) Web-site/app + DB
- Backend: NestJS + Prisma + PostgreSQL
- Frontend: Next.js
- Байланыс: `NEXT_PUBLIC_API_URL` және backend API (`/api/*`)

## 5) Контейнерлер
- Docker Compose негізгі стек: `docker-compose.yml`
- Production стек: `docker-compose.prod.yml`

## 6) Git / GitHub
- Репозиторий: GitHub-та (`kiraw127/rk_proekt`)
- CI workflow: `.github/workflows/ci.yml`

## 7) Мониторинг + Alert
- Node Exporter, Postgres Exporter, Prometheus, Alertmanager, Grafana
- Конфигтер: `docker/monitoring/**`
- Telegram alert: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`
- Jenkins: `jenkins` сервисі + `Jenkinsfile`

## 8) ЖИ қолдану (N8N)
- `n8n` сервисі compose-ке қосылған (`--profile ai`)
- Backend AI endpoint: `POST /api/ai/assistant`
- N8N workflow үлгісі: `docker/n8n/rk-assistant-workflow.json`

## 9) Terraform / Ansible / Bash
- Terraform: `infra/terraform/*`
- Ansible: `infra/ansible/deploy.yml`
- Bash scripts: `scripts/*.sh`
