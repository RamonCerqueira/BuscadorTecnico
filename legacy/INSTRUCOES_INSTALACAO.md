# 🚀 TechFix - Instruções de Instalação

## 📋 Pré-requisitos

### Frontend (React)
- Node.js 18+ 
- pnpm (recomendado) ou npm

### Backend (Flask)
- Python 3.11+
- pip

## 🛠️ Instalação

### 1. Frontend React

```bash
# Navegar para o diretório do frontend
cd plataforma-diagnostico

# Instalar dependências
pnpm install
# ou
npm install

# Executar em desenvolvimento
pnpm dev
# ou
npm run dev

# Build para produção
pnpm build
# ou
npm run build
```

### 2. Backend Flask

```bash
# Navegar para o diretório do backend
cd techfix-api

# Criar ambiente virtual
python -m venv venv

# Ativar ambiente virtual
# Linux/Mac:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Instalar dependências
pip install -r requirements.txt

# Executar servidor
python src/main.py
```

## 🌐 Acesso

- **Frontend**: http://localhost:5173 (desenvolvimento)
- **Backend**: http://localhost:5000
- **Aplicação Integrada**: http://localhost:5000 (após build)

## 📱 PWA (Progressive Web App)

A aplicação é um PWA completo que pode ser instalado em dispositivos móveis:

1. Acesse a aplicação no navegador móvel
2. Clique no botão "📱 Instalar App" 
3. Ou use o menu do navegador "Adicionar à tela inicial"

## 🔐 Login de Demonstração

A aplicação possui 4 tipos de usuário para demonstração:

- **Cliente**: Relatar problemas com equipamentos
- **Técnico**: Atender chamados técnicos  
- **Empresa**: Gerenciar equipe técnica
- **Admin**: Administrar plataforma

Todos os logins são automáticos para demonstração.

## 🎯 Funcionalidades Principais

### Homepage Pública
- Busca de técnicos/empresas por localização
- Filtros por tipo de problema
- Perfis públicos de profissionais
- Sistema de avaliações

### Sistema de Chamados
- Criação de chamados com IA
- Upload de mídias (fotos, vídeos, áudio)
- Chat em tempo real
- Geolocalização de técnicos
- Sistema de agendamento

### Funcionalidades Avançadas
- Notificações push em tempo real
- Integração com WhatsApp Business
- Sistema de pagamentos integrado
- IA com Computer Vision
- Relatórios e analytics avançados

## 🔧 Configuração de Produção

### Variáveis de Ambiente

Crie um arquivo `.env` no backend com:

```env
FLASK_ENV=production
SECRET_KEY=sua-chave-secreta-aqui
DATABASE_URL=sqlite:///app.db
OPENAI_API_KEY=sua-chave-openai
WHATSAPP_TOKEN=seu-token-whatsapp
STRIPE_SECRET_KEY=sua-chave-stripe
```

### Deploy

1. **Frontend**: Build e servir arquivos estáticos
2. **Backend**: Usar WSGI server (Gunicorn, uWSGI)
3. **Banco**: Migrar para PostgreSQL/MySQL em produção

## 📞 Suporte

Para dúvidas ou problemas:
- Consulte a documentação no README.md
- Verifique os logs do console do navegador
- Verifique os logs do servidor Flask

## 🎉 Pronto!

Sua plataforma TechFix está funcionando! 

Acesse http://localhost:5000 e explore todas as funcionalidades.

