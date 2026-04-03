# TODO Mestre — TechFix Marketplace (Clientes, Técnicos e Empresas)

## 1) Diagnóstico profundo do estado atual

### 1.1 A proposta de produto está clara
O sistema desejado é um **marketplace de solicitações de serviço técnico**:
- Cliente/usuário final publica um problema.
- Técnicos e empresas localizam solicitações compatíveis.
- Técnicos/empresas enviam orçamentos e iniciam contato.
- Cliente compara propostas e escolhe quem vai atender.

### 1.2 O projeto já possui base relevante (boa notícia)
Já existe:
- Front público de busca (`/api/public/search`, tags, destaque, perfil público).
- Fluxo básico de chamados (criar, listar, responder, atribuir).
- Perfis por tipo de usuário (`client`, `technician`, `company`, `admin`).
- Upload, notificações, WhatsApp, pagamentos, scheduling e analytics **ao menos no nível de rotas/estrutura**.

### 1.3 Bloqueadores críticos (precisam ser resolvidos primeiro)
Há inconsistências estruturais que impedem o produto de “funcionar perfeitamente”:

1. **Divergência entre frontend e backend**
   - Front usa stores mockadas (Zustand) para autenticação/chamados em vez de consumir API como fonte principal.
   - Resultado: experiência de demo funciona parcialmente, mas sem consistência de dados reais.

2. **Rotas com campos inexistentes no modelo**
   - Em `public_search.py`, há uso de campos como `User.description`, `User.city`, `User.state`, `User.address`, `User.profile_image` e `Ticket.assigned_technician_id`, `Ticket.closed_at`, `Ticket.rating`, `Ticket.review` que **não existem** nos modelos atuais.
   - Isso gera falhas de execução nas rotas de marketplace público e perfil público.

3. **Rota legacy quebrada (`routes/user.py`)**
   - Usa atributo `username` no `User`, mas o modelo usa `name`.
   - Pode quebrar endpoints `/users` dependendo de ordem de blueprint e uso.

4. **Segurança insuficiente para produção**
   - Token mockado (`mock_token_*`), hash SHA256 direto sem salt/pepper adaptativo (sem bcrypt/argon2), e ausência de controle robusto de sessão/permissão.

5. **Dependências de backend incompletas vs código**
   - Código usa bibliotecas avançadas (OpenAI, OpenCV, Pillow, pandas, plotly, requests etc.) e `requirements.txt` atual não cobre esse conjunto.

---

## 2) Objetivo funcional final (definição de pronto)

Para “funcionar perfeitamente” no cenário de marketplace solicitado, o sistema precisa atender ao mínimo abaixo:

1. Cadastro/login real com autorização por papéis (cliente/técnico/empresa/admin).
2. Cliente consegue abrir solicitação com mídia, localização e detalhes.
3. Técnicos/empresas visualizam marketplace de solicitações abertas com filtros.
4. Técnicos/empresas enviam **propostas/orçamentos** estruturados.
5. Cliente compara propostas, aceita uma, recusa outras.
6. Fluxo de atendimento: aberto → propostas → contratado → em execução → concluído/cancelado.
7. Mensageria/notificações entre partes.
8. Painel por papel com métricas básicas e histórico.
9. Regras de negócio e auditoria (quem fez o quê e quando).
10. Testes mínimos cobrindo fluxo principal ponta a ponta.

---

## 3) Plano de implementação por prioridade (P0 → P3)

## P0 — Correções estruturais imediatas (bloqueadores)
- [ ] **Unificar contrato de dados**: revisar modelo `User` e `Ticket` vs campos usados nas rotas; remover/ajustar campos fantasmas.
- [ ] Refatorar `public_search.py` para usar campos realmente existentes (`location_address`, `avatar`, `specialties` como JSON etc.)
- [ ] Corrigir/remover `routes/user.py` legado com `username`.
- [ ] Definir uma estratégia de compatibilidade: migração de banco + scripts de seed consistentes.
- [ ] Atualizar `requirements.txt` conforme imports reais ou remover recursos não usados.
- [ ] Trocar autenticação mock por JWT real com refresh token (ou sessão segura).

## P1 — Marketplace funcional de solicitações e propostas
- [ ] Criar entidade **Proposal/Quote** com:
  - `id`, `ticket_id`, `provider_id`, `provider_type`, `message`, `estimated_cost_min`, `estimated_cost_max`, `visit_fee`, `eta`, `status`.
- [ ] Endpoints de proposta:
  - `POST /tickets/:id/proposals`
  - `GET /tickets/:id/proposals`
  - `POST /proposals/:id/accept`
  - `POST /proposals/:id/reject`
- [ ] Regras de negócio:
  - Somente técnico/empresa envia proposta.
  - Cliente dono do ticket é o único que aceita.
  - Ao aceitar proposta: ticket recebe responsável e status muda para `in_progress`.
- [ ] Frontend:
  - Cliente: tela “Minhas Solicitações” com aba “Propostas Recebidas”.
  - Técnico/Empresa: tela “Marketplace de Solicitações” com filtros por distância, categoria e urgência.

## P1.1 — Fluxo de contato e conversa por solicitação
- [ ] Entidade de conversa por ticket (`TicketThread`/`TicketMessage`).
- [ ] Chat básico REST + upgrade posterior para Socket.IO em tempo real.
- [ ] Permitir anexos na conversa e histórico completo.

## P2 — Segurança, governança e qualidade de operação
- [ ] Autorização centralizada por papel/ownership em decorators.
- [ ] Rate-limit em login, criação de chamados e envio de propostas.
- [ ] Validações robustas (schema com Pydantic/Marshmallow ou validação equivalente).
- [ ] Sanitização de input e proteção contra upload malicioso.
- [ ] Observabilidade básica: logs estruturados + IDs de correlação por request.
- [ ] Migrations (Alembic/Flask-Migrate) e versionamento de schema.

## P2.1 — Busca e geolocalização realmente úteis
- [ ] Padronizar armazenamento de localização (lat/lng + endereço normalizado).
- [ ] Implementar cálculo de distância real (Haversine/PostGIS) e ordenação por proximidade.
- [ ] Índices de banco para filtros de marketplace (status, categoria, cidade, data).

## P3 — Monetização, diferenciação e escala
- [ ] Pagamentos reais (checkout + split/comissão + webhooks idempotentes).
- [ ] SLA de resposta e ranking de técnicos/empresas.
- [ ] Reputação avançada (avaliações verificadas por serviço concluído).
- [ ] Analytics confiável por papel (cliente, técnico, empresa, admin).
- [ ] IA vision opcional com fallback quando APIs externas indisponíveis.

---

## 4) Backlog técnico detalhado por camada

### 4.1 Backend (Flask)
- [ ] Criar módulo de domínio de marketplace:
  - `models/proposal.py`
  - `routes/proposals.py`
  - políticas de autorização.
- [ ] Revisar e padronizar status de ticket (`open`, `quoted`, `in_progress`, `resolved`, `closed`, `cancelled`).
- [ ] Evitar `except Exception` genérico em todas rotas sem classificação.
- [ ] Criar camada de serviços (não deixar regra de negócio espalhada em rotas).
- [ ] Adicionar testes unitários e integração para fluxo principal.

### 4.2 Frontend (React)
- [ ] Migrar de stores mock para integração API por etapas:
  1. Auth
  2. Tickets
  3. Proposals
  4. Notifications
- [ ] Corrigir rotas internas que usam caminhos inconsistentes (`/tickets/new` vs `/app/tickets/new`).
- [ ] Criar telas específicas por papel:
  - Cliente: criar solicitação, comparar propostas.
  - Técnico/Empresa: marketplace, envio de orçamento, agenda.
- [ ] Tratamento de erro/carregamento padrão para todas chamadas API.

### 4.3 Banco de dados
- [ ] Definir modelo relacional completo para marketplace.
- [ ] Adicionar índices em colunas de filtro e ordenação.
- [ ] Estratégia de migração e rollback.
- [ ] Seeds coerentes para ambiente de demonstração.

### 4.4 DevEx / Operação
- [ ] Docker Compose para rodar app + banco + worker (se houver).
- [ ] `.env.example` com todas variáveis obrigatórias.
- [ ] CI com lint + testes + build frontend.
- [ ] Padronizar logs e saúde (`/api/health`, readiness e liveness).

---

## 5) Critérios de aceite por papel

### Cliente
- [ ] Consegue abrir solicitação com descrição, mídia e localização.
- [ ] Recebe múltiplos orçamentos e consegue comparar.
- [ ] Aceita um orçamento e acompanha execução.

### Técnico/Empresa
- [ ] Consegue descobrir solicitações compatíveis no marketplace.
- [ ] Consegue enviar proposta com preço e prazo.
- [ ] Consegue conversar com cliente após proposta/aceite conforme regra.

### Admin
- [ ] Consegue auditar solicitações, propostas e usuários.
- [ ] Consegue moderar conteúdo e bloquear contas.
- [ ] Consegue visualizar KPIs reais de operação.

---

## 6) Sequência recomendada de execução (roadmap curto)

### Sprint 1 (fundação)
- [ ] Corrigir inconsistências de modelo/rotas (P0).
- [ ] Ativar autenticação real.
- [ ] Consolidar CRUD de tickets com regras de ownership.

### Sprint 2 (marketplace)
- [ ] Implementar propostas e aceite.
- [ ] Implementar telas de marketplace e comparação de propostas.
- [ ] Notificações básicas de nova proposta/aceite.

### Sprint 3 (confiabilidade)
- [ ] Testes E2E do fluxo crítico.
- [ ] Observabilidade e métricas.
- [ ] Hardening de segurança.

### Sprint 4 (escala e monetização)
- [ ] Pagamentos reais.
- [ ] Analytics avançado.
- [ ] Otimizações de busca e ranqueamento.

---

## 7) Riscos e mitigação
- [ ] **Risco:** avanço em features sem corrigir contrato de dados.
  - **Mitigação:** congelar novas features até fechar P0.
- [ ] **Risco:** front continuar com comportamento mock e mascarar erros reais.
  - **Mitigação:** feature flags para migração API-first.
- [ ] **Risco:** integrações externas (WhatsApp/pagamento/IA) quebrarem fluxo central.
  - **Mitigação:** fallback local + filas + retry idempotente.

---

## 8) Checklist final de “pronto para produção”
- [ ] Sem campos órfãos/inexistentes em rotas/modelos.
- [ ] Autenticação/autorização robustas.
- [ ] Fluxo completo: solicitação → propostas → aceite → conclusão.
- [ ] Logs e monitoramento básicos ativos.
- [ ] Testes automatizados passando no CI.
- [ ] Documentação operacional e de API atualizada.

