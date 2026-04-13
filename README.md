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

## Deploy Vercel (evitar versão antiga)

Consulte o guia: [`VERCEL_DEPLOY.md`](./VERCEL_DEPLOY.md).

---

## Endpoints já implementados (P1)

### Auth
- `POST /api/auth/register` cria conta e retorna par de tokens
- `POST /api/auth/login` autentica usuário
- `POST /api/auth/refresh` renova access token usando refresh token
- Rotas de negócio usam `Authorization: Bearer <accessToken>`

### Tickets
- `POST /api/tickets` cria solicitação
- `GET /api/tickets` lista solicitações (filtro opcional `status`)
- `GET /api/marketplace/tickets` lista solicitações abertas para marketplace

### Proposals (orçamentos)
- `POST /api/tickets/:ticketId/proposals` cria proposta (somente técnico/empresa)
- `GET /api/tickets/:ticketId/proposals` lista propostas da solicitação
- `POST /api/proposals/:proposalId/accept` aceita proposta (somente cliente dono)
- `POST /api/proposals/:proposalId/reject` rejeita proposta (somente cliente dono)

### Chat por solicitação (P1.1)
- `GET /api/tickets/:ticketId/messages` lista mensagens da solicitação
- `POST /api/tickets/:ticketId/messages` envia mensagem (cliente dono ou prestador atribuído)

---

## Próximos passos da migração

1. Adicionar notificações em tempo real com WebSocket.
2. Adicionar testes (unit, integration e e2e).
3. Configurar deploy contínuo (Vercel + serviço cloud para API/DB/Redis).
