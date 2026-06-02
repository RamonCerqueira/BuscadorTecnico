# 🏆 TechFix - Planejamento Estratégico de Escala & Arquitetura Corporativa

Este documento estabelece a visão de produto a longo prazo para transformar o TechFix em uma plataforma líder e resiliente, mitigando vazamento de receita, simplificando dinâmicas fiscais e garantindo a segurança de todos os usuários.

## 🗺️ Roadmap de Evolução Arquitetural & de Negócio

### Fase 1: Estabilização de Engenharia & Correção de Bugs (Concluído)
*Ver detalhes técnicos em [tasks.md](file:///c:/Users/Usuario/Desktop/PROJETOS/RAMON/BuscadorTecnico/tasks.md).*
- [x] Correção dos erros críticos de importação e tipagem estática no frontend Next.js e no backend NestJS.
- [x] Eliminação de vazamento de memória e anti-padrões de ciclo de vida do React (timers do carrossel).
- [x] Padronização do consumo da API REST substituindo fetchs puros por `apiPost` e criação de `apiPatch`.

### Fase 2: Segurança Física, KYC & Compliance Legal (Curto Prazo)
- [ ] **Background Check Automatizado (KYC):** Integração com birôs de dados (ex: Idwall, Chronos, Serasa) para checagem automática de antecedentes criminais e validação cadastral antes de aprovar técnicos no app.
- [ ] **Validação de Documento com Liveness (Prova de Vida):** Implementar captura de selfie com prova de vida para evitar perfis fakes de prestadores de serviço visitando residências.
- [ ] **LGPD (Lei Geral de Proteção de Dados):** Logs de consentimento explícito dos termos de uso e políticas de privacidade com trilha de auditoria no banco (`acceptedTermsAt`, `ipAddress`, `userAgent`).

### Fase 3: Engenharia Financeira & Prevenção de Bitributação (Concluído no Backend / Pronto para Integração)
- [x] **Split de Pagamento Direto na Origem:** Integração do **Stripe Connect** (Custom/Express Accounts) com divisão imediata da comissão (Take Rate de 15% da plataforma) via Destination Charges no processamento do checkout.
- [ ] **Automação Fiscal (NFS-e):** Integração com FocusNF-e ou eNotas para emitir automaticamente a Nota Fiscal de Serviços eletrônica (NFS-e) referente à comissão da plataforma quando o pagamento for liberado.
- [ ] **Seguro de Responsabilidade Civil Integrado:** Parceria com seguradora digital via API (ex: insurtechs) para incluir um seguro básico contra danos materiais acidentais em cada chamado ativo (ex: eletricista que queima um aparelho ou encanador que causa vazamento).

### Fase 4: Proteção contra Desintermediação (Concluído no Backend / Pronto para Produção)
- [x] **Chat com Mascaramento de Dados:** Filtro em tempo real no chat via Regex para ocultar números de telefone, e-mails, links de redes sociais e chaves Pix, prevenindo vazamentos e garantindo transações pela plataforma.
- [ ] **Número Mascarado de Voz/SMS:** Chamadas telefônicas roteadas de forma privada via Twilio, mantendo o número real de ambos oculto.
- [ ] **Garantias Exclusivas On-Platform:** Tornar explícito que a apólice de seguro e o sistema de reembolso contra danos só cobrem serviços finalizados e pagos dentro da carteira digital da plataforma.

### Fase 5: Dinâmicas de Agendamento, Orçamento e SaaS (Concluído no Backend / Pronto para Produção)
- [x] **Visita Técnica Pré-Paga / Ajuste pós-visita:** Permitir a contratação de uma "taxa de diagnóstico" inicial (`visitFee` no banco) e ajuste dinâmico do orçamento final pelo técnico via endpoint `/update-amount` após visita presencial de diagnóstico.
- [ ] **Reembolso de Peças/Materiais:** Fluxo para o técnico anexar foto de cupom fiscal de peças compradas e solicitar o reembolso imediato ao cliente através da plataforma com aprovação por clique.
- [ ] **SaaS CRM para o Técnico:** Painel completo para o técnico gerenciar sua agenda inteira (incluindo serviços externos), emitir propostas em PDF e controlar suas receitas e despesas de transporte.

---
*Status de Visão: Arquitetura de Escala e Resiliência Operacional* 📈
