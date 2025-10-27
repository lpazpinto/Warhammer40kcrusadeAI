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

### Opção 2: Executar Localmente no Windows

#### Pré-requisitos

1. **Node.js 22.x ou superior**
   - Baixe em: https://nodejs.org/
   - Durante a instalação, marque "Add to PATH"
   - Verifique a instalação: abra PowerShell e digite `node --version`

2. **Git para Windows**
   - Baixe em: https://git-scm.com/download/win
   - Use as configurações padrão durante a instalação

3. **Banco de Dados MySQL** (opcional - pode usar o do Manus)
   - Baixe XAMPP: https://www.apachefriends.org/
   - Ou MySQL Community: https://dev.mysql.com/downloads/mysql/

#### Passos de Instalação

**1. Clone o repositório**

Abra o PowerShell ou CMD e execute:

\`\`\`powershell
git clone https://github.com/lpazpinto/Warhammer40kcrusadeAI.git
cd Warhammer40kcrusadeAI
\`\`\`

**2. Instale o pnpm**

\`\`\`powershell
npm install -g pnpm
\`\`\`

**3. Instale as dependências do projeto**

\`\`\`powershell
pnpm install
\`\`\`

**4. Configure as variáveis de ambiente**

Crie um arquivo chamado `.env` na pasta raiz do projeto (use o Notepad):

\`\`\`env
DATABASE_URL=mysql://user:password@localhost:3306/crusade_db
VITE_APP_ID=seu_app_id_do_manus
JWT_SECRET=uma_chave_secreta_qualquer_aqui
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://auth.manus.im
OWNER_OPEN_ID=seu_open_id
OWNER_NAME=Seu Nome
VITE_APP_TITLE=Warhammer 40k Crusade AI Manager
\`\`\`

**Nota**: Se não tiver banco de dados local, você pode usar o banco fornecido pelo Manus ao publicar a aplicação.

**5. Configure o banco de dados** (se estiver usando MySQL local)

\`\`\`powershell
pnpm db:push
\`\`\`

**6. Inicie o servidor de desenvolvimento**

\`\`\`powershell
pnpm dev
\`\`\`

**7. Acesse a aplicação**

Abra seu navegador e vá para: `http://localhost:3000`

#### Solução de Problemas no Windows

**Erro "pnpm não é reconhecido":**
- Feche e reabra o PowerShell/CMD após instalar o pnpm
- Ou adicione manualmente ao PATH: `C:\Users\SeuUsuario\AppData\Roaming\npm`

**Erro de permissão no PowerShell:**
- Execute como Administrador
- Ou execute: `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`

**Porta 3000 já em uso:**
- Mude a porta no arquivo `package.json` ou
- Mate o processo: `netstat -ano | findstr :3000` e depois `taskkill /PID <numero> /F`

**Problemas com MySQL:**
- Verifique se o serviço MySQL está rodando no Painel de Controle → Serviços
- Ou use XAMPP e inicie o MySQL pelo painel de controle do XAMPP

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
