# RK Proekt - Серверлік инфрақұрылым және Web жүйе

Бұл жоба `РК СЕРВЕР.docx` талаптарына сәйкес дайындалған оқу-жоба стенді:
- Full-stack web: **Next.js + NestJS + PostgreSQL**
- Контейнерлеу: **Docker Compose**
- Қауіпсіздік: **Nginx reverse proxy, SSL, firewall, backup, fail2ban**
- Мониторинг: **Prometheus + Grafana + Alertmanager + exporters**
- CI: **Jenkins + GitHub Actions**
- AI: **n8n + OpenAI webhook assistant**
- Infra automation: **Terraform + Ansible + Bash**

## ОС талабы

РК шартына сай серверлік орта ретінде тек:
- **Linux/Unix**
- **Windows Server**

Осы репозиторийде негізгі нұсқа ретінде **Linux/Unix (Ubuntu Server 22.04/24.04 LTS)** қарастырылған.

## 1. Жоба құрылымы

- `apps/backend` - NestJS API + Prisma
- `apps/web` - Next.js frontend
- `docker` - nginx, monitoring, security, n8n конфигтері
- `scripts` - backup/restore/firewall/deploy утилиталары
- `infra` - Terraform/Ansible инфрақұрылым шаблондары
- `docs/RK-CHECKLIST.md` - талаптар картасы

## 2. Жылдам іске қосу (локал)

### 2.1 Алғышарттар
- Docker + Docker Compose
- Node.js 20+

### 2.2 Environment

```bash
cp .env.example .env
cp apps/backend/.env.example apps/backend/.env
cp apps/web/.env.example apps/web/.env.local
```

Қажет мәндерді `.env` ішінде жаңартыңыз (`POSTGRES_PASSWORD`, `JWT_SECRET`, т.б.).

### 2.3 Іске қосу (негізгі стек)

```bash
docker compose up -d --build
```

Сервистер:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001`
- Swagger: `http://localhost:3001/api/docs`
- Nginx gateway: `http://localhost`

### 2.4 Seed деректер

Бірінші рет үлкен тақырыптық деректерді толтыру үшін:

```bash
RUN_SEED=true docker compose up -d --build backend
```

## 3. Профильдер арқылы кеңейтілген стек

### 3.1 Tools (pgAdmin)
```bash
docker compose --profile tools up -d
```

### 3.2 AI (n8n)
```bash
docker compose --profile ai up -d
```

N8N URL: `http://localhost:5678`

### 3.3 Monitoring
```bash
docker compose --profile monitoring up -d
```

- Prometheus: `http://localhost:9090`
- Grafana: `http://localhost:3002`
- Alertmanager: `http://localhost:9093`

### 3.4 Jenkins
```bash
docker compose --profile ci up -d
```

Jenkins: `http://localhost:8080`

## 4. Security және операциялар

- Firewall setup: `scripts/setup_firewall.sh`
- Backup: `scripts/backup_postgres.sh`
- Restore: `scripts/restore_postgres.sh <backup.dump.gz>`
- Secure delete: `scripts/secure_delete.sh <file>`
- Fail2Ban конфигі: `docker/security/jail.local`
- SSH hardening үлгісі: `docker/security/sshd_hardening.conf`

## 5. AI assistant интеграциясы

Backend endpoint:

```http
POST /api/ai/assistant
Content-Type: application/json

{ "message": "Сәлем, бүгінгі акциялар қандай?" }
```

- Егер `N8N_WEBHOOK_URL` бапталған болса, сұрау n8n webhook-ке жіберіледі.
- n8n workflow үлгісі: `docker/n8n/rk-assistant-workflow.json`

Frontend-те AI беті:
- `http://localhost:3000/assistant`

## 6. CI/CD

- GitHub Actions: `.github/workflows/ci.yml`
- Jenkins pipeline: `Jenkinsfile`

Екеуі де build және docker compose конфигурациясын тексереді.

## 7. Terraform + Ansible + Bash

1. Terraform арқылы inventory генерациясы:
```bash
cd infra/terraform
cp terraform.tfvars.example terraform.tfvars
terraform init
terraform apply
```

2. Ansible deploy:
```bash
./scripts/deploy_with_ansible.sh
```

## 8. Production

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

TLS үшін сертификаттар:
- `docker/certs/fullchain.pem`
- `docker/certs/privkey.pem`

Демо үшін self-signed:
```bash
./scripts/generate_self_signed_cert.sh
```

---

Толық талап картасы: `docs/RK-CHECKLIST.md`
