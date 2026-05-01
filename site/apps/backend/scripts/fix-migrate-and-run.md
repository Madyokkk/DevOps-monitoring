# Миграция қатесін түзету және backend іске қосу

## 1. Миграция қатесін түзету (бір рет)

Терминалда жоба түбінде:

```bash
cd apps/backend
```

Егер сәтсіз миграция аты базада қалған болса (мысалы `20260304050252_init`), оны «rolled back» деп белгілеңіз:

```bash
npx prisma migrate resolve --rolled-back 20260304050252_init
```

(Егер басқа атау шықса — сол атауды қойыңыз.)

Содан кейін:

```bash
npx prisma generate
```

Енді `migrate dev` қайта іске қоспаңыз — база дайын. Келесі рет тек төмендегі «Backend іске қосу» бөлімін қолданыңыз.

---

## 2. Backend әрдайым іске қосу

### Алғашқы орнату (бір рет)

```bash
cd apps/backend
cp .env.example .env
# .env ішінде DATABASE_URL порты 5435 болуы керек (Docker postgres)
npm install
```

### PostgreSQL іске қосылған болуы керек

Жоба түбінде (RK_PROEKT_BD_DOCKER):

```bash
docker compose up -d
```

### Миграция және seed (база бос болса)

```bash
cd apps/backend
npx prisma migrate deploy
npm run db:seed
```

### Backend серверін іске қосу

```bash
cd apps/backend
npm run start:dev
```

Backend: http://localhost:3001  
Swagger: http://localhost:3001/api/docs

---

## Қысқаша: әр күні іске қосу

1. `docker compose up -d` (жоба түбінде)
2. `cd apps/backend && npm run start:dev`
