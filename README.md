# Buscador Técnico — Nova Arquitetura (Next.js + NestJS)

Este repositório foi iniciado como Flask + React, mas está migrando para a stack solicitada:

## Frontend
- Next.js (App Router)
- React + TypeScript
- Tailwind CSS + Radix UI
- Zustand + React Query

## Backend
- NestJS
- PostgreSQL
- Prisma ORM
- Redis

## Infra
- Docker Compose para ambiente local
- CI/CD (GitHub Actions)
- Deploy target: Vercel (web) + Cloud (api/db/redis)

---

## Estrutura

```bash
apps/
  web/   # Next.js App Router
  api/   # NestJS + Prisma
```

---

## Rodar local com Docker

```bash
docker compose up --build
```

- Web: http://localhost:3000
- API: http://localhost:4000/api/health

---

## Rodar local sem Docker

```bash
pnpm install
pnpm --filter @buscador/api prisma:generate
pnpm dev
```

---

## Endpoints já implementados (P1)

### Tickets
- `POST /api/tickets` cria solicitação
- `GET /api/tickets` lista solicitações (filtro opcional `status`)
- `GET /api/marketplace/tickets` lista solicitações abertas para marketplace

### Proposals (orçamentos)
- `POST /api/tickets/:ticketId/proposals` cria proposta (somente técnico/empresa)
- `GET /api/tickets/:ticketId/proposals` lista propostas da solicitação
- `POST /api/proposals/:proposalId/accept` aceita proposta (somente cliente dono)
- `POST /api/proposals/:proposalId/reject` rejeita proposta (somente cliente dono)

---

## Próximos passos da migração

1. Implementar autenticação JWT + refresh token + RBAC no NestJS.
2. Migrar telas do produto para App Router com consumo real da API.
3. Adicionar chat por ticket e notificações em tempo real.
4. Adicionar testes (unit, integration e e2e).
5. Configurar deploy contínuo (Vercel + serviço cloud para API/DB/Redis).
