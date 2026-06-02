# 🏁 Plano de Implementação — TechFix 100% Completo

> Baseado na análise completa do projeto. Cada item é rastreável até um arquivo específico.

---

## Visão Geral

| Sprint | Foco | Itens | Estimativa |
|--------|------|-------|------------|
| **Sprint 1** | 🔴 Segurança Crítica & Compliance | 5 itens | 1–2 dias |
| **Sprint 2** | 🟡 KYC UI, Pagamentos & Auth WS | 6 itens | 3–4 dias |
| **Sprint 3** | 🟢 UX, Funcionalidades Pendentes | 7 itens | 5–7 dias |
| **Sprint 4** | 🔵 IA Avançada & SaaS CRM | 5 itens | 7–10 dias |
| **Sprint 5** | 🟣 Infraestrutura de Escala | 4 itens | 5–7 dias |

---

## ⚠️ Pré-requisito Imediato (ANTES de qualquer sprint)

> **ATENÇÃO:** O arquivo `.env.example` contém a senha `Ramondev123buscadorTech` na linha 20.
> Isso está no histórico do Git. **Ação imediata necessária:**
> 1. Trocar essa senha em qualquer serviço que a utilize
> 2. Remover da linha 20 do `.env.example`
> 3. Executar `git filter-branch` ou usar `git-filter-repo` para limpar o histórico

---

## 🔴 Sprint 1 — Segurança Crítica & Compliance (1–2 dias)

### 1.1 — Corrigir `.env.example` (Remover senha + Adicionar variáveis faltantes)

#### [MODIFY] `.env.example`
- Remover linha 20 com a senha exposta
- Adicionar: `FRONTEND_URL`, `BACKEND_URL`, `GOOGLE_AI_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `MP_ACCESS_TOKEN`, `KYC_API_URL`, `KYC_API_KEY`, `NFSE_API_KEY`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`

---

### 1.2 — Validação de Assinatura do Webhook Stripe (Segurança crítica)

> Sem isso, qualquer atacante pode chamar `POST /payments/webhook/stripe` e simular pagamentos falsos.

#### [MODIFY] `apps/api/src/payments/payments.controller.ts`
```typescript
// Substituir o stripeWebhook() atual por:
@Post('webhook/stripe')
async stripeWebhook(@Req() req: RawBodyRequest<any>, @Headers('stripe-signature') sig: string) {
  const webhookSecret = this.config.get('STRIPE_WEBHOOK_SECRET');
  let event: Stripe.Event;
  try {
    event = this.stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
  } catch (err) {
    throw new BadRequestException(`Webhook Stripe inválido: ${err.message}`);
  }
  // ... processar event normalmente
}
```

#### [MODIFY] `apps/api/src/main.ts`
- Habilitar `rawBody: true` no bootstrap do NestJS para que o `req.rawBody` esteja disponível

---

### 1.3 — Webhook MercadoPago Funcional

#### [MODIFY] `apps/api/src/payments/payments.controller.ts`
- Buscar o pagamento pela API do MP usando `body.data.id`
- Extrair `metadata.userId` e `metadata.planId` da preferência original
- Chamar `processSubscription()` ou `processJobPayment()` com os dados reais

#### [MODIFY] `apps/api/src/payments/payments.service.ts`
- Adicionar método `processMpPayment(paymentId: string)` que faz fetch na API do MP e processa

---

### 1.4 — Modal de Termos LGPD na Tela de Registro

> O `auth.service.ts` já salva `acceptedTermsAt` quando `input.acceptTerms` é `true`. **Só falta o frontend enviar isso.**

#### [MODIFY] `apps/web/app/register/page.tsx`
- Adicionar `const [acceptTerms, setAcceptTerms] = useState(false)`
- No Step 3 (Conclusão), adicionar checkbox obrigatório: *"Li e aceito os Termos de Uso e a Política de Privacidade (LGPD)"*
- Incluir `acceptTerms` no body do `apiPost('/auth/register', { ..., acceptTerms })`
- Desabilitar botão "Finalizar Cadastro" enquanto `acceptTerms === false`

---

### 1.5 — Rate Limiting Específico no Login

> O `ThrottlerModule` global já existe com `10 req/min`, mas login precisa de um limite mais restritivo.

#### [MODIFY] `apps/api/src/auth/auth.controller.ts`
```typescript
import { Throttle } from '@nestjs/throttler';

@Post('login')
@Throttle({ default: { ttl: 60000, limit: 5 } }) // Máx 5 tentativas por minuto
async login(@Body() dto: LoginDto) { ... }
```

---

## 🟡 Sprint 2 — KYC UI, WebSocket Auth & Skeleton (3–4 dias)

### 2.1 — Badge de Status KYC no Perfil do Técnico

#### [MODIFY] `apps/web/app/profile/page.tsx`
- Buscar `kycStatus` do endpoint `GET /users/me`
- Renderizar badge visual:
  - `pending` → 🟡 "Verificação em Andamento"
  - `approved` → ✅ "Perfil Verificado" (azul com ícone ShieldCheck)
  - `rejected` → 🔴 "Pendência — Revise seus Documentos"
- Exibir badge no header do perfil e nas cards de técnicos em `/companies`

#### [MODIFY] `apps/api/src/users/users.controller.ts`
- Garantir que `GET /users/me` retorna `kycStatus`, `kycDetails`, `livenessVerified`

---

### 2.2 — UI de Selfie / Prova de Vida (Liveness)

> `KycService.verifySelfieLiveness()` já existe no backend.

#### [MODIFY] `apps/web/app/profile/page.tsx`
- Adicionar seção "Prova de Vida" visível apenas para `userType === 'technician' || 'company'`
- Botão "Tirar Selfie" que abre `<input type="file" accept="image/*" capture="user">`
- Upload via `apiPost('/users/liveness', { selfieUrl })` após captura
- Exibir resultado: `livenessVerified: true` → badge verde "Identidade Confirmada"

#### [NEW] Endpoint `POST /users/liveness` em `apps/api/src/users/users.controller.ts`
```typescript
@Post('liveness')
@UseGuards(JwtAuthGuard)
async submitLiveness(@Body() body: { selfieUrl: string }, @CurrentUser() user: AuthUser) {
  return this.kycService.verifySelfieLiveness(user.sub, body.selfieUrl);
}
```

---

### 2.3 — Autenticação JWT no WebSocket do Chat

#### [MODIFY] `apps/api/src/chat/chat.gateway.ts`
```typescript
// No handleConnection():
handleConnection(client: Socket) {
  const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.split(' ')[1];
  try {
    const payload = this.jwtService.verify(token, { secret: process.env.JWT_ACCESS_SECRET });
    client.data.userId = payload.sub;
    client.data.userType = payload.userType;
  } catch {
    client.disconnect(true); // Desconectar se token inválido
  }
}
```

---

### 2.4 — Skeleton Loading nas Páginas Principais

#### [NEW] `apps/web/components/ui/skeleton.tsx`
- Criar componente `<Skeleton>` com animação `animate-pulse`
- Variantes: `SkeletonCard`, `SkeletonText`, `SkeletonAvatar`

#### [MODIFY] páginas com fetch de dados:
- `app/dashboard/page.tsx`
- `app/companies/page.tsx`
- `app/tickets/[ticketId]/page.tsx`
- `app/opportunities/page.tsx`

---

### 2.5 — Dark Mode Persistente

#### [MODIFY] `apps/web/app/layout.tsx`
- Ler `localStorage.getItem('theme')` no mount e aplicar classe `dark` ao `<html>`
- Criar `ThemeProvider` com `useState` e `useEffect`

#### [MODIFY] `apps/web/components/layout/site-header.tsx`
- Adicionar toggle Dark/Light com ícone `Sun`/`Moon`

---

### 2.6 — Notificações em Tempo Real no Header (Sino)

#### [MODIFY] `apps/web/components/layout/site-header.tsx`
- Ícone `Bell` com badge de contagem de notificações não lidas
- Dropdown com as últimas 5 notificações
- Polling `GET /notifications` a cada 30s

#### [NEW] Endpoint `GET /notifications` e `PATCH /notifications/:id/read`

---

## 🟢 Sprint 3 — UX Avançada & Funcionalidades Pendentes (5–7 dias)

### 3.1 — Portfólio do Técnico (Antes/Depois)

#### [MODIFY] `apps/api/prisma/schema.prisma`
```prisma
model PortfolioItem {
  id          String   @id @default(cuid())
  userId      String
  title       String
  description String?
  beforeUrl   String
  afterUrl    String
  category    String?
  createdAt   DateTime @default(now())
  user        User     @relation(fields: [userId], references: [id])
}
// Adicionar: portfolioItems PortfolioItem[] na model User
```

#### [NEW] Módulo `portfolio` em `apps/api/src/portfolio/`
- `POST /portfolio` — criar item
- `GET /portfolio/:userId` — listar públicamente
- `DELETE /portfolio/:id` — remover próprio

#### [MODIFY] `apps/web/app/profile/page.tsx`
- Seção "Meu Portfólio" com grid de cards antes/depois

---

### 3.2 — Busca por Geolocalização (Técnicos Próximos)

#### [MODIFY] `apps/api/src/tickets/tickets.service.ts`
- Query com fórmula de Haversine no Prisma raw SQL para buscar por raio em km

#### [MODIFY] `apps/web/components/ui/interactive-map.tsx`
- Marcadores de técnicos próximos
- Botão "Usar minha localização" com `navigator.geolocation`

---

### 3.3 — Filtros Avançados na Busca

#### [MODIFY] `apps/web/app/companies/page.tsx`
- Painel de filtros: Categoria, Avaliação mínima, Distância, KYC verificado
- Ordenação: Mais bem avaliados, Mais próximos, Mais recentes

#### [MODIFY] `apps/api/src/users/users.controller.ts`
- `GET /users?category=&minRating=&verified=&lat=&lng=&radius=`

---

### 3.4 — Paginação Cursor-based

#### [MODIFY] todos os endpoints de listagem:
- `GET /tickets`, `GET /users`, `GET /proposals` → retornar `{ data, nextCursor, hasMore }`

#### [MODIFY] frontend:
- `useInfiniteQuery` do TanStack Query com botão "Carregar mais"

---

### 3.5 — Reembolso de Peças/Materiais

#### [MODIFY] `apps/api/prisma/schema.prisma`
```prisma
model MaterialRefund {
  id         String   @id @default(cuid())
  ticketId   String
  providerId String
  amount     Decimal
  receiptUrl String
  status     String   @default("pending")
  createdAt  DateTime @default(now())
  ticket     Ticket   @relation(fields: [ticketId], references: [id])
  provider   User     @relation(fields: [providerId], references: [id])
}
```

#### [NEW] Módulo `refunds` em `apps/api/src/refunds/`
- `POST /tickets/:id/refunds` — técnico solicita com foto
- `PATCH /refunds/:id/approve` — cliente aprova
- `PATCH /refunds/:id/reject` — cliente rejeita

#### [MODIFY] `apps/web/app/tickets/[ticketId]/page.tsx`
- Seção "Materiais" com upload de cupom fiscal e aprovação por clique

---

### 3.6 — Garantias Exclusivas On-Platform (Copy/UI)

#### [MODIFY] `apps/web/app/tickets/[ticketId]/page.tsx`
- Banner no chat: *"⚠️ Seguro e reembolso cobrem APENAS serviços pagos dentro da plataforma TechFix."*

---

### 3.7 — Cache Redis nas Listagens

#### [MODIFY] `apps/api/src/users/users.service.ts` e `tickets.service.ts`
- Injetar `CACHE_MANAGER` e usar `get`/`set` com TTL de 60s nas listagens mais acessadas

---

## 🔵 Sprint 4 — IA Avançada & SaaS CRM (7–10 dias)

### 4.1 — Match Automático Técnico-Chamado com IA

#### [MODIFY] `apps/api/src/ai/ai.service.ts`
- Novo método `matchTechnicians(ticket)`: Gemini analisa chamado e retorna top-3 técnicos compatíveis

#### [MODIFY] `apps/api/src/tickets/tickets.service.ts`
- Ao criar ticket, chamar `aiService.matchTechnicians()` em background e notificar técnicos

---

### 4.2 — Laudo Técnico Automático (PDF) ao Fechar Chamado

#### [MODIFY] `apps/api/src/ai/ai.service.ts`
- Novo método `generateServiceReport(ticketId)`: Gemini gera laudo em markdown a partir do histórico

#### [NEW] Endpoint `POST /tickets/:id/report`
- Gera o laudo e converte para PDF com `puppeteer`

#### [MODIFY] `apps/web/app/tickets/[ticketId]/page.tsx`
- Botão "Gerar Laudo Técnico" após `status === 'resolved'` → download PDF

---

### 4.3 — Precificação Inteligente (IA sugere preço)

#### [NEW] Endpoint `GET /ai/suggest-price?category=&city=`
- Gemini retorna faixa de preço sugerida baseada na categoria e cidade

#### [MODIFY] Tela de envio de proposta
- Widget: *"💡 IA sugere: R$ 150–R$ 300 para este tipo de serviço em sua região"*

---

### 4.4 — Dashboard Financeiro do Técnico (SaaS CRM)

#### [NEW] `apps/web/app/technician/dashboard/page.tsx`
- Resumo: Total ganho, Taxa plataforma, Líquido, Saldo escrow
- Gráfico de receitas por mês (Recharts)
- Calendário de serviços agendados
- Lista de propostas pendentes com ação rápida

#### [NEW] Endpoint `GET /users/me/stats`
- Retorna: `totalEarned`, `totalJobs`, `avgRating`, `pendingProposals`, `escrowBalance`

---

### 4.5 — Proposta em PDF com Assinatura Digital

#### [MODIFY] `apps/api/src/proposals/proposals.service.ts`
- Novo método `generateProposalPdf(proposalId)`: gera PDF com todos os dados

#### [MODIFY] `apps/api/prisma/schema.prisma`
- Adicionar `signedAt DateTime?`, `signatureHash String?` em `Proposal`

#### [MODIFY] `apps/web/app/tickets/[ticketId]/page.tsx`
- Botão "Assinar Proposta" → canvas de assinatura digital + download do PDF assinado

---

## 🟣 Sprint 5 — Infraestrutura de Escala (5–7 dias)

### 5.1 — NFS-e Automática (FocusNF-e)

#### [NEW] `apps/api/src/fiscal/fiscal.service.ts`
- Método `emitirNotaFiscal(ticketId, amount)`: POST na API FocusNF-e com dados da comissão (15%)

#### [MODIFY] `apps/api/src/payments/payments.service.ts`
- Chamar `fiscalService.emitirNotaFiscal()` dentro de `processJobPayment()`

---

### 5.2 — Twilio Proxy (Número Mascarado)

#### [NEW] `apps/api/src/communications/twilio.service.ts`
- `createProxySession(clientPhone, techPhone, ticketId)` — cria sessão de proxy no Twilio

#### [MODIFY] `apps/api/src/proposals/proposals.service.ts`
- Chamar `twilioService.createProxySession()` ao aceitar proposta

---

### 5.3 — Push Notifications PWA

#### [NEW] `apps/web/public/sw.js` — Service Worker para push
#### [NEW] `apps/web/public/manifest.json` — Manifesto PWA
#### [NEW] Endpoint `POST /notifications/subscribe` — salvar PushSubscription
#### [MODIFY] `apps/api/src/notifications/notifications.service.ts` — usar `web-push`

---

### 5.4 — Job Queue com BullMQ

#### Instalar: `@nestjs/bullmq`, `bullmq`, `ioredis`

#### [NEW] `apps/api/src/queues/`
- `kyc.processor.ts`, `notification.processor.ts`, `fiscal.processor.ts`

#### [MODIFY] `apps/api/src/users/kyc.service.ts`
- Substituir `Promise.resolve().then()` por `this.kycQueue.add('background-check', { userId })`

---

## 📊 Resumo Final

| Métrica | Valor |
|---------|-------|
| Total de sprints | 5 |
| Estimativa total | **21–30 dias úteis** |
| Novos módulos backend | ~6 |
| Novas páginas frontend | ~4 |
| Migrações Prisma | ~3 |
| Integrações externas novas | Twilio, FocusNF-e, web-push |

---

## ✅ Comandos de Verificação

```bash
# Instalar novas dependências
pnpm install

# Rodar migrações após cada sprint que alterar o schema
cd apps/api
npx prisma migrate dev --name "sprint_X_descricao"
npx prisma generate

# Rodar em desenvolvimento
pnpm dev

# Testar webhook Stripe localmente
stripe listen --forward-to localhost:4000/api/payments/webhook/stripe
```

---

*Plano gerado em: 29/05/2026*
