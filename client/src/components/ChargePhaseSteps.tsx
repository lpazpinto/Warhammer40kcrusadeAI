import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, CheckCircle2, Swords, Zap, Move, Shield, Users } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const CHARGE_PHASE_STEPS = [
  {
    id: "start",
    title: "4.1 Início da Fase de Carga",
    description: "Resolva todas as regras que dizem 'no início da sua Fase de Carga' antes de declarar cargas.",
    instructions: [
      "Ative habilidades que ocorrem 'no início da sua Fase de Carga'",
      "Resolva Estratagemas que precisam ser usados neste momento",
      "Aplique buffs e efeitos especiais de início de fase",
      "Prepare-se para declarar quais unidades vão carregar",
    ],
    icon: Swords,
  },
  {
    id: "select_unit",
    title: "4.2 Selecionar Unidade para Carregar",
    description: "Escolha uma unidade elegível do seu exército para declarar uma carga. Uma unidade pode carregar se não está em Combate e está a 12\" ou menos de pelo menos uma unidade inimiga.",
    instructions: [
      "Selecione uma unidade que ainda não carregou nesta fase",
      "Verifique se a unidade não está em Combate (Engagement Range)",
      "A unidade deve estar a 12\" ou menos de pelo menos um inimigo",
      "Unidades que Avançaram geralmente não podem carregar (exceto com regras especiais)",
      "Unidades que Caíram de Volta (Fell Back) geralmente não podem carregar",
    ],
    icon: Users,
  },
  {
    id: "declare_targets",
    title: "4.2a Declarar Alvos da Carga",
    description: "Declare quais unidades inimigas serão os alvos da carga. Você pode declarar múltiplos alvos se desejar, mas precisará terminar a 1\" de TODOS os alvos declarados.",
    instructions: [
      "Declare todos os alvos da carga antes de rolar os dados",
      "Você pode declarar múltiplos alvos (mais arriscado, precisa alcançar todos)",
      "Cada alvo deve estar a 12\" ou menos da unidade que carrega",
      "Lembre-se: você precisará terminar a 1\" de TODOS os alvos declarados",
      "Se não conseguir alcançar todos os alvos, a carga falha",
    ],
    icon: Swords,
  },
  {
    id: "overwatch",
    title: "4.2b Fire Overwatch (Reação do Oponente)",
    description: "Após declarar a carga, o oponente pode usar Fire Overwatch UMA VEZ por turno contra a unidade que está carregando. Overwatch permite disparar como se fosse a Fase de Tiro, mas acerta apenas em 6s.",
    instructions: [
      "O oponente pode usar Fire Overwatch uma vez por turno",
      "Overwatch custa 1CP (Estratagema)",
      "Ataques de Overwatch só acertam em 6 natural (não modificável)",
      "Resolva todos os ataques de Overwatch antes de rolar a carga",
      "Unidades com TORRENT acertam normalmente em Overwatch",
      "Se a unidade que carrega for destruída, a carga termina",
    ],
    icon: Zap,
  },
  {
    id: "charge_roll",
    title: "4.3 Rolagem de Carga (2D6)",
    description: "Role 2D6 para determinar a distância máxima que a unidade pode mover na carga. A unidade deve terminar a 1\" de pelo menos um alvo declarado (e de todos, se declarou múltiplos).",
    instructions: [
      "Role 2D6 - este é o máximo de polegadas que pode mover",
      "A unidade DEVE terminar a 1\" (Engagement Range) de pelo menos um alvo",
      "Se declarou múltiplos alvos, deve terminar a 1\" de TODOS",
      "Se não conseguir alcançar, a carga FALHA e a unidade não move",
      "Modificadores de carga (ex: +1 de habilidades) aplicam ao resultado",
      "Não pode mover através de unidades inimigas ou terreno intransponível",
    ],
    icon: Move,
  },
  {
    id: "charge_move",
    title: "4.3a Movimento de Carga",
    description: "Se a rolagem for suficiente, mova a unidade até a distância rolada. O primeiro modelo deve terminar a 1\" de um alvo declarado. Mantenha coerência da unidade.",
    instructions: [
      "Mova cada modelo até a distância rolada (não precisa usar toda)",
      "O primeiro modelo DEVE terminar a 1\" de um alvo declarado",
      "Mantenha coerência da unidade (modelos a 2\" uns dos outros)",
      "Não pode terminar a 1\" de unidades inimigas que NÃO foram alvos",
      "Modelos podem se mover em qualquer direção",
      "Após o movimento, a unidade está em Combate (Engagement Range)",
    ],
    icon: Move,
  },
  {
    id: "heroic_intervention",
    title: "4.4 Intervenções Heroicas",
    description: "No fim da Fase de Carga, unidades com a habilidade Heroic Intervention podem mover até 3\" em direção à unidade inimiga mais próxima, mesmo que não tenham sido alvos de carga.",
    instructions: [
      "Apenas unidades com a habilidade 'Heroic Intervention' podem fazer isso",
      "Geralmente CHARACTERs e algumas unidades especiais têm esta habilidade",
      "Movimento de até 3\" em direção ao inimigo mais próximo",
      "Deve terminar mais perto de uma unidade inimiga",
      "Não precisa terminar em Engagement Range (mas pode)",
      "Resolve todas as Intervenções Heroicas antes de passar para a Fase de Combate",
    ],
    icon: Shield,
  },
  {
    id: "end",
    title: "4.5 Fim da Fase de Carga",
    description: "Resolva todas as regras que dizem 'no fim da sua Fase de Carga'. Prepare-se para a Fase de Combate onde as unidades em Engagement Range irão lutar.",
    instructions: [
      "Resolva efeitos que ocorrem 'no fim da sua Fase de Carga'",
      "Verifique quais unidades estão em Combate (Engagement Range)",
      "Prepare-se para a Fase de Combate",
      "Lembre-se: unidades que carregaram com sucesso lutam primeiro na Fight phase",
      "Unidades que falharam a carga não podem lutar (não estão em Engagement Range)",
    ],
    icon: CheckCircle2,
  },
];

interface ChargePhaseStepsProps {
  /** Battle ID - included for consistency with other phase step components and future use */
  battleId: number;
  onComplete: () => void;
}

export default function ChargePhaseSteps({ 
  battleId, 
  onComplete,
}: ChargePhaseStepsProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const step = CHARGE_PHASE_STEPS[currentStep];
  const isLastStep = currentStep === CHARGE_PHASE_STEPS.length - 1;
  const StepIcon = step.icon;

  const handleNextStep = () => {
    // Mark current step as completed
    setCompletedSteps(prev => new Set([...Array.from(prev), currentStep]));

    if (isLastStep) {
      // Complete the Charge Phase
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
            <Swords className="h-5 w-5 text-yellow-500" />
            Fase de Carga - Passos Detalhados
          </span>
          <Badge variant="outline" className="text-sm">
            Passo {currentStep + 1} de {CHARGE_PHASE_STEPS.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Step Navigation */}
        <div className="flex flex-wrap gap-2 pb-4 border-b">
          {CHARGE_PHASE_STEPS.map((s, index) => {
            const Icon = s.icon;
            const isCompleted = completedSteps.has(index);
            const isCurrent = index === currentStep;
            
            return (
              <Button
                key={s.id}
                variant={isCurrent ? "default" : isCompleted ? "secondary" : "outline"}
                size="sm"
                onClick={() => handleStepClick(index)}
                className={`flex items-center gap-1 ${isCurrent ? "ring-2 ring-yellow-500" : ""}`}
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
            <div className="p-2 rounded-lg bg-yellow-500/10">
              <StepIcon className="h-6 w-6 text-yellow-500" />
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
            <Button onClick={handleNextStep} className="bg-yellow-600 hover:bg-yellow-700">
              {isLastStep ? "Completar Fase de Carga" : "Próximo Passo"}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
