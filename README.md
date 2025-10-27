# Warhammer 40k Crusade AI Manager

Sistema completo de gerenciamento de campanhas de Cruzada do Warhammer 40.000 com IA controlando a Horda inimiga.

## 🎮 Funcionalidades Implementadas

### ✅ Gerenciamento de Campanhas
- Criação e gerenciamento de campanhas cooperativas
- Configuração de jogadores e facções
- Rastreamento de progresso (rodadas, vitórias, pontos)
- Sistema de Order of Battle completo

### ✅ Sistema de IA da Horda
- **1200+ unidades** de 21 facções diferentes importadas do Excel
- Sistema de spawn baseado em 2D6 com modificadores por rodada
- Seleção automática de unidades por brackets de pontos
- **IA de movimento**: prioriza inimigo mais próximo → objetivo → borda do tabuleiro
- **IA de tiro**: seleciona alvo mais próximo dentro do alcance
- **IA de carga**: verifica armas corpo-a-corpo e distância

### ✅ Lógica Pós-Batalha
- Cálculo automático de XP com bônus do Horde Mode
- Sistema de progressão de ranks (Battle-ready → Blooded → Battle-hardened → Heroic → Legendary)
- Rolagens automáticas de Out of Action
- Sistema de Battle Honours e Battle Scars
- Atualização automática de Crusade Cards

### ✅ Parser de Listas de Exército
- Importação automática de listas .txt do app oficial do Warhammer
- Extração de nome, facção, destacamento, pontos e unidades
- Criação automática de Crusade Cards para cada unidade

### ✅ Interface em Português
- Todas as telas em português (Brasil)
- Design moderno com tema escuro
- Navegação intuitiva com sidebar
- Responsivo para diferentes tamanhos de tela

## 🚀 Como Publicar a Aplicação

### Opção 1: Publicar no Manus (Recomendado)

1. **Clique no botão "Publish"** no canto superior direito da interface do Manus
2. A aplicação será publicada automaticamente com um domínio `*.manus.space`
3. O OAuth funcionará corretamente após a publicação
4. Acesse a URL fornecida e faça login

### Opção 2: Executar Localmente

#### Pré-requisitos
- Node.js 22.x ou superior
- pnpm instalado: `npm install -g pnpm`
- Banco de dados MySQL/TiDB

#### Passos

**1. Clone o repositório**
\`\`\`bash
git clone https://github.com/lpazpinto/Warhammer40kcrusadeAI.git
cd Warhammer40kcrusadeAI
\`\`\`

**2. Instale as dependências**
\`\`\`bash
pnpm install
\`\`\`

**3. Configure as variáveis de ambiente**

Crie um arquivo \`.env\` na raiz:
\`\`\`env
DATABASE_URL=mysql://user:password@host:port/database
VITE_APP_ID=your_app_id
JWT_SECRET=your_jwt_secret
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://auth.manus.im
OWNER_OPEN_ID=your_open_id
OWNER_NAME=your_name
VITE_APP_TITLE=Warhammer 40k Crusade AI Manager
\`\`\`

**4. Configure o banco de dados**
\`\`\`bash
pnpm db:push
\`\`\`

**5. Inicie o servidor**
\`\`\`bash
pnpm dev
\`\`\`

**6. Acesse** `http://localhost:3000`

## 📁 Estrutura do Projeto

\`\`\`
├── client/           # Frontend React + Vite
│   └── src/pages/   # Páginas da aplicação
├── server/          # Backend Express + tRPC
│   ├── db.ts        # Acesso ao banco
│   ├── routers.ts   # Rotas tRPC
│   ├── armyParser.ts # Parser de listas
│   ├── hordeSpawn.ts # Sistema de spawn
│   ├── hordeAI.ts   # IA da Horda
│   └── postBattle.ts # Lógica pós-batalha
└── drizzle/         # Schema do banco
\`\`\`

## 🎯 Como Usar

### 1. Criar Campanha
- Faça login → "Nova Campanha"
- Escolha facção da Horda, modo de jogo e limite de pontos

### 2. Adicionar Jogadores
- Acesse a campanha → "Adicionar Jogador"
- Preencha nome, facção e destacamento

### 3. Importar Lista
- Na página do jogador → "Importar Lista"
- Cole o conteúdo do .txt exportado do app oficial
- Crusade Cards serão criados automaticamente

### 4. Jogar Batalha
- "Iniciar Batalha" → Configure tabuleiro e unidades
- Sistema faz spawn automático e controla a IA
- Registre resultados → XP e honours atualizados automaticamente

## 🛠️ Tecnologias

- React 19, TypeScript, Tailwind CSS 4, shadcn/ui
- Node.js, Express 4, tRPC 11
- MySQL/TiDB com Drizzle ORM
- Manus OAuth

## 📊 21 Facções Implementadas

Adepta Sororitas, Adeptus Custodes, Adeptus Mechanicus, Aeldari, Astra Militarum, Chaos Daemons, Chaos Knights, Chaos Space Marines, Death Guard, Drukhari, Genestealer Cults, Grey Knights, Imperial Knights, Leagues of Votann, Necrons, Orks, Space Marines, T'au Empire, Thousand Sons, Tyranids, World Eaters

## 🐛 Problemas Conhecidos

**OAuth no Preview**: O login pode não funcionar no preview de desenvolvimento. **Solução**: Publique a aplicação para ter um domínio fixo.

## 📝 Próximos Passos

- Interface completa de batalha turno-a-turno
- Sistema de eventos aleatórios e cartas de Misery
- Requisições de Cruzada
- Histórico e estatísticas

## 📄 Licença

Gerenciador não oficial para Warhammer 40.000. Warhammer 40.000 é marca registrada da Games Workshop Ltd.

---

**Desenvolvido com ❤️ para a comunidade Warhammer 40k**
