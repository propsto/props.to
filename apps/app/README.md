# Props.to Main App

## Getting Started

1. Install deps

```bash
pnpm install
```

2. Start the db

```bash
docker compose up -d
```

3. Update env and push the schema to the db

```bash
cp .env.example .env
pnpm prisma db push
```

4. Start the dev server

```bash
pnpm dev
```

5. Run the tests

```bash
pnpm test
```

---
