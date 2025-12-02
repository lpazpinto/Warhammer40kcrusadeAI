import { useState } from "react";
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, CheckCircle2, Circle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ObjectivesInputModal from "@/components/ObjectivesInputModal";
import { toast } from "sonner";

const COMMAND_PHASE_STEPS = [
  {
    id: "start",
    title: "Início da Fase de Comando",
    description: "Resolva todas as regras que dizem 'durante sua Fase de Comando' ou 'no início da sua Fase de Comando'.",
    instructions: [
      "Ative habilidades que ocorrem no início da Fase de Comando",
      "Resolva efeitos de cartas ou habilidades especiais",
      "Prepare-se para a etapa de Choque de Batalha",
    ],
  },
  {
    id: "battleshock",
    title: "Choque de Batalha",
    description: "Para cada unidade sua no campo que esteja Abaixo de Metade da Força (Below Half-strength), faça um teste de Choque de Batalha (2D6 ≥ Liderança).",
    instructions: [
      "Identifique unidades com menos de 50% dos modelos iniciais",
      "Role 2D6 para cada unidade identificada",
      "Se falhar (resultado < Liderança), a unidade fica em Choque de Batalha até o início da sua próxima Fase de Comando",
      "Unidades em Choque de Batalha não podem usar Estratagemas",
    ],
  },
  {
    id: "resupply",
    title: "Reabastecimento",
    description: "Ganhe Pontos de Suprimento (SP) e compre Cartas de Reabastecimento para apoiar suas tropas.",
    instructions: [
      "Ganhe 1 SP por objetivo controlado (todos os jogadores)",
      "Ganhe 1 SP por unidade Horda destruída por você",
      "Ganhe SP de Missões Secundárias bem-sucedidas",
      "Compre Cartas de Reabastecimento com seus SP acumulados",
    ],
  },
];

interface CommandPhaseStepsProps {
  battleId: number;
  onComplete: () => void;
  onOpenResupply: () => void;
  playerCount: number;
  isSoloMode: boolean;
  onDistributeSP: (objectivesCount: number) => void;
}

export default function CommandPhaseSteps({ 
  battleId, 
  onComplete,
  onOpenResupply,
  playerCount,
  isSoloMode,
  onDistributeSP
}: CommandPhaseStepsProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [showObjectivesModal, setShowObjectivesModal] = useState(false);
  const [spDistributed, setSpDistributed] = useState(false);

  // Auto-open objectives modal when entering Step 3 (Reabastecimento)
  React.useEffect(() => {
    if (currentStep === 2 && !spDistributed) {
      // Step 3 is index 2 (0-indexed)
      setShowObjectivesModal(true);
    }
  }, [currentStep, spDistributed]);

  const step = COMMAND_PHASE_STEPS[currentStep];
  const isLastStep = currentStep === COMMAND_PHASE_STEPS.length - 1;

  const handleNextStep = () => {
    // If on resupply step and SP not distributed yet, show modal first
    if (step.id === "resupply" && !spDistributed) {
      setShowObjectivesModal(true);
      return;
    }

    // Mark current step as completed
    setCompletedSteps(prev => new Set([...Array.from(prev), currentStep]));

    if (isLastStep) {
      // Complete the Command Phase
      onComplete();
    } else {
      // Move to next step
      setCurrentStep(currentStep + 1);
    }
  };

  const handleDistributeSP = (objectivesCount: number) => {
    onDistributeSP(objectivesCount);
    setSpDistributed(true);
    toast.success(`SP distribuídos! Cada jogador recebeu ${isSoloMode ? objectivesCount * 2 : objectivesCount} SP de objetivos.`);
  };

  const handleStepClick = (index: number) => {
    // Allow jumping to any step
    setCurrentStep(index);
  };

  return (
    <>
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Fase de Comando - Passos Detalhados</span>
          <Badge variant="outline" className="text-sm">
            Passo {currentStep + 1} de {COMMAND_PHASE_STEPS.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Step Progress */}
        <div className="flex gap-2">
          {COMMAND_PHASE_STEPS.map((s, index) => (
            <button
              key={s.id}
              onClick={() => handleStepClick(index)}
              className={`flex-1 p-3 rounded-lg text-left transition-all ${
                index === currentStep
                  ? "bg-blue-500 text-white shadow-lg"
                  : completedSteps.has(index)
                  ? "bg-green-100 text-green-800 border-2 border-green-500"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {completedSteps.has(index) ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <Circle className="h-4 w-4" />
                )}
                <span className="text-xs font-medium">Passo {index + 1}</span>
              </div>
              <p className="text-sm font-semibold line-clamp-2">{s.title}</p>
            </button>
          ))}
        </div>

        {/* Current Step Details */}
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-bold mb-2">{step.title}</h3>
            <p className="text-muted-foreground">{step.description}</p>
          </div>

          <Alert>
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-semibold">O que fazer:</p>
                <ul className="list-disc list-inside space-y-1">
                  {step.instructions.map((instruction, i) => (
                    <li key={i} className="text-sm">{instruction}</li>
                  ))}
                </ul>
              </div>
            </AlertDescription>
          </Alert>

          {/* Resupply Actions (only on step 3) */}
          {step.id === "resupply" && (
            <div className="space-y-3">
              {!spDistributed && (
                <Alert className="bg-yellow-50 border-yellow-200">
                  <AlertDescription className="text-yellow-800">
                    ⚠️ Você precisa distribuir SP de objetivos antes de abrir a Loja de Reabastecimento.
                  </AlertDescription>
                </Alert>
              )}
              <Button
                variant="default"
                size="lg"
                onClick={onOpenResupply}
                className="w-full"
                disabled={!spDistributed}
              >
                Abrir Loja de Reabastecimento
              </Button>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="flex-1"
          >
            Passo Anterior
          </Button>
          <Button
            onClick={handleNextStep}
            className="flex-1 gap-2"
          >
            {isLastStep ? "Concluir Fase de Comando" : "Próximo Passo"}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>

    {/* Objectives Input Modal */}
    <ObjectivesInputModal
      open={showObjectivesModal}
      onClose={() => setShowObjectivesModal(false)}
      onConfirm={handleDistributeSP}
      playerCount={playerCount}
      isSoloMode={isSoloMode}
    />
  </>);
}
