import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, CheckCircle2, Swords, Move, Target, Zap, Shield, Users } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const FIGHT_PHASE_STEPS = [
  {
    id: "start",
    title: "5.1 Início da Fase de Combate",
    description: "Resolva todas as regras que dizem 'no início da Fase de Combate' antes de selecionar unidades para lutar.",
    instructions: [
      "Ative habilidades que ocorrem 'no início da Fase de Combate'",
      "Resolva Estratagemas que precisam ser usados neste momento",
      "Aplique buffs e efeitos especiais de início de fase",
      "Identifique quais unidades estão em Engagement Range (combate)",
      "Determine quais unidades têm 'Fights First' ou carregaram neste turno",
    ],
    icon: Swords,
  },
  {
    id: "fights_first",
    title: "5.2 Fights First (Luta Primeiro)",
    description: "Unidades que carregaram neste turno E unidades com a habilidade 'Fights First' lutam primeiro, alternando entre jogadores começando pelo jogador ativo.",
    instructions: [
      "Unidades que CARREGARAM neste turno lutam primeiro",
      "Unidades com habilidade 'Fights First' também lutam primeiro",
      "Jogador ativo escolhe uma unidade elegível para lutar",
      "Depois o oponente escolhe uma de suas unidades 'Fights First'",
      "Alternam até todas as unidades 'Fights First' terem lutado",
      "Se ambos os jogadores têm unidades 'Fights First', alternam começando pelo jogador ativo",
    ],
    icon: Zap,
  },
  {
    id: "remaining_combats",
    title: "5.3 Combates Restantes",
    description: "Após todas as unidades 'Fights First' terem lutado, as unidades restantes em combate lutam, alternando entre jogadores começando pelo jogador ativo.",
    instructions: [
      "Jogador ativo escolhe uma unidade elegível para lutar",
      "Depois o oponente escolhe uma de suas unidades",
      "Alternam até todas as unidades em combate terem lutado",
      "Uma unidade só pode lutar se estiver em Engagement Range (1\") de um inimigo",
      "Unidades com 'Fights Last' só lutam depois de todas as outras",
    ],
    icon: Users,
  },
  {
    id: "pile_in",
    title: "5.2a Pile In (Aproximar)",
    description: "Quando uma unidade é selecionada para lutar, cada modelo pode mover até 3\" para terminar mais perto da unidade inimiga mais próxima.",
    instructions: [
      "Cada modelo pode mover até 3\"",
      "O modelo DEVE terminar mais perto de uma unidade inimiga do que começou",
      "Não pode mover através de modelos inimigos",
      "Mantenha coerência da unidade (modelos a 2\" uns dos outros)",
      "Modelos que já estão em base-to-base não precisam mover",
      "Se um modelo não consegue terminar mais perto, ele não pode fazer Pile In",
    ],
    icon: Move,
  },
  {
    id: "select_targets",
    title: "5.2b Selecionar Alvos",
    description: "Escolha os alvos para todos os ataques corpo-a-corpo da unidade antes de rolar qualquer dado. Cada modelo só pode atacar unidades em Engagement Range.",
    instructions: [
      "Cada modelo escolhe uma arma de melee para usar",
      "Declare todos os alvos antes de rolar dados",
      "Modelos só podem atacar unidades em Engagement Range (1\")",
      "Modelos em base-to-base DEVEM atacar essa unidade primeiro",
      "Ataques podem ser divididos entre múltiplos alvos em Engagement Range",
      "Lembre-se das regras de armas (ex: algumas só podem atacar INFANTRY)",
    ],
    icon: Target,
  },
  {
    id: "hit_rolls",
    title: "5.2c Rolagens para Acertar (Hit Rolls)",
    description: "Role para acertar usando a Habilidade de Arma (WS - Weapon Skill) de cada modelo. Modificadores podem se aplicar.",
    instructions: [
      "Role 1D6 para cada ataque",
      "Compare com o WS (Weapon Skill) do modelo atacante",
      "WS 3+ significa que 3, 4, 5 ou 6 acerta",
      "1 natural sempre falha, independente de modificadores",
      "6 natural sempre acerta (Acerto Crítico)",
      "Acertos Críticos podem ter efeitos especiais (ex: LETHAL HITS)",
      "Aplique modificadores de hit (ex: -1 para atacar unidades com STEALTH)",
    ],
    icon: Target,
  },
  {
    id: "wound_rolls",
    title: "5.2d Rolagens para Ferir (Wound Rolls)",
    description: "Para cada acerto, role para ferir. Compare a Força (S) da arma com a Resistência (T) do alvo.",
    instructions: [
      "S ≥ 2×T: Fere em 2+",
      "S > T: Fere em 3+",
      "S = T: Fere em 4+",
      "S < T: Fere em 5+",
      "S ≤ ½T: Fere em 6+",
      "1 natural sempre falha, 6 natural sempre fere",
      "Feridas Críticas (6 natural): podem ter efeitos especiais",
    ],
    icon: Swords,
  },
  {
    id: "saving_throws",
    title: "5.2e Testes de Resistência (Saving Throws)",
    description: "O oponente faz testes de resistência para cada ferida. O AP (Armour Penetration) da arma modifica o save.",
    instructions: [
      "Para cada ferida, o defensor rola 1D6",
      "Compare com o Save do modelo (ex: 3+ significa 3, 4, 5, 6 salva)",
      "AP modifica o save (ex: AP-2 transforma 3+ em 5+)",
      "Invulnerable Saves não são afetados por AP",
      "Escolha o melhor save disponível (normal ou invulnerável)",
      "1 natural sempre falha, independente de modificadores",
      "Cover geralmente não se aplica em combate corpo-a-corpo",
    ],
    icon: Shield,
  },
  {
    id: "apply_damage",
    title: "5.2f Aplicar Dano e Remover Modelos",
    description: "Para cada save falhado, aplique o Dano (D) da arma. Remova modelos que perderam todas as feridas.",
    instructions: [
      "Cada save falhado causa Dano igual ao valor D da arma",
      "Aloque dano a um modelo por vez até ele ser destruído",
      "Dano em excesso é perdido (não passa para outro modelo)",
      "Modelos com múltiplas feridas rastreiam dano recebido",
      "Remova modelos destruídos como baixas",
      "Feel No Pain (FNP) é rolado para cada ponto de dano",
    ],
    icon: Target,
  },
  {
    id: "consolidate",
    title: "5.2g Consolidar",
    description: "Após fazer todos os ataques (ou se não tiver alvos), cada modelo pode mover até 3\" para terminar mais perto de uma unidade inimiga ou objetivo.",
    instructions: [
      "Cada modelo pode mover até 3\"",
      "Deve terminar mais perto de uma unidade inimiga OU de um objetivo",
      "Pode entrar em Engagement Range de novas unidades inimigas",
      "Mantenha coerência da unidade",
      "Consolidar pode 'prender' novas unidades em combate",
      "Unidades que consolidam em novas unidades não podem ser alvos de Overwatch",
      "Após Pile In + Ataques + Consolidate, a unidade 'lutou' nesta fase",
    ],
    icon: Move,
  },
  {
    id: "end",
    title: "5.4 Fim da Fase de Combate",
    description: "Resolva todas as regras que dizem 'no fim da Fase de Combate'. Prepare-se para passar o turno ou avançar para a próxima fase.",
    instructions: [
      "Resolva efeitos que ocorrem 'no fim da Fase de Combate'",
      "Verifique se alguma unidade foi destruída",
      "Verifique se alguma unidade precisa fazer teste de Morale (próxima fase)",
      "Se for o turno do jogador, prepare-se para a Fase de Morale",
      "Se for o turno do oponente, o turno dele termina após sua Fase de Morale",
    ],
    icon: CheckCircle2,
  },
];

interface FightPhaseStepsProps {
  /** Battle ID - included for consistency with other phase step components and future use */
  battleId: number;
  onComplete: () => void;
}

export default function FightPhaseSteps({ 
  battleId, 
  onComplete,
}: FightPhaseStepsProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const step = FIGHT_PHASE_STEPS[currentStep];
  const isLastStep = currentStep === FIGHT_PHASE_STEPS.length - 1;
  const StepIcon = step.icon;

  const handleNextStep = () => {
    // Mark current step as completed
    setCompletedSteps(prev => new Set(Array.from(prev).concat(currentStep)));

    if (isLastStep) {
      // Complete the Fight Phase
      onComplete();
    } else {
      // Move to next step
      setCurrentStep(currentStep + 1);
    }
  };

  const handleStepClick = (index: number) => {
    // Allow jumping to any step
    setCurrentStep(index);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Swords className="h-5 w-5 text-red-500" />
            Fase de Combate - Passos Detalhados
          </span>
          <Badge variant="outline" className="text-sm">
            Passo {currentStep + 1} de {FIGHT_PHASE_STEPS.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Step Navigation */}
        <div className="flex flex-wrap gap-2 pb-4 border-b">
          {FIGHT_PHASE_STEPS.map((s, index) => {
            const Icon = s.icon;
            const isCompleted = completedSteps.has(index);
            const isCurrent = index === currentStep;
            
            return (
              <Button
                key={s.id}
                variant={isCurrent ? "default" : isCompleted ? "secondary" : "outline"}
                size="sm"
                onClick={() => handleStepClick(index)}
                className={`flex items-center gap-1 ${isCurrent ? "ring-2 ring-red-500" : ""}`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                ) : (
                  <Icon className="h-3 w-3" />
                )}
                <span className="hidden sm:inline">{index + 1}</span>
              </Button>
            );
          })}
        </div>

        {/* Current Step Content */}
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-red-500/10">
              <StepIcon className="h-6 w-6 text-red-500" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{step.title}</h3>
              <p className="text-muted-foreground mt-1">{step.description}</p>
            </div>
          </div>

          <Alert>
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">O que fazer:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {step.instructions.map((instruction, i) => (
                    <li key={i}>{instruction}</li>
                  ))}
                </ul>
              </div>
            </AlertDescription>
          </Alert>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
            >
              Passo Anterior
            </Button>
            <Button onClick={handleNextStep} className="bg-red-600 hover:bg-red-700">
              {isLastStep ? "Completar Fase de Combate" : "Próximo Passo"}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
