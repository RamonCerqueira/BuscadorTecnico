# Guia de Deploy Completo - TechFix (Sem Docker)

Este guia orienta o deploy em produção do monorepo **TechFix** (NestJS backend na porta `4000` e Next.js frontend na porta `3000`) em sua VPS Linux, integrada aos seus domínios existentes no Nginx, utilizando o Redis local da VPS e serviços do sistema (**Systemd** ou **PM2**).

O domínio principal configurado para o frontend será `techfix.genioplay.com.br`, e a API NestJS será exposta de forma transparente e segura via proxy reverso em `techfix.genioplay.com.br/api` para evitar problemas de CORS.

---

## 🛠️ Pré-requisitos na VPS

Antes de iniciar, certifique-se de que os seguintes pacotes estão instalados na sua VPS Linux (Debian/Ubuntu):

1. **Node.js (v18 ou v20):**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```
2. **PNPM (Gerenciador de Pacotes):**
   ```bash
   sudo npm install -g pnpm
   ```
3. **Nginx e Certbot (para SSL/HTTPS):**
   ```bash
   sudo apt update
   sudo apt install -y nginx certbot python3-certbot-nginx
   ```
4. **PostgreSQL & Redis:**
   * O Redis já deve estar rodando localmente na porta padrão `6379`.
   * O PostgreSQL pode ser um banco local instalado na VPS ou um banco externo (ex: Supabase). Se for local na VPS:
     ```bash
     sudo apt install -y postgresql postgresql-contrib
     ```

---

## 📂 1. Preparando o Código na VPS

1. Clone o repositório na pasta de sua preferência (ex: `/var/www/techfix`):
   ```bash
   sudo mkdir -p /var/www/techfix
   sudo chown -R $USER:$USER /var/www/techfix
   git clone <URL_DO_SEU_REPOSITORIO> /var/www/techfix
   cd /var/www/techfix
   ```

2. Crie e configure o arquivo `.env` na raiz do projeto:
   ```bash
   cp .env.example .env
   nano .env
   ```

   **Exemplo de configuração ideal para produção (.env):**
   ```env
   # === API ===
   PORT=4000
   DATABASE_URL="postgresql://usuario:senha@localhost:5432/techfix_db?schema=public"
   DIRECT_URL="postgresql://usuario:senha@localhost:5432/techfix_db?schema=public"

   REDIS_HOST=127.0.0.1
   REDIS_PORT=6379
   JWT_ACCESS_SECRET="um-segredo-longo-e-seguro-aqui"
   JWT_REFRESH_SECRET="outro-segredo-longo-e-seguro-aqui"

   # === URLs ===
   FRONTEND_URL=https://techfix.genioplay.com.br
   BACKEND_URL=https://techfix.genioplay.com.br/api

   # === WEB ===
   NEXT_PUBLIC_API_URL=https://techfix.genioplay.com.br/api

   # === APIs Externas ===
   GOOGLE_AI_API_KEY="sua-chave-do-gemini"
   CLOUDINARY_CLOUD_NAME="seu-cloud-name"
   CLOUDINARY_API_KEY="sua-api-key"
   CLOUDINARY_API_SECRET="sua-api-secret"
   
   # Opcionais (Stripe/MercadoPago)
   STRIPE_SECRET_KEY="sk_live_..."
   STRIPE_WEBHOOK_SECRET="whsec_..."
   MP_ACCESS_TOKEN="APP_USR-..."
   ```

3. Instale as dependências do projeto:
   ```bash
   pnpm install --frozen-lockfile=false
   ```

---

## 🗄️ 2. Executando as Migrações do Banco de Dados

Com as credenciais do PostgreSQL configuradas no `.env`, rode as migrations do Prisma para estruturar o banco de dados e gerar as tipagens do Prisma Client:

```bash
# Executa as migrations estruturais no banco
npx prisma db push --schema=apps/api/prisma/schema.prisma

# Gera o cliente do Prisma com os tipos atualizados
npx prisma generate --schema=apps/api/prisma/schema.prisma
```

---

## 🏗️ 3. Compilando o Projeto para Produção

Compile a API NestJS e o Frontend Next.js:

```bash
pnpm run build
```
Isso gerará os arquivos de produção prontos na pasta `dist` (da API) e `.next` (do Web).

---

## 🚀 4. Iniciando as Aplicações com PM2 (Recomendado)

O **PM2** é o gerenciador de processos Node.js mais utilizado em produção. Ele gerencia reinicializações automáticas caso o app caia, monitora o consumo de RAM e salva logs de erros de forma simples.

1. Instale o PM2 globalmente:
   ```bash
   sudo npm install -g pm2
   ```

2. Crie um arquivo de configuração de processos `ecosystem.config.js` na raiz do projeto:
   ```javascript
   module.exports = {
     apps: [
       {
         name: "techfix-api",
         script: "node_modules/pnpm/bin/pnpm-exec.js",
         args: "run start:prod",
         cwd: "/var/www/techfix",
         instances: 1,
         autorestart: true,
         watch: false,
         max_memory_restart: "1G",
         env: {
           NODE_ENV: "production"
         }
       },
       {
         name: "techfix-web",
         script: "node_modules/pnpm/bin/pnpm-exec.js",
         args: "run start",
         cwd: "/var/www/techfix",
         instances: 1,
         autorestart: true,
         watch: false,
         max_memory_restart: "1G",
         env: {
           NODE_ENV: "production"
         }
       }
     ]
   };
   ```

3. Inicie os dois serviços pelo PM2:
   ```bash
   pm2 start ecosystem.config.js
   ```

4. Salve a lista de processos para iniciarem automaticamente se a VPS reiniciar:
   ```bash
   pm2 save
   pm2 startup
   ```
   *(Copie e execute o comando gerado no terminal pelo `pm2 startup` para ativar o serviço de inicialização).*

---

## 🛡️ 5. Alternativa: Iniciando com Systemd Services (Nativo)

Se preferir não usar o PM2 e gerenciar os aplicativos nativamente como serviços do Linux (`systemd`), siga estes passos:

### A) Serviço da API (`/etc/systemd/system/techfix-api.service`)
```ini
[Unit]
Description=TechFix Backend API
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/techfix
ExecStart=/usr/bin/pnpm --filter @buscador/api start:prod
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

### B) Serviço do Frontend Web (`/etc/systemd/system/techfix-web.service`)
```ini
[Unit]
Description=TechFix Frontend Next.js
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/techfix
ExecStart=/usr/bin/pnpm --filter @buscador/web start
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

### Habilitando e Iniciando os Serviços:
```bash
sudo systemctl daemon-reload
sudo systemctl enable techfix-api techfix-web
sudo systemctl start techfix-api techfix-web
```

---

## 🌐 6. Configurando o Nginx e Certbot SSL

Agora, configure o Nginx para redirecionar o tráfego do subdomínio `techfix.genioplay.com.br` para o Next.js (porta `3000`) e `/api` para o NestJS (porta `4000`).

1. Crie o arquivo de configuração do site no Nginx:
   ```bash
   sudo nano /etc/nginx/sites-available/techfix
   ```

2. Cole a configuração de Proxy Reverso abaixo:
   ```nginx
   server {
       listen 80;
       server_name techfix.genioplay.com.br;

       # Frontend Next.js (Porta 3000)
       location / {
           proxy_pass http://127.0.0.1:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
           
           # Uploads grandes (para fotos de laudos, KYC e selfies)
           client_max_body_size 20M;
       }

       # Backend NestJS (Porta 4000) - Direcionando o prefixo /api
       location /api {
           proxy_pass http://127.0.0.1:4000/api;
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

3. Habilite o site e teste a configuração do Nginx:
   ```bash
   sudo ln -s /etc/nginx/sites-available/techfix /etc/nginx/sites-enabled/
   sudo nginx -t
   ```
   *Se o teste for bem-sucedido (`syntax is ok`), recarregue o Nginx:*
   ```bash
   sudo systemctl reload nginx
   ```

4. **Gerando o Certificado SSL Gratuito (Let's Encrypt):**
   Execute o Certbot para obter o SSL automaticamente e configurar o redirecionamento HTTP para HTTPS:
   ```bash
   sudo certbot --nginx -d techfix.genioplay.com.br
   ```
   *Selecione a opção de redirecionar automaticamente todo o tráfego HTTP para HTTPS.*

---

## 🔍 7. Comandos de Utilidade (Logs e Monitoramento)

* **Se estiver usando PM2:**
  ```bash
  # Ver o status dos serviços
  pm2 status
  
  # Ver logs em tempo real
  pm2 logs
  
  # Reiniciar os apps após atualizar código
  pm2 restart all
  ```
  
* **Se estiver usando Systemd Services:**
  ```bash
  # Ver status dos serviços
  sudo systemctl status techfix-api
  sudo systemctl status techfix-web
  
  # Ver logs em tempo real
  sudo journalctl -u techfix-api -f
  sudo journalctl -u techfix-web -f
  
  # Reiniciar os apps após atualizar código
  sudo systemctl restart techfix-api techfix-web
  ```

Pronto! Sua aplicação **TechFix** estará rodando em produção de forma segura e performática em `https://techfix.genioplay.com.br`.
