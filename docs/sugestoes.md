# 💡 Sugestões de Melhorias & Novas Funcionalidades — TechFix

---

## 🚀 Melhorias no que já existe

### 1. 🔐 Segurança & Confiabilidade
| Melhoria | Localização | Impacto |
|----------|-------------|---------|
| Validar assinatura do webhook Stripe (`stripe-signature`) | `payments.controller.ts` L34 | 🔴 Crítico — evita fraude de pagamento |
| Rate limiting no login (tentativas limitadas) | `auth.controller.ts` | 🔴 Alto — evita brute force |
| Autenticação JWT no WebSocket do chat | `chat.gateway.ts` | 🟡 Médio — chat está aberto para qualquer um |
| Refresh token rotation (invalidar token antigo após renovar) | `auth.service.ts` | 🟡 Médio — segurança de sessão |

### 2. 💅 UX / Frontend
| Melhoria | Impacto |
|----------|---------|
| **Skeleton loading** — estados de carregamento visuais (páginas ficam em branco) | 🔴 Alto |
| **Dark mode persistente** — salvar preferência no `localStorage` | 🟡 Médio |
| **Formulário de registro em wizard** — etapas separadas reduzem abandono | 🟡 Médio |
| **Notificações em tempo real no header** — sino com badge + dropdown via WebSocket | 🟡 Médio |
| **Filtros avançados na busca** — distância, preço, avaliação, categoria, disponibilidade | 🟡 Médio |
| **Feedback de erro amigável** — mensagens de erro da API com toast/banner legível | 🟡 Médio |

### 3. 🏗️ Arquitetura & Performance
| Melhoria | Impacto |
|----------|---------|
| **Paginação cursor-based** — listagens sem paginação travam em escala | 🔴 Alto |
| **Cache com Redis** — perfis e listagens quentes (Redis já está configurado, mas não usado) | 🟡 Médio |
| **Job queue com BullMQ** — KYC, emails e notificações pesadas bloqueiam a API | 🟡 Médio |
| **Compressão de imagens** no upload (antes de enviar ao Cloudinary) | 🟢 Baixo |

---

## ✨ Novas Funcionalidades

### 🌟 Alto Impacto para o Negócio

| Funcionalidade | Descrição | Esforço |
|----------------|-----------|---------|
| **Portfólio do Técnico** | Fotos de serviços anteriores (antes/depois). Aumenta muito a conversão do perfil. | Médio |
| **Agendamento com Calendário** | Técnico expõe horários; cliente agenda direto. Elimina troca de mensagens. | Alto |
| **Busca por Geolocalização** | "Técnicos a até 5km de mim" no mapa. Schema já tem `latitude/longitude`. | Médio |
| **Programa de Fidelidade** | Clientes acumulam pontos por chamados. Técnicos top ganham destaque no ranking. | Alto |
| **Chamada de Vídeo Diagnóstico** | Vídeo-chamada rápida antes de abrir chamado. Filtra serviços desnecessários. | Alto |

### 📱 Mobile / PWA

| Funcionalidade | Descrição | Esforço |
|----------------|-----------|---------|
| **Push Notifications (PWA)** | Notificar cliente/técnico em tempo real sem abrir o app. | Médio |
| **Modo Offline** | Ver últimos chamados e mensagens sem internet. | Alto |
| **Câmera Nativa** | Abrir câmera diretamente ao criar chamado (sem precisar de galeria). | Baixo |

### 💼 SaaS para Técnicos (diferencial competitivo)

| Funcionalidade | Descrição | Esforço |
|----------------|-----------|---------|
| **Proposta em PDF com Assinatura Digital** | Técnico envia proposta formal; cliente assina. Validade jurídica. | Alto |
| **Relatório Mensal de Receitas** | Dashboard financeiro: ganhos, despesas, taxa da plataforma, gráficos. | Médio |
| **Clube de Fornecedores** | Parceria com distribuidores de peças com desconto exclusivo para técnicos. | Alto |
| **Controle de Agenda Própria** | Técnico gerencia também serviços externos (fora da plataforma) em um calendário único. | Alto |

### 🤖 IA — Aproveitando o Gemini que já está integrado

| Funcionalidade | Descrição | Esforço |
|----------------|-----------|---------|
| **Precificação Inteligente** | IA sugere faixa de preço para o técnico com base no tipo de serviço e região. | Médio |
| **Match Automático Técnico-Chamado** | IA analisa o chamado e notifica automaticamente os 3 técnicos mais adequados. | Médio |
| **Laudo Técnico Automático** | IA resume a conversa do chat em um laudo ao fechar o chamado (PDF). | Médio |
| **Detecção de Fraude** | IA analisa padrões suspeitos: reviews falsos, contas duplicadas, tentativas de desvio. | Alto |

---

## 🏆 A Sugestão Mais Estratégica

O maior diferencial que o TechFix pode ter frente aos concorrentes (GetNinjas, Habitissimo) é o **trio de segurança completa**:

> ✅ **KYC real** (já feito) + 🛡️ **Seguro por chamado** (Fase 3) + 📝 **Proposta com assinatura digital** (novo)

Isso cria **segurança jurídica completa** — algo que nenhum concorrente tem.
Um cliente que sabe que:
- O técnico teve antecedentes verificados
- O serviço tem cobertura de seguro
- A proposta é um documento com validade legal

...paga **mais** e reclama **menos**.

---

## 🗓️ Roadmap Sugerido (visão consolidada)

```
Sprint 1 (agora)        → Segurança crítica + LGPD + Badge KYC + .env completo
Sprint 2 (curto prazo)  → Liveness UI + MP Webhook + WebSocket auth + Reembolso de peças
Sprint 3 (médio prazo)  → Portfólio técnico + Geolocalização + Notificações tempo real + Skeleton
Sprint 4 (longo prazo)  → NFS-e + Twilio + CRM SaaS + Proposta PDF + Match IA
```

---

*Documento gerado em: 29/05/2026*
