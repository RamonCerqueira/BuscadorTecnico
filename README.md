# 🚀 TechFix - Marketplace Técnico com IA

Bem-vindo ao TechFix, um ecossistema completo para intermediação de serviços técnicos utilizando Google Gemini Pro para diagnósticos inteligentes e PWA para experiência mobile nativa.

## 🏗️ Estrutura do Projeto
Este é um Monorepo gerenciado com **pnpm**:
- `apps/api`: Backend NestJS com Prisma e Google AI.
- `apps/web`: Frontend Next.js com Tailwind CSS e Framer Motion.
- `packages/config-*`: Configurações compartilhadas.

## 🛠️ Como Rodar o Sistema

### 1. Pré-requisitos
- Node.js 20+
- pnpm instalado (`npm i -g pnpm`)
- Banco de Dados PostgreSQL operacional (ou Docker)
- Redis operacional (para cache e chat)

### 2. Configuração de Variáveis (API)
Crie o arquivo `apps/api/.env`:
```env
DATABASE_URL="postgresql://..."
REDIS_HOST="localhost"
JWT_SECRET="sua-senha-super-secreta"
GOOGLE_AI_API_KEY="SUA_CHAVE_GEMINI_PRO"
STRIPE_SECRET_KEY="sk_test_..."
MP_ACCESS_TOKEN="APP_USR-..."
```

### 3. Instalação e Build
```bash
# Na raiz do projeto:
pnpm install
pnpm build
```

### 4. Execução em Desenvolvimento
```bash
pnpm dev
```
- API: `http://localhost:4000`
- Web: `http://localhost:3000`

## 🧠 Funcionalidades Chave
- **Diagnóstico IA**: Pré-análise técnica automática de chamados.
- **PWA**: Instale no celular com experiência nativa.
- **Geonavegação**: Visão de mapa para técnicos.
- **Credibilidade**: Upload de certificados e sistema de avaliação.
- **Pagamentos**: Redundância de checkout (Cartão e PIX).

---
Desenvolvido para máxima escala e segurança jurídica.
