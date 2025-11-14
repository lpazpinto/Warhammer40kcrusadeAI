# 🎮 Warhammer 40k Crusade AI Manager

Sistema completo de gerenciamento de campanhas de Cruzada do Warhammer 40.000 com IA controlando a Horda inimiga.

---

## 📋 Status do Projeto

**Última Atualização:** 14 de Novembro de 2025  
**Status:** 🚧 Em desenvolvimento ativo  
**Versão Atual:** 0.8.0 Beta

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
- ⏳ **Dia 6 (20 Nov):** Tabelas de batalha (battles, battle_participants, battle_events)
- ⏳ **Dia 7 (21 Nov):** Endpoints tRPC para batalha (battle.start, battle.recordEvent)
- ⏳ **Dia 8 (22 Nov):** Endpoints para XP automático (battle.distributeXP)
- ⏳ **Dia 9 (23 Nov):** Campos de personalização (armyBadge, battlePhotos)
- ⏳ **Dia 10 (24 Nov):** Endpoints para upload de imagens

#### Semana 3: UI Preparatória
- ⏳ **Dia 11 (25 Nov):** Componente BattlePhaseTracker (UI básica)
- ⏳ **Dia 12 (26 Nov):** Componente AgendaTracker (UI básica)

### **Fase 2: Implementação Massiva** (Dia 27 Nov - 8000 créditos)

#### Manhã (2500 créditos): Sistema de Batalha Core
1. Implementar página BattlePlay.tsx completa
2. Rastreamento de fases (Command, Movement, Shooting, Charge, Fight, Morale)
3. Sistema de eventos de batalha (unidade destruída, XP ganho, etc.)
4. Controle de IA da Horda integrado

#### Tarde (2500 créditos): Contabilização Automática de Agendas
1. Lógica de detecção de condições de agenda
2. Sistema de notificações quando agenda é completada
3. Distribuição automática de XP/RP baseado em agendas completadas

#### Noite (2500 créditos): Pós-Batalha e Personalização
1. Tela de resumo pós-batalha com XP distribuído
2. Retorno automático para campanha com dados atualizados
3. Progressão automática de fase de batalha
4. UI de personalização (brasão, fotos de batalhas)

#### Buffer (500 créditos): Testes e Ajustes

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
- **battles** - Registro de batalhas (em desenvolvimento)
- **battleEvents** - Eventos durante batalhas (em desenvolvimento)

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

- **Linhas de Código:** ~15,000+
- **Commits:** 55+
- **Arquivos:** 100+
- **Tempo de Desenvolvimento:** 3 meses
- **Status:** Em desenvolvimento ativo

---

## 🤝 Contribuindo

Este é um projeto pessoal, mas sugestões são bem-vindas! Abra uma issue para discutir mudanças.

---

## 📄 Licença

Gerenciador não oficial para Warhammer 40.000. Warhammer 40.000 é marca registrada da Games Workshop Ltd.

---

**Desenvolvido com ❤️ para a comunidade Warhammer 40k**

*"In the grim darkness of the far future, there is only war... and good project management!"*
