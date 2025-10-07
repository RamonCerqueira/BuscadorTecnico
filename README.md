# TechFix - Plataforma de Diagnóstico Técnico

Uma plataforma completa para conectar clientes com problemas técnicos a técnicos e empresas especializadas, com diagnóstico inteligente por IA.

## 🚀 Funcionalidades

### Para Clientes
- ✅ Cadastro e criação de chamados técnicos
- ✅ Upload de fotos, vídeos e áudio do problema
- ✅ Diagnóstico inicial automático por IA
- ✅ Busca de técnicos próximos por geolocalização
- ✅ Chat em tempo real com técnicos
- ✅ Acompanhamento do status do chamado
- ✅ Sistema de avaliações

### Para Técnicos
- ✅ Perfil profissional com especialidades
- ✅ Recebimento de chamados por proximidade
- ✅ Resposta a chamados com orçamentos
- ✅ Agendamento de visitas técnicas
- ✅ Histórico de atendimentos
- ✅ Sistema de reputação

### Para Empresas
- ✅ Gestão de equipe técnica
- ✅ Dashboard com KPIs e métricas
- ✅ Distribuição automática de chamados
- ✅ Relatórios de performance
- ✅ Validação por CNPJ

### Para Administradores
- ✅ Painel administrativo completo
- ✅ Gestão de usuários e chamados
- ✅ Estatísticas da plataforma
- ✅ Validação de técnicos
- ✅ Moderação de conteúdo

## 🛠️ Tecnologias

### Frontend
- **React 18** - Framework principal
- **Vite** - Build tool e dev server
- **Zustand** - Gerenciamento de estado
- **React Router** - Roteamento
- **Tailwind CSS** - Estilização
- **Lucide React** - Ícones

### Backend
- **Flask** - Framework web Python
- **SQLAlchemy** - ORM para banco de dados
- **SQLite** - Banco de dados
- **Flask-CORS** - Suporte a CORS
- **Werkzeug** - Upload de arquivos

### Recursos Especiais
- **IA Integrada** - Diagnóstico automático de problemas
- **Geolocalização** - Busca de técnicos próximos
- **Upload de Mídias** - Suporte a imagens, vídeos e áudio
- **Sistema de Chat** - Comunicação em tempo real
- **Responsivo** - Funciona em desktop e mobile

## 📁 Estrutura do Projeto

```
/
├── plataforma-diagnostico/          # Frontend React
│   ├── src/
│   │   ├── components/             # Componentes reutilizáveis
│   │   ├── pages/                  # Páginas da aplicação
│   │   ├── lib/                    # Utilitários e store
│   │   └── App.jsx                 # Componente principal
│   ├── dist/                       # Build de produção
│   └── package.json
│
├── techfix-api/                    # Backend Flask
│   ├── src/
│   │   ├── models/                 # Modelos do banco de dados
│   │   ├── routes/                 # Rotas da API
│   │   ├── static/                 # Arquivos estáticos (frontend)
│   │   └── main.py                 # Aplicação principal
│   ├── venv/                       # Ambiente virtual Python
│   └── requirements.txt
│
└── README.md                       # Esta documentação
```

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- Python 3.11+
- Git

### 1. Frontend (Desenvolvimento)
```bash
cd plataforma-diagnostico
pnpm install
pnpm run dev
```
Acesse: http://localhost:5173

### 2. Backend Flask
```bash
cd techfix-api
source venv/bin/activate
python src/main.py
```
API disponível em: http://localhost:5000

### 3. Aplicação Completa (Produção)
```bash
# Build do frontend
cd plataforma-diagnostico
pnpm run build

# Copiar para Flask
cp -r dist/* ../techfix-api/src/static/

# Executar Flask
cd ../techfix-api
source venv/bin/activate
python src/main.py
```
Acesse: http://localhost:5000

## 👥 Usuários de Demonstração

O sistema vem com usuários pré-cadastrados para teste:

### Cliente
- **Email:** joao@email.com
- **Senha:** demo123
- **Funcionalidades:** Criar chamados, buscar técnicos

### Técnico
- **Email:** carlos@tecnico.com
- **Senha:** demo123
- **Funcionalidades:** Responder chamados, agendar visitas

### Empresa
- **Email:** contato@techfix.com
- **Senha:** demo123
- **Funcionalidades:** Gestão de equipe, dashboard empresarial

### Administrador
- **Email:** admin@techfix.com
- **Senha:** demo123
- **Funcionalidades:** Painel administrativo completo

## 📊 API Endpoints

### Autenticação
- `POST /api/auth/login` - Login de usuário
- `POST /api/auth/register` - Cadastro de usuário
- `POST /api/auth/demo-login` - Login automático (demo)

### Chamados
- `GET /api/tickets` - Listar chamados
- `POST /api/tickets` - Criar chamado
- `GET /api/tickets/:id` - Detalhes do chamado
- `PUT /api/tickets/:id` - Atualizar chamado
- `POST /api/tickets/:id/responses` - Adicionar resposta

### Usuários
- `GET /api/users` - Listar usuários
- `GET /api/users/:id` - Detalhes do usuário
- `PUT /api/users/:id` - Atualizar usuário
- `GET /api/users/technicians/nearby` - Técnicos próximos

### Upload
- `POST /api/upload/file` - Upload de arquivo único
- `POST /api/upload/multiple` - Upload múltiplo
- `POST /api/upload/avatar` - Upload de avatar

### Demonstração
- `POST /api/demo/populate` - Popular dados de demo
- `POST /api/demo/reset` - Resetar dados

## 🔧 Configurações

### Variáveis de Ambiente
```bash
# Flask
FLASK_ENV=development
SECRET_KEY=your-secret-key

# Banco de dados
DATABASE_URL=sqlite:///app.db

# Upload
MAX_CONTENT_LENGTH=16MB
```

### Configurações do Frontend
```javascript
// src/lib/config.js
export const API_BASE_URL = 'http://localhost:5000/api'
export const UPLOAD_MAX_SIZE = 16 * 1024 * 1024 // 16MB
```

## 🎨 Recursos Visuais

### Cores da Marca
- **Primária:** #2563eb (Azul)
- **Secundária:** #10b981 (Verde)
- **Alerta:** #ef4444 (Vermelho)
- **Aviso:** #f59e0b (Amarelo)

### Ícones
- Utiliza biblioteca Lucide React
- Ícones consistentes em toda aplicação
- Suporte a diferentes tamanhos e cores

## 📱 Responsividade

- ✅ Desktop (1024px+)
- ✅ Tablet (768px - 1023px)
- ✅ Mobile (320px - 767px)
- ✅ Touch-friendly em dispositivos móveis

## 🔒 Segurança

- ✅ Autenticação por token (mockada para demo)
- ✅ Validação de dados no frontend e backend
- ✅ Upload seguro de arquivos
- ✅ Sanitização de inputs
- ✅ CORS configurado adequadamente

## 🚀 Deploy

### Opções de Deploy

1. **Vercel (Frontend + Backend)**
   - Frontend: Deploy automático do React
   - Backend: Serverless functions

2. **Heroku**
   - Deploy completo da aplicação Flask
   - Banco PostgreSQL

3. **Railway**
   - Deploy simples com Git
   - Banco PostgreSQL incluído

4. **DigitalOcean App Platform**
   - Deploy containerizado
   - Escalabilidade automática

## 📈 Próximos Passos

### Funcionalidades Futuras
- [ ] Notificações push em tempo real
- [ ] Integração com WhatsApp Business
- [ ] Sistema de pagamento integrado
- [ ] App mobile nativo (React Native)
- [ ] IA mais avançada com computer vision
- [ ] Sistema de agendamento avançado
- [ ] Relatórios e analytics avançados

### Melhorias Técnicas
- [ ] Testes automatizados (Jest, Pytest)
- [ ] CI/CD pipeline
- [ ] Monitoramento e logs
- [ ] Cache Redis
- [ ] CDN para arquivos estáticos
- [ ] Backup automático do banco

## 📞 Suporte

Para dúvidas ou suporte:
- **Email:** suporte@techfix.com
- **Documentação:** [docs.techfix.com](https://docs.techfix.com)
- **GitHub:** [github.com/techfix/plataforma](https://github.com/techfix/plataforma)

## 📄 Licença

Este projeto está licenciado sob a MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

**Desenvolvido por Ramon Cerqueira e com ❤️ pela equipe TechFix**

