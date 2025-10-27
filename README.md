# Warhammer 40k Crusade AI Manager

Um sistema de gerenciamento de campanhas de Cruzada para Warhammer 40.000 (10ª Edição) com controle de inimigos por IA usando as regras do Horde Mode.

## 📋 Visão Geral

Este software foi desenvolvido para auxiliar jogadores de Warhammer 40k a gerenciar campanhas de Cruzada cooperativas, onde os jogadores enfrentam uma facção inimiga controlada por IA. O sistema implementa as regras oficiais de Cruzada e as regras do Horde Mode para criar uma experiência de jogo solo ou cooperativa rica e imersiva.

## ✨ Funcionalidades Implementadas

### ✅ Gerenciamento de Campanha
- Criação e gerenciamento de campanhas de Cruzada
- Suporte para múltiplos jogadores (Lord Commanders)
- Configuração de facção inimiga (Horda)
- Modos de jogo: 5 rodadas ou infinito
- Limites de pontos configuráveis (1000 ou 2000)

### ✅ Gerenciamento de Jogadores
- Cadastro de Lord Commanders
- Rastreamento de Pontos de Requisição (RP)
- Rastreamento de Pontos de Suprimento (SP) e Pontos de Comando (CP) do Horde Mode
- Contagem de batalhas e vitórias

### ✅ Importação de Exército
- Parser automático de listas de exército do aplicativo oficial
- Extração de unidades, modelos e armamentos
- Cálculo automático de Power Rating
- Criação automática de Crusade Cards

### ✅ Crusade Cards
- Rastreamento completo de status de unidades
- Experiência (XP) e Ranks
- Battle Honours, Battle Traits e Battle Scars
- Histórico de batalhas jogadas e sobrevividas
- Unidades inimigas destruídas

## 🏗️ Arquitetura Técnica

### Stack Tecnológico
- **Frontend**: React 19 + TypeScript + Tailwind CSS 4
- **Backend**: Node.js + Express + tRPC 11
- **Banco de Dados**: MySQL/TiDB (via Drizzle ORM)
- **Autenticação**: Manus OAuth

### Estrutura do Projeto
```
40k_crusade_ai_manager/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── components/    # Componentes reutilizáveis
│   │   └── lib/trpc.ts    # Cliente tRPC
├── server/                # Backend Node.js
│   ├── routers.ts         # Rotas tRPC (API)
│   ├── db.ts              # Funções de banco de dados
│   └── armyParser.ts      # Parser de listas de exército
├── drizzle/               # Schema e migrações do banco
│   └── schema.ts          # Definição das tabelas
└── shared/                # Código compartilhado
```

## 🚀 Como Executar

### Pré-requisitos
- Node.js 22+ instalado
- pnpm instalado (`npm install -g pnpm`)
- Acesso ao banco de dados (já configurado via variáveis de ambiente)

### Instalação

1. **Clone o repositório** (ou extraia os arquivos)
```bash
cd 40k_crusade_ai_manager
```

2. **Instale as dependências**
```bash
pnpm install
```

3. **Configure o banco de dados**
```bash
# O schema já foi criado, mas se precisar recriar:
node reset-db.mjs
```

4. **Inicie o servidor de desenvolvimento**
```bash
pnpm dev
```

5. **Acesse a aplicação**
   - Abra o navegador em `http://localhost:3000`
   - Faça login com sua conta Manus

## 📊 Modelo de Dados

### Tabelas Principais

#### `campaigns`
Armazena informações sobre campanhas de Cruzada.
- `id`: ID único
- `userId`: ID do criador
- `name`: Nome da campanha
- `status`: ongoing | completed | paused
- `hordeFaction`: Facção da Horda (ex: "Tyranids")
- `gameMode`: 5_rounds | infinite
- `pointsLimit`: 1000 ou 2000
- `currentBattleRound`: Rodada atual

#### `players`
Representa os Lord Commanders na campanha.
- `id`: ID único
- `campaignId`: ID da campanha
- `name`: Nome do Lord Commander
- `faction`: Facção do jogador
- `detachment`: Destacamento
- `crusadeForceName`: Nome da força de cruzada
- `requisitionPoints`: Pontos de Requisição
- `battleTally`: Total de batalhas
- `victories`: Vitórias
- `supplyPoints`: Pontos de Suprimento (Horde Mode)
- `commandPoints`: Pontos de Comando (Horde Mode)

#### `crusadeUnits`
Os Crusade Cards de cada unidade.
- `id`: ID único
- `playerId`: ID do jogador
- `unitName`: Nome da unidade
- `crusadeName`: Nome personalizado
- `unitType`: Tipo (Infantry, Vehicle, etc.)
- `powerRating`: Power Rating
- `pointsCost`: Custo em pontos
- `category`: CHARACTERS | BATTLELINE | OTHER DATASHEETS
- `models`: JSON com dados dos modelos
- `battlesPlayed`: Batalhas jogadas
- `battlesSurvived`: Batalhas sobrevividas
- `enemyUnitsDestroyed`: Unidades inimigas destruídas
- `experiencePoints`: XP
- `rank`: battle_ready | blooded | battle_hardened | heroic | legendary
- `battleHonours`: JSON com honras de batalha
- `battleTraits`: JSON com traits de batalha
- `battleScars`: JSON com cicatrizes

#### `battles`
Registra batalhas individuais.
- `id`: ID único
- `campaignId`: ID da campanha
- `battleNumber`: Número sequencial
- `deployment`: Tipo de deployment
- `missionPack`: Pack de missão usado
- `battleRound`: Rodada atual (1-5+)
- `status`: setup | in_progress | completed
- `victors`: JSON com IDs dos vencedores
- `hordeUnits`: JSON com unidades da Horda no campo

## 🔌 API (tRPC)

### Endpoints Disponíveis

#### Campanhas
```typescript
// Listar campanhas do usuário
trpc.campaign.list.useQuery()

// Obter campanha específica
trpc.campaign.get.useQuery({ id: 1 })

// Criar nova campanha
trpc.campaign.create.useMutation({
  name: "Armageddon",
  hordeFaction: "Tyranids",
  gameMode: "5_rounds",
  pointsLimit: 1000
})

// Atualizar campanha
trpc.campaign.update.useMutation({
  id: 1,
  status: "completed"
})
```

#### Jogadores
```typescript
// Listar jogadores de uma campanha
trpc.player.list.useQuery({ campaignId: 1 })

// Criar jogador
trpc.player.create.useMutation({
  campaignId: 1,
  name: "Lord Commander Dreir",
  faction: "Astra Militarum",
  detachment: "Combined Arms"
})

// Importar lista de exército
trpc.player.importArmy.useMutation({
  playerId: 1,
  armyListContent: "..." // Conteúdo do arquivo .txt
})
```

#### Unidades de Cruzada
```typescript
// Listar unidades de um jogador
trpc.crusadeUnit.list.useQuery({ playerId: 1 })

// Atualizar unidade
trpc.crusadeUnit.update.useMutation({
  id: 1,
  crusadeName: "The Iron Guard",
  experiencePoints: 10,
  rank: "blooded"
})
```

## 📝 Formato de Importação de Exército

O sistema aceita arquivos `.txt` exportados do aplicativo oficial de Warhammer 40k. Exemplo:

```
13th (950 Points)
Astra Militarum
Combined Arms
Incursion (1 000 Points)

CHARACTERS
Krieg Command Squad (65 Points)
• 1x Lord Commissar
◦ 1x Laspistol
◦ 1x Plasma pistol
◦ 1x Power fist
• 1x Veteran Guardsman
◦ 1x Chainsword
◦ 1x Plasma pistol

BATTLELINE
Death Korps of Krieg (145 Points)
• 2x Death Korps Watchmaster
◦ 2x Chainsword
◦ 2x Laspistol
• 18x Death Korps Trooper
◦ 18x Close combat weapon
◦ 17x Lasgun
◦ 1x Long-las
```

## 🔧 Desenvolvimento Futuro

### Funcionalidades Pendentes

#### Sistema de IA da Horda (Prioridade Alta)
- [ ] Importar tabelas de spawn do Excel (`40KHordeModeSpawnTablesMasterv1.0.xlsx`)
- [ ] Implementar lógica de rolagem 2D6 + modificadores
- [ ] Sistema de spawning por zonas
- [ ] IA de movimento (inimigo mais próximo > objetivo > borda)
- [ ] IA de tiro (alvo legal mais próximo)
- [ ] IA de carga (verificação de armas corpo-a-corpo)
- [ ] Gerenciamento de estado de batalha turno-a-turno

#### Lógica Pós-Batalha (Prioridade Alta)
- [ ] Rolagens automáticas de Out of Action
- [ ] Cálculo de XP (incluindo bônus do Horde Mode)
- [ ] Sistema de progressão de Ranks
- [ ] Seleção aleatória de Battle Honours
- [ ] Seleção aleatória de Battle Traits
- [ ] Sistema de Battle Scars

#### Interface do Usuário (Prioridade Média)
- [ ] Tela de seleção/criação de campanha
- [ ] Tela de configuração de jogadores
- [ ] Visualização de Order of Battle (formato oficial)
- [ ] Visualização de Crusade Cards
- [ ] Assistente de configuração de batalha (17 passos)
- [ ] Interface de batalha com orientações da IA
- [ ] Tela de resultados pós-batalha
- [ ] Tradução completa para Português (Brasil)

#### Recursos Adicionais
- [ ] Sistema de Requisições
- [ ] Mighty Champions (Epic Heroes)
- [ ] Eventos aleatórios (Warp Surge, etc.)
- [ ] Cartas de Misery do Horde Mode
- [ ] Missões Secundárias do Horde Mode
- [ ] Objetivos Secretos
- [ ] Exportação de relatórios de campanha

### Estrutura Sugerida para Implementação

#### 1. Horde Spawn System
```typescript
// server/hordeSpawn.ts
interface SpawnTable {
  faction: string;
  brackets: {
    '2': string[];      // No Spawn
    '3-4': string[];    // Low tier
    '5-6': string[];    // Mid tier
    '7-9': string[];    // High tier
    '10+': string[];    // Elite tier
  };
}

function rollSpawn(modifiers: number): number {
  const d1 = Math.floor(Math.random() * 6) + 1;
  const d2 = Math.floor(Math.random() * 6) + 1;
  return d1 + d2 + modifiers;
}

function getSpawnBracket(roll: number): string {
  if (roll === 2) return '2';
  if (roll <= 4) return '3-4';
  if (roll <= 6) return '5-6';
  if (roll <= 9) return '7-9';
  return '10+';
}
```

#### 2. Horde AI System
```typescript
// server/hordeAI.ts
interface HordeUnit {
  id: string;
  name: string;
  position: { x: number; y: number };
  weapons: string[];
  hasHeavyWeapons: boolean;
  hasMeleeWeapons: boolean;
}

interface PlayerUnit {
  id: string;
  position: { x: number; y: number };
  isVisible: boolean;
}

class HordeAI {
  determineMovement(unit: HordeUnit, enemies: PlayerUnit[], objectives: any[]): string {
    // 1. Closest visible enemy
    // 2. Closest visible objective
    // 3. Defender board edge
  }

  determineShooting(unit: HordeUnit, enemies: PlayerUnit[]): string {
    // Closest legal target
  }

  shouldCharge(unit: HordeUnit): boolean {
    // Check if majority has melee weapons
  }
}
```

#### 3. Post-Battle System
```typescript
// server/postBattle.ts
function rollOutOfAction(unit: CrusadeUnit): {
  result: 'survived' | 'battle_scar' | 'destroyed';
  scar?: string;
} {
  const roll = Math.floor(Math.random() * 6) + 1;
  // Implement Out of Action table logic
}

function calculateXP(unit: CrusadeUnit, battleResult: any): number {
  let xp = 1; // Base XP
  if (battleResult.completedObjective) xp += 2; // Horde Mode bonus
  if (unit.enemyUnitsDestroyed > 0) xp += 1;
  return xp;
}

function checkRankProgression(unit: CrusadeUnit): string {
  if (unit.experiencePoints >= 51) return 'legendary';
  if (unit.experiencePoints >= 31) return 'heroic';
  if (unit.experiencePoints >= 16) return 'battle_hardened';
  if (unit.experiencePoints >= 6) return 'blooded';
  return 'battle_ready';
}
```

## 🧪 Testes

Para testar a importação de exército, use o arquivo de exemplo:

```bash
# Crie um arquivo test-army.txt com o conteúdo de exemplo acima
# Depois use a API para importar
```

## 📚 Documentos de Referência

Os seguintes documentos foram usados como base para o desenvolvimento:

1. **WarhammerAIcrusade.docx** - Especificações principais do projeto
2. **Add-On-CrusadeIntegration.pdf** - Integração do Horde Mode com Crusade
3. **40KHordeModeRules(v1.0).docx** - Regras completas do Horde Mode
4. **40KHordeModeSpawnTablesMasterv1.0.xlsx** - Tabelas de spawn por facção

## 🤝 Contribuindo

Para continuar o desenvolvimento:

1. Escolha uma funcionalidade da lista "Desenvolvimento Futuro"
2. Implemente seguindo os padrões do código existente
3. Teste localmente com `pnpm dev`
4. Documente as mudanças

## 📄 Licença

Este projeto é um software de uso pessoal para gerenciamento de campanhas de Warhammer 40.000. Warhammer 40.000 é propriedade da Games Workshop Ltd.

## 🆘 Suporte

Para questões sobre o desenvolvimento:
1. Verifique a documentação acima
2. Consulte os arquivos de regras na pasta `/home/ubuntu/upload/`
3. Revise o código em `server/routers.ts` e `server/db.ts`

---

**Desenvolvido com ❤️ para a comunidade de Warhammer 40k**

