# 🔍 Análise Completa — TechFix Marketplace Técnico

> **Stack**: NestJS (API) + Next.js 14 (Web) + Prisma + PostgreSQL + Redis — Monorepo pnpm

---

## ✅ O que está PRONTO (Implementado)

### Backend (API — NestJS)
| Módulo | Status | Detalhes |
|--------|--------|----------|
| `auth` | ✅ Completo | JWT (access/refresh), Google OAuth, guards de roles, guard de assinatura |
| `users` | ✅ Completo | CRUD de perfil, upload de certificados, KYC integrado |
| `kyc.service` | ✅ Completo | Background check via Gemini Vision + API externa opcional (`KYC_API_URL`), Liveness (selfie) |
| `tickets` | ✅ Completo | CRUD, status máquina de estados, diagnóstico IA, agendamento |
| `proposals` | ✅ Completo | Criar, aceitar, rejeitar, `updateAmount` pós-visita, `visitFee` |
| `chat` | ✅ Completo | WebSocket (Socket.IO), mascaramento de dados (regex: tel/links/pix), `security.utils.ts` |
| `payments` | ✅ Completo | Stripe Checkout + MercadoPago, split 15% via Stripe Connect, escrow, webhooks |
| `notifications` | ✅ Completo | Push interna + WhatsApp (via serviço externo) |
| `uploads` | ✅ Completo | Cloudinary |
| `admin` | ✅ Completo | Painel básico |
| `ai` | ✅ Completo | Gemini Pro (diagnóstico de chamados + análise de docs KYC + Liveness) |
| `prisma/schema` | ✅ Completo | KYC, Liveness, LGPD, escrow, visitFee, Stripe Connect, MercadoPago |

### Frontend (Web — Next.js 14)
| Página / Componente | Status | Detalhes |
|---------------------|--------|----------|
| `app/page.tsx` | ✅ Completo | Home com busca, carrossel de testemunhos, empresas em destaque |
| `app/login` | ✅ Completo | Login com framer-motion |
| `app/register` | ✅ Completo | Registro de cliente/técnico/empresa |
| `app/dashboard` | ✅ Completo | Dashboard principal |
| `app/tickets/[ticketId]` | ✅ Completo | Detalhe do chamado + pagamento + conclusão |
| `app/tickets/new` | ✅ Completo | Criar novo chamado com IA |
| `app/profile` | ✅ Completo | Perfil com upload de certificados |
| `app/companies` | ✅ Completo | Listagem de empresas |
| `app/opportunities` | ✅ Completo | Oportunidades para técnicos |
| `app/subscription` | ✅ Completo | Página de assinatura (Stripe + MP) |
| `app/admin` | ✅ Completo | Painel admin básico |
| `app/ai-diagnostic` | ✅ Completo | Diagnóstico IA público |
| `app/about`, `app/help`, `app/legal` | ✅ Completo | Páginas estáticas |
| `components/ui/interactive-map` | ✅ Completo | Mapa Leaflet com tipagens corrigidas |
| `components/ui/file-upload` | ✅ Completo | Upload de arquivos |
| `lib/api/client.ts` | ✅ Completo | `apiGet`, `apiPost`, `apiPatch`, `getAuthHeader` |
| `lib/store.ts` | ✅ Completo | Zustand com `token` + `userType` |

---

## 🔴 O que está PENDENTE (todo.md — Itens não marcados)

### 🟡 Fase 2 — KYC, Compliance & Segurança Física

| Item | Status | O que falta |
|------|--------|-------------|
| **Background Check Automatizado** | ⚠️ Parcialmente feito | O `kyc.service.ts` está pronto no backend. **Falta**: Exposição de endpoint no `users.controller.ts` para o admin acionar KYC, e UI no frontend (admin e perfil) para exibir o status KYC do técnico com badge |
| **Liveness / Prova de Vida** | ⚠️ Parcialmente feito | Backend pronto. **Falta**: Tela de captura de selfie no frontend (`/profile` ou fluxo de registro de técnico) com integração ao endpoint `POST /users/liveness` |
| **LGPD — Consentimento Explícito** | ⚠️ Parcialmente feito | Schema do banco tem `acceptedTermsAt`, `signupIpAddress`, `signupUserAgent`. **Falta**: Capturar e enviar esses dados na tela de registro, exibir modal de termos antes do cadastro |

### 🟠 Fase 3 — Engenharia Financeira

| Item | Status | O que falta |
|------|--------|-------------|
| **Automação Fiscal (NFS-e)** | ❌ Não iniciado | Integrar FocusNF-e ou eNotas no webhook do Stripe (`processSubscription`/`processJobPayment`) para emitir NF automaticamente quando pagamento liberado |
| **Seguro de Responsabilidade Civil** | ❌ Não iniciado | Parceria com seguradora via API; adicionar flag `hasInsurance` no chamado e cobrança opcional por chamado |

### 🟠 Fase 4 — Anti-Desintermediação

| Item | Status | O que falta |
|------|--------|-------------|
| **Número Mascarado de Voz/SMS (Twilio)** | ❌ Não iniciado | Integrar Twilio Proxy para ocultar número real nas chamadas entre cliente e técnico |
| **Garantias Exclusivas On-Platform** | ❌ Não iniciado | Copy/UI nos tickets indicando que seguro e reembolso só cobrem serviços pagos pela plataforma |

### 🟠 Fase 5 — Dinâmicas Avançadas

| Item | Status | O que falta |
|------|--------|-------------|
| **Reembolso de Peças/Materiais** | ❌ Não iniciado | Fluxo de foto de cupom fiscal pelo técnico + aprovação com clique pelo cliente |
| **SaaS CRM para Técnico** | ❌ Não iniciado | Painel de agenda, propostas em PDF, controle de receitas/despesas de transporte |

---

## 🛠️ Gaps Técnicos Imediatos (não documentados no todo.md, mas encontrados na análise)

| Problema | Localização | Severidade |
|----------|-------------|------------|
| Webhook Stripe sem validação de assinatura (`stripe-signature`) | `payments.controller.ts` L34 | 🔴 Alta — risco de fraude em produção |
| Webhook MercadoPago incompleto (não processa metadata real) | `payments.controller.ts` L54 | 🔴 Alta |
| `FRONTEND_URL` e `BACKEND_URL` não estão no `.env.example` | `.env.example` | 🟡 Média |
| `STRIPE_SECRET_KEY`, `MP_ACCESS_TOKEN`, `GOOGLE_AI_API_KEY` não estão no `.env.example` | `.env.example` | 🟡 Média |
| Chat WebSocket sem autenticação JWT (comentário na L13 do gateway) | `chat.gateway.ts` | 🟡 Média |
| `KYC_API_URL` e `KYC_API_KEY` não documentados no `.env.example` | `.env.example` | 🟡 Média |

---

## 📋 Prioridade Recomendada para Completar

### 🚀 Sprint 1 — Rápido (Alto Impacto, Baixo Esforço)
1. **Completar `.env.example`** com todas as variáveis faltantes
2. **Modal LGPD** na tela de registro + captura de `acceptedTermsAt`, `ip`, `userAgent`
3. **Badge de KYC** no perfil do técnico (status `pending/approved/rejected`)
4. **Validação de assinatura Stripe webhook** (segurança crítica)

### 🏗️ Sprint 2 — Médio Prazo
5. **UI de Selfie/Liveness** na página de perfil do técnico
6. **Completar webhook MercadoPago** para processar pagamentos reais
7. **Autenticação JWT no WebSocket** do chat
8. **Reembolso de Peças** — upload de cupom fiscal + aprovação

### 🔮 Sprint 3 — Longo Prazo
9. **NFS-e Automática** (FocusNF-e / eNotas)
10. **Twilio Proxy** para número mascarado
11. **SaaS CRM** para técnicos (agenda + PDF de propostas)
12. **Seguro de Responsabilidade Civil** integrado

---

## 🔧 `.env.example` Completo (sugestão)

```env
# === API ===
PORT=4000
DATABASE_URL=postgresql://buscador:buscador@localhost:5432/buscador
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_ACCESS_SECRET=change-me
JWT_REFRESH_SECRET=change-me-too

# URLs
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:4000

# Google AI (Gemini Pro)
GOOGLE_AI_API_KEY=your-gemini-api-key

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# MercadoPago
MP_ACCESS_TOKEN=APP_USR-...

# Cloudinary (Uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# === KYC (Fase 2 — opcional) ===
KYC_API_URL=https://api.idwall.co/kyc
KYC_API_KEY=your-kyc-api-key

# === NFS-e (Fase 3 — opcional) ===
NFSE_API_URL=https://api.focusnfe.com.br
NFSE_API_KEY=your-nfse-api-key

# === Twilio (Fase 4 — opcional) ===
TWILIO_ACCOUNT_SID=ACxxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_PROXY_SERVICE_SID=xxx

# === WEB ===
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```
