# 🎮 Warhammer 40k Crusade AI Manager

Sistema completo de gerenciamento de campanhas de Cruzada do Warhammer 40.000 com IA controlando a Horda inimiga.

---

## 📋 Status do Projeto

**Última Atualização:** 01 de Dezembro de 2025  
**Status:** 🚧 Em desenvolvimento ativo  
**Versão Atual:** 1.3.0 Beta

---

## 🎯 Funcionalidades Implementadas

### ✅ Gerenciamento de Campanhas
- Criação e gerenciamento de campanhas cooperativas
- Configuração de jogadores e facções
- Rastreamento de progresso (rodadas, vitórias, pontos)
- Sistema de Order of Battle completo
- Sistema de convites para jogadores
- Status de "pronto para batalha" para sincronização

### ✅ Sistema de IA da Horda
- **1200+ unidades** de 21 facções diferentes importadas do Excel
- Sistema de spawn baseado em 2D6 com modificadores por rodada
- Seleção automática de unidades por brackets de pontos
- **IA de movimento**: prioriza inimigo mais próximo → objetivo → borda do tabuleiro
- **IA de tiro**: seleciona alvo mais próximo dentro do alcance
- **IA de carga**: verifica armas corpo-a-corpo e distância

### ✅ Order of Battle
- Parser de exército (importação do app oficial)
- Gerenciamento de unidades com modelos e armas
- Sistema de XP e progressão de ranks
- Battle Honours e Battle Scars
- **Supply Limit** (1000 pontos iniciais, expansível via requisições)
- Edição de alias de unidades

### ✅ Requisições
- Sistema completo de requisições traduzido para português
- Requisition Points (RP) tracking
- Requisições com timing (a qualquer momento, antes da batalha, após a batalha)
- Compra de requisições durante setup de batalha
- 15+ requisições implementadas

### ✅ Missões
- **16 missões oficiais** (8 Tabela A, 8 Tabela B)
- Todas traduzidas para português:
  - Tabela A: Dominação Total, Distorção Empírica, Metamorfose, Iluminando o Caminho, Fluxo Temporal, Oferenda de Sangue, Lutando Contra a Gravidade, Selar as Fendas
  - Tabela B: Ponte Descarada, Sangue e Sombra, Fuga, Trilha de Sangue, Ataque Temporal, Véu Entre Mundos, Na Boca do Inferno, Assalto ao Portal Warp
- Sistema de seleção manual ou aleatória (2D3)

### ✅ Agendas
- **5 agendas normais** traduzidas: Assassinar, Linhas de Defesa, Ritos Warp, Limpar e Purgar, Desafio Sacrificial
- **18 agendas táticas** organizadas em 3 tabelas (A, B, C)
- Sistema de rolagem 2D6 para agendas táticas
- Estrutura completa de objetivos e recompensas em português

### ✅ Battle Traits
- **13 traits padrão** (positivos e negativos) disponíveis para todas as facções
- Framework para traits específicos por facção
- Exemplos implementados: Astra Militarum, Space Marines, Chaos Space Marines
- Categorias: combat, leadership, mobility, resilience, psychic
- Funções helper para busca e filtragem

### ✅ Wizard de Batalha
- **Passo 1:** Seleção de missão (Tabela A/B, manual/aleatória)
- **Passo 2:** Alocação de pontos e seleção de jogadores
- **Passo 3:** Compra de requisições
- **Passo 4:** Seleção de unidades (apenas unidades selecionadas participam)
- **Passo 5:** Confirmação final com resumo completo

### ✅ Sistema de Batalha em Tempo Real
- **Battle Phase Tracker**: Rastreamento completo das 5 fases (Command, Movement, Shooting, Charge, Fight)
- **Contador de turnos**: Controle de rodadas e alternância jogador/oponente
- **Persistência de estado**: Salva automaticamente fase atual e turno no banco
- **Histórico de fases**: Log completo de todas as mudanças de fase
- **Restauração de batalhas**: Continue batalhas pausadas exatamente de onde parou

### ✅ Sistema de Fase de Comando Detalhada
- **3 Sub-Passos Guiados**: Início da Fase → Choque de Batalha → Reabastecimento
- **Instruções em Português**: Cada passo explica as regras do Warhammer 40k 10th
- **Navegação Controlada**: Só avança para próximo passo quando jogador confirmar
- **Battle-shock Tests**: Lembretes para testar unidades abaixo de metade da força
- **Integração com Objetivos**: Sistema de tracking de objetivos controlados

### ✅ Sistema de Cartas de Reabastecimento (Supply Points)
- **25 Cartas Traduzidas**: Todas as cartas oficiais em português brasileiro
- **Supply Points (SP)**: Sistema completo de ganho e gasto de pontos
  - 1 SP por objetivo controlado
  - 1 SP por unidade Horda destruída
  - SP de Missões Secundárias
  - Dobro de SP em modo solo
- **Loja de Reabastecimento**: Interface para comprar cartas durante Fase de Comando
- **Validações Robustas**: Impede compras com SP insuficiente
- **Tracking por Jogador**: Cada jogador gerencia seus próprios SP
- **Histórico de Compras**: Registro de todas as cartas compradas por rodada
- **Categorias de Cartas**:
  - Táticas (Basic/Advanced Tactics, Emergency Evac)
  - Suprimentos (Ammo, Supply Drop, Share Supplies)
  - Fortificações (Deploy Fortification, Jamming Station, Shield Generator)
  - Reforços (Reinforcements, Field Promotion, Patched Up)
  - Ataques (Artillery Strike, Air Strike, Minefield, Razor Wire)

### ✅ Unit Tracker Panel
- **Rastreamento em tempo real**: Visualização de todas as unidades durante a batalha
- **Status visual**: Indicadores coloridos (verde=ativo, vermelho=destruído, amarelo=fora de ação)
- **Dados reais**: Integração com crusade units (nome, power rating, rank)
- **Quick Actions**: Botões rápidos para marcar unidades destruídas e adicionar kills
- **Rank badges**: Badges coloridos mostrando progressão (Battle Ready → Legendary)
- **Estatísticas**: Contadores de baixas por jogador

### ✅ Sistema de XP Automático
- **Cálculo automático**: XP base + sobrevivência + kills
- **Progressão de ranks**: Detecção automática de promoções (6/16/31/51 XP)
- **Distribuição de RP**: Requisition Points distribuídos após batalha
- **Atualização em lote**: Todas as unidades atualizadas simultaneamente

### ✅ Customização Visual
- **Army Badges**: Upload de emblemas de exército (S3 storage)
- **Battle Photos**: Galeria de fotos de batalhas
- **Endpoints de upload**: Sistema completo de upload de imagens

### ✅ Lógica Pós-Batalha
- Cálculo automático de XP com bônus do Horde Mode
- Sistema de progressão de ranks (Battle-ready → Blooded → Battle-hardened → Heroic → Legendary)
- Rolagens automáticas de Out of Action
- Sistema de Battle Honours e Battle Scars
- Atualização automática de Crusade Cards

### ✅ Interface em Português
- Todas as telas em português (Brasil)
- Design moderno com tema escuro
- Navegação intuitiva com sidebar
- Responsivo para diferentes tamanhos de tela

---

## 🚧 Roadmap de Desenvolvimento

### **Fase 1: Preparação Incremental** (Dias 15-26 Nov - 300 créditos/dia)

Cada dia, uma tarefa pequena e bem definida:

#### Semana 1: Estrutura de Dados
- ✅ **Dia 1 (15 Nov):** Battle Traits ✓
- ⏳ **Dia 2 (16 Nov):** Crusade Relics (padrão + por facção)
- ⏳ **Dia 3 (17 Nov):** Sistema de Badges
- ⏳ **Dia 4 (18 Nov):** Agendas específicas por facção
- ⏳ **Dia 5 (19 Nov):** Requisições específicas por facção

#### Semana 2: Schema e Backend
- ✅ **Dia 6 (20 Nov):** Tabelas de batalha (battles, battle_participants, battle_events) ✓
- ✅ **Dia 7 (21 Nov):** Endpoints tRPC para batalha (battle.start, battle.recordEvent, battle.list) ✓
- ✅ **Dia 8 (22 Nov):** Sistema de XP automático (battle.distributeXP) ✓
- ✅ **Dia 9 (23 Nov):** Campos de personalização (armyBadge, battlePhotos) ✓
- ✅ **Dia 10 (24 Nov):** Endpoints para upload de imagens (storage.uploadImage) ✓

#### Semana 3: UI de Batalha
- ✅ **Dia 11 (25 Nov):** Componente BattlePhaseTracker completo ✓
- ✅ **Dia 12 (26 Nov):** Persistência de estado da batalha ✓
- ✅ **Dia 13 (27 Nov):** Unit Tracker Panel com status visual ✓
- ✅ **Dia 14 (27 Nov):** Battle Participants Router (CRUD completo) ✓
- ✅ **Dia 15 (27 Nov):** Integração de dados reais de crusade units ✓
- ✅ **Dia 16 (27 Nov):** Quick Actions e rank display ✓

### **Fase 2: Próximas Implementações**

#### Próximas Funcionalidades
- ⏳ **Dia 17:** Integração Horde Spawn (botão no Phase Tracker)
- ⏳ **Dia 18:** Battle Summary Modal (estatísticas + distribuir XP)
- ⏳ **Dia 19:** Unit Details Popover (honours, traits, scars)
- ⏳ **Dia 20:** Agenda Tracker completo
- ⏳ **Dia 21:** Contabilização automática de agendas
- ⏳ **Dia 22:** Tela de resumo pós-batalha
- ⏳ **Dia 23:** UI de personalização (badges, fotos)

### **Fase 3: Mecânicas Únicas de Facção** (Futuro)
- [ ] Implementar mecânica única para cada facção (uma por vez)
- [ ] Bônus específicos durante batalhas
- [ ] Interação com sistema de IA

### **Fase 4: Melhorias de UI/UX** (Futuro)
- [ ] Personalização de brasões de exército
- [ ] Galeria de fotos de batalhas
- [ ] Histórico detalhado de campanhas
- [ ] Dashboard com estatísticas e gráficos

---

## 🛠️ Stack Tecnológica

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **shadcn/ui** - Component library
- **tRPC** - Type-safe API
- **Wouter** - Routing

### Backend
- **Node.js 22** - Runtime
- **Express 4** - Server framework
- **tRPC 11** - API layer
- **Drizzle ORM** - Database ORM
- **MySQL/TiDB** - Database

### Autenticação
- **Manus OAuth** - Sistema de autenticação

---

## 📁 Estrutura do Projeto

```
├── client/
│   ├── src/
│   │   ├── pages/          # Páginas da aplicação
│   │   ├── components/     # Componentes reutilizáveis
│   │   ├── hooks/          # Custom hooks
│   │   └── lib/            # Utilities e configurações
├── server/
│   ├── routers.ts          # Endpoints tRPC
│   ├── db.ts               # Database queries
│   ├── armyParser.ts       # Parser de exército
│   ├── hordeSpawn.ts       # Sistema de spawn da Horda
│   ├── hordeAI.ts          # IA da Horda
│   └── postBattle.ts       # Lógica pós-batalha
├── shared/
│   ├── agendas.ts          # Sistema de agendas (5 normais + 18 táticas)
│   ├── missions.ts         # 16 missões oficiais traduzidas
│   ├── requisitions.ts     # Sistema de requisições
│   ├── battleTraits.ts     # Battle traits (13 padrão + por facção)
│   ├── resupplyCards.ts    # 25 cartas de reabastecimento traduzidas
│   └── types.ts            # Tipos compartilhados
├── drizzle/
│   └── schema.ts           # Schema do banco de dados
└── README.md
```

---

## 🗄️ Schema do Banco de Dados

### Principais Tabelas

- **campaigns** - Campanhas de Crusade
- **players** - Jogadores (Lord Commanders)
- **crusadeUnits** - Unidades do Order of Battle
- **models** - Modelos individuais de cada unidade
- **weapons** - Armas de cada modelo
- **battleHonours** - Honras de batalha
- **battleScars** - Cicatrizes de batalha
- **battles** - Registro de batalhas com estado persistente
- **battleParticipants** - Participantes e unidades deployadas (com SP tracking)
- **battleEvents** - Eventos durante batalhas (em desenvolvimento)
- **resupplyCards** - Definições de 25 cartas de reabastecimento
- **purchasedCards** - Histórico de compras de cartas por batalha

---

## 🚀 Como Executar Localmente

### Pré-requisitos

1. **Node.js 22.x ou superior** - https://nodejs.org/
2. **Git** - https://git-scm.com/
3. **MySQL** (opcional - pode usar o do Manus) - https://dev.mysql.com/downloads/mysql/

### Instalação

```bash
# 1. Clonar repositório
git clone https://github.com/lpazpinto/Warhammer40kcrusadeAI.git
cd Warhammer40kcrusadeAI

# 2. Instalar pnpm
npm install -g pnpm

# 3. Instalar dependências
pnpm install

# 4. Configurar variáveis de ambiente
# Copie .env.example para .env e preencha

# 5. Executar migrações
pnpm db:push

# 6. Iniciar servidor de desenvolvimento
pnpm dev

# 7. Acessar aplicação
# http://localhost:3000
```

### Variáveis de Ambiente (.env)

```env
DATABASE_URL=mysql://root:@localhost:3306/crusade_db
JWT_SECRET=qualquer_texto_longo_e_aleatorio_aqui_12345
VITE_APP_TITLE=Warhammer 40k Crusade AI Manager
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://auth.manus.im
OWNER_NAME=Seu Nome
```

**Nota:** Para produção com OAuth funcionando, **publique no Manus** - todas as variáveis serão configuradas automaticamente!

---

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
- "Iniciar Batalha" → Configure missão, pontos, requisições e unidades
- Sistema faz spawn automático e controla a IA
- Registre resultados → XP e honours atualizados automaticamente

---

## 📊 21 Facções Implementadas

Adepta Sororitas, Adeptus Custodes, Adeptus Mechanicus, Aeldari, Astra Militarum, Chaos Daemons, Chaos Knights, Chaos Space Marines, Death Guard, Drukhari, Genestealer Cults, Grey Knights, Imperial Knights, Leagues of Votann, Necrons, Orks, Space Marines, T'au Empire, Thousand Sons, Tyranids, World Eaters

---

## 📝 Convenções de Código

### Commits
- Mensagens descritivas em inglês
- Formato: `Add/Fix/Update [feature] - [description]`
- Incluir lista de mudanças no corpo do commit
- Commit e push diário para GitHub

### Código
- TypeScript strict mode
- ESLint + Prettier
- Componentes funcionais com hooks
- tRPC para todas as chamadas de API
- Superjson para serialização

---

## 🔄 Workflow de Desenvolvimento

### Dias de Baixo Crédito (300/dia)
✅ Criar arquivos de dados (.ts com tipos e constantes)  
✅ Modificar schema (adicionar colunas/tabelas)  
✅ Criar endpoints tRPC simples  
❌ Evitar UIs complexas  
❌ Evitar lógica de negócio complicada  

### Dia de Alto Crédito (8000)
✅ Implementar páginas completas  
✅ Lógica de negócio complexa  
✅ Integração entre sistemas  
✅ Testes extensivos  

---

## 🐛 Problemas Conhecidos

**OAuth no Preview**: O login pode não funcionar no preview de desenvolvimento. **Solução**: Publique a aplicação para ter um domínio fixo.

---

## 📊 Estatísticas do Projeto

- **Linhas de Código:** ~20,000+
- **Commits:** 80+
- **Arquivos:** 130+
- **Tempo de Desenvolvimento:** 4 meses
- **Status:** Em desenvolvimento ativo
- **Testes:** 15 testes unitários (backend)

---

## 🤝 Contribuindo

Este é um projeto pessoal, mas sugestões são bem-vindas! Abra uma issue para discutir mudanças.

---

## 📄 Licença

Gerenciador não oficial para Warhammer 40.000. Warhammer 40.000 é marca registrada da Games Workshop Ltd.

---

**Desenvolvido com ❤️ para a comunidade Warhammer 40k**

*"In the grim darkness of the far future, there is only war... and good project management!"*
