import { useState } from "react";
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, CheckCircle2, Circle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ObjectivesInputModal from "@/components/ObjectivesInputModal";
import { toast } from "sonner";

/**
 * Command Phase steps for Warhammer 40K Horde Mode
 * Each step represents a sequential action during the Command Phase
 */
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

/**
 * Props for the CommandPhaseSteps component
 * Manages the multi-step Command Phase workflow
 */
interface CommandPhaseStepsProps {
  /** Battle identifier */
  battleId: number;
  /** Callback when Command Phase is completed */
  onComplete: () => void;
  /** Callback to open resupply shop */
  onOpenResupply: () => void;
  /** Total number of players in the battle */
  playerCount: number;
  /** Whether the battle is in solo mode */
  isSoloMode: boolean;
  /** Whether it's currently the Horde's turn (disables SP distribution) */
  isHordeTurn?: boolean;
  /** Callback to distribute Supply Points based on objectives */
  onDistributeSP: (objectivesCount: number) => void;
}

/**
 * CommandPhaseSteps Component
 * 
 * Guides the player through the Command Phase with detailed step-by-step instructions.
 * Handles SP distribution during player turns and auto-completes during Horde turns.
 * 
 * Features:
 * - Multi-step workflow (Start, Battle Shock, Resupply)
 * - Objectives input modal for SP distribution
 * - Horde turn restrictions (no SP distribution, no resupply shop)
 * - Step progress tracking
 * - Navigation between steps
 * - Safety checks to prevent infinite loops when completing the phase
 * 
 * @component
 * @example
 * ```tsx
 * <CommandPhaseSteps
 *   battleId={1}
 *   onComplete={() => console.log('Phase complete')}
 *   onOpenResupply={() => console.log('Open shop')}
 *   playerCount={2}
 *   isSoloMode={false}
 *   isHordeTurn={false}
 *   onDistributeSP={(count) => console.log(`Distributed ${count} objectives`)}
 * />
 * ```
 */
export default function CommandPhaseSteps({ 
  battleId, 
  onComplete,
  onOpenResupply,
  playerCount,
  isSoloMode,
  isHordeTurn = false,
  onDistributeSP
}: CommandPhaseStepsProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [showObjectivesModal, setShowObjectivesModal] = useState(false);
  const [spDistributed, setSpDistributed] = useState(false);

  // Auto-open objectives modal when entering Step 3 (Reabastecimento) - but not during Horde turn
  React.useEffect(() => {
    if (currentStep === 2 && !spDistributed && !isHordeTurn) {
      // Step 3 is index 2 (0-indexed)
      setShowObjectivesModal(true);
    }
  }, [currentStep, spDistributed, isHordeTurn]);

  const step = COMMAND_PHASE_STEPS[currentStep];
  const isLastStep = currentStep === COMMAND_PHASE_STEPS.length - 1;

  /**
   * Safety check: if step is undefined, close the panel
   * This prevents infinite loops when completing the last substep
   * 
   * When currentStep >= COMMAND_PHASE_STEPS.length, the phase should be complete
   * and the component should close naturally instead of attempting state updates during render
   * 
   * Since currentStep is controlled only by internal functions that maintain valid values (0 to 2),
   * this condition should rarely occur, but provides a safety net for edge cases
   */
  if (!step) {
    return null;
  }

  /**
   * Handles advancement to the next step or completion of the Command Phase
   * Prevents resupply step from advancing until SP is distributed (unless Horde turn)
   * Auto-completes resupply step during Horde turns
   */
  const handleNextStep = () => {
    // If on resupply step and SP not distributed yet, show modal first (but not during Horde turn)
    if (step.id === "resupply" && !spDistributed && !isHordeTurn) {
      setShowObjectivesModal(true);
      return;
    }
    
    // During Horde turn, skip SP distribution and just advance
    if (step.id === "resupply" && isHordeTurn) {
      // Auto-complete resupply step during Horde turn
      setCompletedSteps(prev => new Set([...Array.from(prev), currentStep]));
      setCurrentStep(currentStep + 1);
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

  /**
   * Handles SP distribution based on objectives controlled
   * Calculates SP for each player and displays a success message
   * 
   * @param objectivesCount - Number of objectives controlled by the player
   */
  const handleDistributeSP = (objectivesCount: number) => {
    onDistributeSP(objectivesCount);
    setSpDistributed(true);
    toast.success(`SP distribuídos! Cada jogador recebeu ${isSoloMode ? objectivesCount * 2 : objectivesCount} SP de objetivos.`);
  };

  /**
   * Allows jumping to a specific step in the Command Phase
   * 
   * @param index - Index of the step to navigate to
   */
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

          {/* Resupply Actions (only on step 3 and not Horde turn) */}
          {step.id === "resupply" && !isHordeTurn && (
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
          
          {/* Horde turn message */}
          {step.id === "resupply" && isHordeTurn && (
            <Alert className="bg-gray-50 border-gray-200">
              <AlertDescription className="text-gray-700">
                ℹ️ Durante o turno da Horda, não há distribuição de SP ou acesso à Loja de Reabastecimento.
              </AlertDescription>
            </Alert>
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
