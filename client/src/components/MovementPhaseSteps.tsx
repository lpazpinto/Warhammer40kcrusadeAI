import { useState } from "react";
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, CheckCircle2, Circle, MoveRight, Users, Plane } from "lucide-react";
import { toast } from "sonner";

const MOVEMENT_PHASE_STEPS = [
  {
    id: "start",
    title: "Começo da Fase de Movimento",
    description: "Resolva habilidades e efeitos que ocorrem 'at the start of your Movement phase'",
    icon: Circle,
    details: [
      "Ative habilidades que disparam no início da fase",
      "Resolva efeitos de terreno ou missão",
      "Declare quaisquer ações especiais de movimento",
    ],
  },
  {
    id: "move_units",
    title: "Mover Unidades",
    description: "Escolha e mova suas unidades, uma de cada vez",
    icon: MoveRight,
    details: [
      "Start of Move Units step: Resolva regras que disparam aqui (abrir portas, operar hatchways)",
      "Para cada unidade elegível, escolha um tipo de movimento:",
      "  • Normal Move (Movimento Normal)",
      "  • Advance (Avançar)",
      "  • Fall Back (Recuar)",
      "  • Remain Stationary (Permanecer Estacionário)",
      "Unidades não selecionadas são consideradas Remain Stationary",
      "End of Move Units step: Resolva regras que disparam no final",
    ],
  },
  {
    id: "reinforcements",
    title: "Reforços (Reinforcements)",
    description: "Coloque unidades de Reserves/Deep Strike na mesa",
    icon: Plane,
    details: [
      "Coloque unidades em Reserves/Deep Strike seguindo regras da missão",
      "Unidades que entram contam como tendo feito Normal Move",
      "Unidades que entram não podem mover novamente nesta fase",
      "End of Reinforcements step: Resolva efeitos do fim da fase",
    ],
  },
];

interface MovementPhaseStepsProps {
  battleId: number;
  onComplete: () => void;
}

export default function MovementPhaseSteps({ 
  battleId, 
  onComplete,
}: MovementPhaseStepsProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const step = MOVEMENT_PHASE_STEPS[currentStep];
  const isLastStep = currentStep === MOVEMENT_PHASE_STEPS.length - 1;

  const handleNextStep = () => {
    // Mark current step as completed
    setCompletedSteps(prev => new Set([...Array.from(prev), currentStep]));

    if (isLastStep) {
      // Complete the Movement Phase
      toast.success("Fase de Movimento concluída!");
      onComplete();
    } else {
      // Move to next step
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (index: number) => {
    // Allow jumping to any step
    setCurrentStep(index);
  };

  return (
    <Card className="border-blue-200 bg-blue-50/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Fase de Movimento - Passos Detalhados</CardTitle>
          <Badge variant="outline" className="bg-white">
            Passo {currentStep + 1} de {MOVEMENT_PHASE_STEPS.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Step Progress Indicators */}
        <div className="flex items-center justify-between gap-2">
          {MOVEMENT_PHASE_STEPS.map((s, index) => {
            const StepIcon = s.icon;
            const isCompleted = completedSteps.has(index);
            const isCurrent = index === currentStep;

            return (
              <button
                key={s.id}
                onClick={() => handleStepClick(index)}
                className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                  isCurrent
                    ? "border-blue-500 bg-blue-100"
                    : isCompleted
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <StepIcon className={`h-5 w-5 ${isCurrent ? "text-blue-600" : "text-gray-400"}`} />
                  )}
                  <span className={`text-xs font-medium text-center ${
                    isCurrent ? "text-blue-900" : isCompleted ? "text-green-900" : "text-gray-600"
                  }`}>
                    Passo {index + 1}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Current Step Details */}
        <div className="bg-white rounded-lg border p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              {React.createElement(step.icon, { className: "h-6 w-6 text-blue-600" })}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-gray-900">{step.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{step.description}</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <h4 className="font-medium text-sm text-gray-700">O que fazer:</h4>
            <ul className="space-y-1.5">
              {step.details.map((detail, idx) => (
                <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                  {detail.startsWith("  •") ? (
                    <span className="ml-4">{detail}</span>
                  ) : (
                    <>
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>{detail}</span>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-3">
          {currentStep > 0 && (
            <Button
              onClick={handlePreviousStep}
              variant="outline"
              className="flex-1"
            >
              Passo Anterior
            </Button>
          )}
          <Button
            onClick={handleNextStep}
            className="flex-1"
          >
            {isLastStep ? (
              <>
                Concluir Fase de Movimento
                <CheckCircle2 className="ml-2 h-4 w-4" />
              </>
            ) : (
              <>
                Próximo Passo
                <ChevronRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
