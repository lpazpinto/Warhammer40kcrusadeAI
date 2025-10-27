# Documento de Design e Especificações Técnicas

## 1. Objetivo do Projeto

Criar uma aplicação de software hospedada localmente para gerenciar campanhas de Cruzada de Warhammer 40.000 (10ª Edição) e controlar a facção inimiga (Horda) em batalhas cooperativas, utilizando as regras do "40k Horde Mode". O software deve ser totalmente em **Português (Brasil)**.

## 2. Arquitetura da Aplicação

A aplicação será desenvolvida como um sistema **Full-Stack** com uma arquitetura **Client-Server** leve, adequada para hospedagem local.

| Componente | Tecnologia | Racional |
| :--- | :--- | :--- |
| **Frontend (UI)** | React (via `web-static` scaffold) | Oferece uma interface rica e reativa, essencial para a experiência interativa durante a batalha. Facilita a criação de uma UI visualmente atraente e fácil de usar, conforme solicitado. |
| **Backend (API)** | Python/FastAPI (via `web-db-user` scaffold) | Python é a linguagem solicitada. FastAPI oferece alto desempenho e é ideal para construir uma API robusta e de fácil manutenção para a lógica de jogo e AI. |
| **Banco de Dados** | SQLite (padrão do `web-db-user`) | Perfeito para uma aplicação de hospedagem local. Simples de configurar, sem necessidade de servidor de banco de dados externo, e suficiente para armazenar dados de campanha e unidades. |
| **Persistência de Dados** | SQLAlchemy / Pydantic | Utilizado para mapeamento Objeto-Relacional (ORM) e validação de dados, garantindo a integridade dos dados da campanha. |

## 3. Estrutura de Dados (Modelo de Banco de Dados)

O banco de dados (DB) armazenará as seguintes entidades principais:

### 3.1. Campanha (Campaign)
| Campo (Field) | Tipo (Type) | Descrição (Description) |
| :--- | :--- | :--- |
| `id` | Integer | Chave primária. |
| `name` | String | Nome da campanha. |
| `status` | String | (Ongoing, Completed, Paused). |
| `horde_faction` | String | Facção da Horda (ex: Tyranids, Orks). |

### 3.2. Jogador (Player)
| Campo (Field) | Tipo (Type) | Descrição (Description) |
| :--- | :--- | :--- |
| `id` | Integer | Chave primária. |
| `campaign_id` | Integer | Chave estrangeira para Campanha. |
| `name` | String | Nome do Lord Commander. |
| `faction` | String | Facção do jogador. |
| `requisition_points` | Integer | Pontos de Requisição (RP). |
| `battle_tally` | Integer | Contagem de Batalhas. |
| `victories` | Integer | Vitórias. |

### 3.3. Unidade de Cruzada (CrusadeUnit) - O "Crusade Card"
| Campo (Field) | Tipo (Type) | Descrição (Description) |
| :--- | :--- | :--- |
| `id` | Integer | Chave primária. |
| `player_id` | Integer | Chave estrangeira para Jogador. |
| `unit_name` | String | Nome da unidade (ex: Death Korps of Krieg). |
| `crusade_name` | String | Nome dado pelo jogador (ex: "The Iron Guard"). |
| `type` | String | Tipo de unidade (para rolagens de Battle Trait). |
| `power_rating` | Integer | Valor de Power Rating. |
| `battles_played` | Integer | Batalhas Jogadas. |
| `battles_survived` | Integer | Batalhas Sobrevividas. |
| `enemy_units_destroyed` | Integer | Unidades Inimigas Destruídas. |
| `experience_points` | Integer | Pontos de Experiência (XP). |
| `rank` | String | (Battle-Ready, Battle-Hardened, etc.). |
| `battle_honours` | JSON/Text | Lista de Honras de Batalha. |
| `battle_scars` | JSON/Text | Lista de Cicatrizes de Batalha. |
| `out_of_action_status` | String | Status após a última batalha. |

## 4. Funcionalidades Chave e Implementação

### 4.1. Importação de Lista de Exército
*   **Lógica:** O backend receberá o arquivo `.txt` exportado do aplicativo oficial.
*   **Processamento:** Uma função de **parsing** será implementada em Python para extrair o nome do exército, facção, destacamento, pontos e, crucialmente, a lista de unidades com seus modelos e armamentos.
*   **Criação:** Os dados extraídos serão usados para popular a tabela `CrusadeUnit` (Crusade Cards) e `Player` (Order of Battle).

### 4.2. Lógica de Batalha da AI (Horde Mode)
*   **Spawning:** O backend implementará a lógica de rolagem de 2D6 + modificadores para determinar o *bracket* de unidades a serem geradas.
    *   O arquivo `40KHordeModeSpawnTablesMasterv1.0.xlsx` será lido e seus dados estruturados em um formato acessível (e.g., JSON ou DB) para consulta rápida.
*   **AI de Movimento/Ação:** Uma classe `HordeAI` será criada para encapsular a lógica de decisão da Horda (Seção 5. do Ruleset).
    *   A cada turno, o frontend enviará o estado atual do campo (posições de unidades, objetivos, unidades destruídas).
    *   O `HordeAI` retornará uma lista de ações (Movimento, Tiro, Carga) para cada unidade da Horda, seguindo a ordem de importância: **Closest visible enemy** > **Closest visible objective** > **Defender board edge**.
    *   A interface do usuário apresentará essas ações em Português para que o jogador as execute no tabuleiro físico.

### 4.3. Lógica Pós-Batalha
*   **Out of Action (O.o.A.):** O backend automatizará todas as rolagens de O.o.A. (Seção 14 do `WarhammerAIcrusade.docx`). O resultado (Battle Scar ou sobrevivência) será atualizado no `CrusadeUnit`.
*   **XP e RP:** A lógica de ganho de XP (incluindo o bônus de Horde Mode) e RP será aplicada automaticamente ao `Player` e `CrusadeUnit` com base no resultado da batalha.
*   **Ranks e Battle Honours:** A promoção de Ranks e a rolagem de Battle Honours e Battle Traits serão automatizadas, com o software solicitando o tipo de unidade (dropdown) apenas quando necessário.

## 5. Internacionalização (Português - Brasil)

Todo o texto da interface do usuário, mensagens de *feedback*, *logs* de AI e documentação será escrito em **Português (Brasil)**.

## 6. Próximos Passos

1.  Inicializar o projeto `40k_crusade_ai_manager` com o *scaffold* `web-db-user`.
2.  Estruturar o repositório GitHub e realizar o *commit* inicial.
3.  Implementar o modelo de dados e a camada de persistência.
4.  Desenvolver o *parser* de lista de exército (`.txt`).
5.  Implementar as funcionalidades de gerenciamento de campanha.
6.  Implementar a lógica de AI e Spawning da Horda.
7.  Desenvolver o Frontend em Português.
8.  Documentação e Testes.
