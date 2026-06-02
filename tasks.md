# 🛠️ Tasks Técnicas de Engenharia & Refatoração

Checklist técnico refinado para estabilização de bugs imediatos e desenvolvimento de arquitetura de alta escala.

## 🔴 Correções de Compilação & Bugs de UX (Prioridade 1)

### 1. `apps/web/app/tickets/[ticketId]/page.tsx`
- [x] Adicionar os imports ausentes no topo do arquivo:
  ```typescript
  import { Star, ArrowRight } from 'lucide-react';
  ```
- [x] Atualizar o store global `useSessionStore` ou adaptar a linha 34 para não obter `user`, pois o tipo `SessionState` atual do Zustand apenas expõe `token` e `userType`.
- [x] Tipar o parâmetro `data` no `onSuccess` da mutation `payMutation` para evitar erro de tipo `unknown`.
- [x] Resolver a chamada de `apiPost` que está sendo usada com 3 parâmetros para simular um PATCH:
  - Criada a função `apiPatch` no `client.ts`.
  - Chamado `apiPatch` em vez de `apiPost(..., ..., 'PATCH')` na conclusão do chamado.

### 2. `apps/web/app/login/page.tsx`
- [x] Adicionar o import do framer-motion no topo do arquivo:
  ```typescript
  import { motion } from 'framer-motion';
  ```

### 3. `apps/web/app/companies/page.tsx`
- [x] Corrigir erro na linha 136 importando o componente de ícone `User` de `'lucide-react'` ou renomeando para evitar colisão com o tipo de mesmo nome.

### 4. `apps/web/app/profile/page.tsx`
- [x] Atualizar a interface/tipo `UserProfile` no início do arquivo para incluir `certificates: string[]`.
- [x] Definir tipagens para os parâmetros implícitos de callbacks nas linhas 178 e 182.

### 5. `apps/web/components/ui/interactive-map.tsx`
- [x] Instalar `@types/leaflet` no `package.json` do frontend (`apps/web`).
- [x] Corrigir as tipagens e declarações do `MapContainer` e do `customIcon` para compatibilidade estrita do TypeScript.

### 6. `apps/web/lib/api/client.ts`
- [x] Ajustar o retorno da função `getAuthHeader` para retornar `HeadersInit` ou usar cast de tipo (`as Record<string, string>`) no cabeçalho do `fetch` para sanar a incompatibilidade de sobrecarga do fetch.

### 7. `apps/web/app/page.tsx`
- [x] Mover o bloco de intervalo do carrossel da linha 35 para um hook `useEffect` limpo, garantindo que o timer seja destruído no cleanup quando o componente for desmontado.

---

## 🟡 Infraestrutura, Segurança & Split Financeiro (Prioridade 2)

### 1. Hardening do Chat (Prevenção de Vazamento)
- [x] Criar um middleware ou interceptor no gateway de chat do NestJS (`apps/api/src/chat/chat.gateway.ts`) que analise as mensagens recebidas em tempo real usando regex para números de telefone, links e palavras-chave e mascare o conteúdo se necessário.

### 2. Fluxo de Visita Técnica e Orçamentos Parciais
- [x] Alterar o schema do Prisma para aceitar `visitFee` (taxa de deslocamento) na tabela `Proposal`.
- [x] Criar endpoint `/tickets/:id/proposals/:proposalId/update-amount` para permitir que o técnico ajuste o valor do orçamento final após a visita presencial de diagnóstico.

### 3. Implementação de Split de Pagamento
- [x] Configurar rotas de Webhook específicas para o Stripe Connect no backend.
- [x] Implementar a lógica de pagamento com destino (`transfer_data`) no serviço de pagamentos para garantir a separação fiscal imediata de taxas (15% platform fee).
