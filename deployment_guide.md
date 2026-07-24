# Guia de Deploy Completo - BuscadorTecnico (Sem Docker)

Este guia orienta o deploy em produção do monorepo **BuscadorTecnico** (NestJS backend na porta `5278` e Next.js frontend na porta `5279`) na sua VPS Linux (`~/BuscadorTecnico`), integrado aos seus domínios existentes no Nginx, utilizando o Redis local da VPS (porta `6379`) e o gerenciador de processos **PM2**.

---

## 🛠️ Pré-requisitos na VPS

Antes de iniciar, certifique-se de ter os seguintes pacotes instalados na sua VPS Linux (Debian/Ubuntu):

1. **Node.js (v20+):**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```
2. **PNPM (Gerenciador de Pacotes):**
   ```bash
   sudo npm install -g pnpm
   ```
3. **PM2 (Gerenciador de Processos):**
   ```bash
   sudo npm install -g pm2
   ```
4. **Nginx e Certbot (para SSL/HTTPS):**
   ```bash
   sudo apt update
   sudo apt install -y nginx certbot python3-certbot-nginx
   ```

---

## 📂 1. Preparando o Código e Variáveis de Ambiente

1. Clone o repositório no seu diretório home na VPS:
   ```bash
   cd ~
   git clone https://github.com/RamonCerqueira/BuscadorTecnico.git
   cd BuscadorTecnico
   ```

2. Crie e edite o arquivo `.env`:
   ```bash
   cp .env.example .env
   nano .env
   ```

   **Configuração recomendada para o `.env` em produção na VPS:**
   ```env
   # === API ===
   PORT=5278

   # Supabase Database
   DATABASE_URL="postgresql://postgres.gvovgiyumztwknwgfzzh:RamonDevTech123BuscadorTech@aws-1-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
   DIRECT_URL="postgresql://postgres.gvovgiyumztwknwgfzzh:RamonDevTech123BuscadorTech@aws-1-us-west-2.pooler.supabase.com:5432/postgres"

   REDIS_HOST=127.0.0.1
   REDIS_PORT=6379
   JWT_ACCESS_SECRET="sua_chave_jwt_access_longa_e_segura"
   JWT_REFRESH_SECRET="sua_chave_jwt_refresh_longa_e_segura"

   # === URLs ===
   FRONTEND_URL=https://techfix.genioplay.com.br
   BACKEND_URL=https://techfix.genioplay.com.br/api

   # === WEB ===
   NEXT_PUBLIC_API_URL=https://techfix.genioplay.com.br/api

   # === Stripe ===
   STRIPE_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...

   # === APIs Externas ===
   GOOGLE_AI_API_KEY="sua-chave-do-gemini"
   CLOUDINARY_CLOUD_NAME="seu-cloud-name"
   CLOUDINARY_API_KEY="sua-api-key"
   CLOUDINARY_API_SECRET="sua-api-secret"
   ```

3. Instale as dependências:
   ```bash
   pnpm install --frozen-lockfile=false
   ```

---

## 🗄️ 2. Migrações e Prisma Client

Execute o banco de dados no Supabase e gere as tipagens do Prisma Client:

```bash
# Sincronizar o banco de dados Supabase com o Prisma Schema (usando Prisma 6)
npx prisma@6 db push --schema=apps/api/prisma/schema.prisma

# Gerar o cliente Prisma
pnpm --filter @buscador/api prisma:generate
```

---

## 🏗️ 3. Compilando o Projeto para Produção

Compile a API NestJS e o Frontend Next.js:

```bash
pnpm run build
```

Isso compilará a API em `apps/api/dist` e o Web em `apps/web/.next`.

---

## 🚀 4. Iniciando com PM2

O repositório já inclui o arquivo [`ecosystem.config.js`](file:///c:/Users/Usuario/Desktop/PROJETOS/RAMON/BuscadorTecnico/ecosystem.config.js) configurado com as portas `5278` e `5279`.

1. Inicie a aplicação com o PM2:
   ```bash
   pm2 start ecosystem.config.js
   ```

2. Verifique o status dos serviços:
   ```bash
   pm2 status
   ```

3. Salve para iniciar automaticamente com o sistema:
   ```bash
   pm2 save
   pm2 startup
   ```
   *(Copie e cole no terminal o comando gerado pela saída de `pm2 startup`).*

---

## 🌐 5. Configurando o Nginx Proxy Reverso e SSL

1. Crie o arquivo de configuração do site no Nginx:
   ```bash
   sudo nano /etc/nginx/sites-available/techfix
   ```

2. Cole a configuração de Proxy Reverso abaixo (porta `5279` para o Next.js e porta `5278` para a API NestJS):
   ```nginx
   server {
       listen 80;
       server_name techfix.genioplay.com.br;

       # Frontend Next.js (Porta 5279)
       location / {
           proxy_pass http://127.0.0.1:5279;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
           
           # Uploads grandes (para fotos de laudos, KYC e selfies)
           client_max_body_size 20M;
       }

       # Backend NestJS (Porta 5278) - Direcionando o prefixo /api
       location /api {
           proxy_pass http://127.0.0.1:5278/api;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;

           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;

           # Uploads grandes para o backend
           client_max_body_size 20M;
       }
   }
   ```

3. Ative o site e valide as configurações do Nginx:
   ```bash
   sudo ln -s /etc/nginx/sites-available/techfix /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

4. **SSL Gratuito (Certbot / Let's Encrypt):**
   ```bash
   sudo certbot --nginx -d techfix.genioplay.com.br
   ```

---

## 🔍 6. Comandos Úteis no PM2

```bash
# Ver status
pm2 status

# Ver logs em tempo real
pm2 logs

# Reiniciar todos os serviços após um git pull
git pull
pnpm run build
pm2 restart all
```
