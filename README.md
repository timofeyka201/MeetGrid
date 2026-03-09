# MeetGrid — Планирование встреч

MVP веб-приложение для планирования встреч, похожее на When2Meet / LettuceMeet.

## Возможности

- ✅ Создание событий без регистрации
- ✅ Генерация уникальной ссылки для каждого события
- ✅ Сетка доступности с временными слотами
- ✅ Heatmap для визуализации доступности участников
- ✅ Автоматическое вычисление лучшего времени для встречи
- ✅ Адаптивный дизайн для мобильных устройств

## Технологии

- **Next.js 16** (App Router)
- **React 19**
- **TypeScript**
- **TailwindCSS**
- **Prisma ORM**
- **SQLite**

## Быстрый старт

```bash
# Установка зависимостей
npm install

# Инициализация базы данных
npx prisma migrate dev

# Запуск dev-сервера
npm run dev
```

Приложение будет доступно по адресу: http://localhost:3000

## Структура проекта

```
meetgrid/
├── prisma/
│   ├── schema.prisma          # Схема базы данных
│   └── dev.db                 # SQLite база данных
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── event/
│   │   │   │   ├── route.ts   # POST /api/event, GET /api/event?id=
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts # GET /api/event/[id]
│   │   │   └── availability/
│   │   │       └── route.ts   # POST /api/availability
│   │   ├── create/
│   │   │   └── page.tsx       # Страница создания события
│   │   ├── event/[id]/
│   │   │   └── page.tsx       # Страница события с сеткой
│   │   ├── layout.tsx         # Основной layout
│   │   └── page.tsx           # Главная страница
│   └── lib/
│       └── prisma.ts          # Prisma клиент
├── package.json
└── README.md
```

## API Endpoints

### POST /api/event
Создание нового события.

**Request body:**
```json
{
  "title": "Название события",
  "description": "Описание",
  "startDate": "2024-01-01",
  "endDate": "2024-01-07",
  "slotDuration": "30"
}
```

**Response:**
```json
{
  "id": "unique_event_id"
}
```

### GET /api/event?id={id}
Получение данных события.

**Response:**
```json
{
  "id": "...",
  "title": "...",
  "description": "...",
  "startDate": "...",
  "endDate": "...",
  "slotDuration": 30,
  "participants": [...]
}
```

### POST /api/availability
Сохранение доступности участника.

**Request body:**
```json
{
  "eventId": "...",
  "participantName": "Имя",
  "slots": ["2024-01-01T10:00:00.000Z", ...]
}
```

## База данных

### Схема

```prisma
model Event {
  id           String   @id @default(cuid())
  title        String
  description  String
  startDate    DateTime
  endDate      DateTime
  slotDuration Int
  createdAt    DateTime @default(now())
  participants Participant[]
}

model Participant {
  id           String         @id @default(cuid())
  eventId      String
  name         String
  createdAt    DateTime       @default(now())
  availability Availability[]
}

model Availability {
  id            String
  participantId String
  slotTime      DateTime
  status        String
}
```

## Развёртывание

### Vercel

1. Запушьте проект на GitHub
2. Импортируйте проект в Vercel
3. Vercel автоматически определит Next.js проект

**Важно:** Для production используйте PostgreSQL вместо SQLite:

```bash
# Обновите prisma.config.ts для production
datasource: {
  url: process.env.DATABASE_URL,
}
```

### Docker

```bash
docker build -t meetgrid .
docker run -p 3000:3000 meetgrid
```

## Использование

1. Откройте http://localhost:3000
2. Нажмите «Создать событие»
3. Заполните форму:
   - Название события
   - Описание (опционально)
   - Дата начала и окончания
   - Длительность слота (15, 30, 60 минут)
4. Скопируйте ссылку и отправьте участникам
5. Участники выбирают доступные слоты и сохраняют

## Heatmap

Цвета ячеек показывают количество участников:
- ⬜ Белый — 0 участников
- 🟩 Светло-зелёный — 1-2 участника
- 🟩 Зелёный — 3-4 участника
- 🟩 Тёмно-зелёный — 5+ участников

## Лицензия

MIT
