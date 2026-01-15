import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, CheckCircle2, Target, Crosshair, Shield, Skull, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const SHOOTING_PHASE_STEPS = [
  {
    id: "start",
    title: "3.1 Início da Fase de Tiro",
    description: "Resolva todas as regras que dizem 'no início da sua Fase de Tiro' antes de selecionar unidades para disparar.",
    instructions: [
      "Ative habilidades que ocorrem 'no início da sua Fase de Tiro'",
      "Resolva Estratagemas que precisam ser usados neste momento",
      "Aplique buffs e efeitos especiais de início de fase",
      "Prepare-se para selecionar unidades que vão disparar",
    ],
    icon: Target,
  },
  {
    id: "select_unit",
    title: "3.2 Selecionar Unidade para Disparar",
    description: "Escolha uma unidade elegível do seu exército para disparar nesta fase. Uma unidade pode disparar se não está em Combate e não Avançou (a menos que tenha regras especiais).",
    instructions: [
      "Selecione uma unidade que ainda não disparou nesta fase",
      "Verifique se a unidade não está em Combate (Engagement Range)",
      "Unidades que Avançaram só podem disparar armas com ASSAULT",
      "Unidades que Caíram de Volta (Fell Back) geralmente não podem disparar",
      "Verifique regras especiais como 'Big Guns Never Tire' para MONSTERS e VEHICLES",
    ],
    icon: Crosshair,
  },
  {
    id: "select_targets",
    title: "3.2a Selecionar Alvos",
    description: "Escolha os alvos para TODAS as armas de alcance da unidade ANTES de rolar qualquer dado. Cada arma só pode mirar unidades onde pelo menos um modelo esteja em alcance e visível.",
    instructions: [
      "Declare todos os alvos para todas as armas antes de rolar dados",
      "Cada arma pode mirar uma unidade diferente se desejar",
      "Verifique alcance: pelo menos um modelo da unidade alvo deve estar em alcance",
      "Verifique linha de visão: pelo menos um modelo deve ser visível",
      "Armas com TORRENT não precisam de linha de visão",
      "Armas com INDIRECT FIRE podem mirar unidades não visíveis (com penalidades)",
    ],
    icon: Target,
  },
  {
    id: "hit_rolls",
    title: "3.2b Rolagens para Acertar (Hit Rolls)",
    description: "Role para acertar com cada arma. Compare o resultado com a característica BS (Ballistic Skill) da unidade.",
    instructions: [
      "Role 1D6 para cada ataque",
      "Resultado ≥ BS = Acerto",
      "1 natural sempre falha, 6 natural sempre acerta",
      "Aplique modificadores: -1 se o alvo está em Cobertura (contra armas sem IGNORES COVER)",
      "Armas com HEAVY: +1 para acertar se a unidade não se moveu",
      "Armas com ASSAULT: podem disparar após Avançar (sem penalidade)",
      "Acertos Críticos (6 natural): podem ter efeitos especiais dependendo das regras",
    ],
    icon: Crosshair,
  },
  {
    id: "wound_rolls",
    title: "3.2c Rolagens para Ferir (Wound Rolls)",
    description: "Para cada acerto, role para ferir. Compare a Força (S) da arma com a Resistência (T) do alvo.",
    instructions: [
      "S ≥ 2×T: Fere em 2+",
      "S > T: Fere em 3+",
      "S = T: Fere em 4+",
      "S < T: Fere em 5+",
      "S ≤ ½T: Fere em 6+",
      "1 natural sempre falha, 6 natural sempre fere",
      "Feridas Críticas (6 natural): podem ter efeitos especiais",
      "Armas com ANTI-X: 6 natural para acertar causa ferida automática contra alvos com keyword X",
    ],
    icon: Target,
  },
  {
    id: "saving_throws",
    title: "3.2d Testes de Resistência (Saving Throws)",
    description: "O oponente faz testes de resistência para cada ferida. Pode usar Armour Save ou Invulnerable Save.",
    instructions: [
      "Para cada ferida, o defensor rola 1D6",
      "Armour Save: Resultado ≥ (Save - AP da arma) = Salvo",
      "Invulnerable Save: Não é modificado por AP",
      "O defensor escolhe qual save usar (geralmente o melhor)",
      "1 natural sempre falha",
      "Cobertura: +1 ao Armour Save (se aplicável)",
      "Armas com DEVASTATING WOUNDS: Feridas Críticas ignoram saves",
    ],
    icon: Shield,
  },
  {
    id: "apply_damage",
    title: "3.2e Aplicar Dano e Remover Modelos",
    description: "Para cada save falhado, aplique o Dano (D) da arma. Remova modelos que perderam todas as feridas.",
    instructions: [
      "Cada save falhado causa Dano igual à característica D da arma",
      "Dano em excesso em um modelo é perdido (não passa para outros)",
      "O defensor escolhe quais modelos remover (geralmente os mais próximos)",
      "Modelos com múltiplas feridas: rastreie feridas perdidas",
      "Armas com FEEL NO PAIN: Role para ignorar cada ponto de dano",
      "Após resolver todos os ataques desta arma, passe para a próxima",
    ],
    icon: Skull,
  },
  {
    id: "next_unit",
    title: "3.2f Próxima Unidade",
    description: "Repita os passos 3.2a-3.2e para cada unidade que ainda pode disparar. Quando todas as unidades terminarem, prossiga para o fim da fase.",
    instructions: [
      "Selecione a próxima unidade elegível para disparar",
      "Repita todo o processo de seleção de alvos e ataques",
      "Continue até que todas as unidades tenham disparado",
      "Unidades podem escolher não disparar (para evitar Overwatch depois, por exemplo)",
      "Quando terminar, avance para o Fim da Fase de Tiro",
    ],
    icon: Crosshair,
  },
  {
    id: "end",
    title: "3.3 Fim da Fase de Tiro",
    description: "Resolva todas as regras que dizem 'no fim da sua Fase de Tiro'. Prepare-se para a Fase de Carga.",
    instructions: [
      "Resolva efeitos de 'no fim da sua Fase de Tiro'",
      "Verifique se alguma unidade foi destruída (para XP e objetivos)",
      "Prepare-se para a Fase de Carga",
      "Lembre-se: Overwatch é uma regra fora-de-fase que pode ser usada durante a Fase de Carga do oponente",
    ],
    icon: CheckCircle2,
  },
];

interface ShootingPhaseStepsProps {
  /** Battle ID - included for consistency with other phase step components and future use */
  battleId: number;
  onComplete: () => void;
}

export default function ShootingPhaseSteps({ 
  battleId, 
  onComplete,
}: ShootingPhaseStepsProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const step = SHOOTING_PHASE_STEPS[currentStep];
  const isLastStep = currentStep === SHOOTING_PHASE_STEPS.length - 1;
  const StepIcon = step.icon;

  const handleNextStep = () => {
    // Mark current step as completed
    setCompletedSteps(prev => new Set([...Array.from(prev), currentStep]));

    if (isLastStep) {
      // Complete the Shooting Phase
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
            <Crosshair className="h-5 w-5 text-orange-500" />
            Fase de Tiro - Passos Detalhados
          </span>
          <Badge variant="outline" className="text-sm">
            Passo {currentStep + 1} de {SHOOTING_PHASE_STEPS.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Step Progress - Compact view for many steps */}
        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2">
          {SHOOTING_PHASE_STEPS.map((s, index) => {
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => handleStepClick(index)}
                className={`p-2 rounded-lg text-center transition-all ${
                  index === currentStep
                    ? "bg-orange-500 text-white shadow-lg ring-2 ring-orange-300"
                    : completedSteps.has(index)
                    ? "bg-green-100 text-green-800 border-2 border-green-500"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                title={s.title}
              >
                <div className="flex flex-col items-center gap-1">
                  {completedSteps.has(index) ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                  <span className="text-xs font-medium">{index + 1}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Current Step Details */}
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className={`p-3 rounded-lg ${
              currentStep === SHOOTING_PHASE_STEPS.length - 1 
                ? "bg-green-100" 
                : "bg-orange-100"
            }`}>
              <StepIcon className={`h-6 w-6 ${
                currentStep === SHOOTING_PHASE_STEPS.length - 1 
                  ? "text-green-600" 
                  : "text-orange-600"
              }`} />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          </div>

          <Alert className="bg-orange-50 border-orange-200">
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-semibold text-orange-800">O que fazer:</p>
                <ul className="list-disc list-inside space-y-1">
                  {step.instructions.map((instruction, i) => (
                    <li key={i} className="text-sm text-orange-900">{instruction}</li>
                  ))}
                </ul>
              </div>
            </AlertDescription>
          </Alert>

          {/* Overwatch Note - show on end step */}
          {step.id === "end" && (
            <Alert className="bg-yellow-50 border-yellow-300">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <strong>Nota sobre Overwatch:</strong> Overwatch é uma regra "fora-de-fase". 
                Você dispara "como se fosse sua Fase de Tiro", mas sem ativar outras habilidades 
                ou estratagemas que especificamente requerem "sua Fase de Tiro".
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
            className="flex-1 gap-2 bg-orange-500 hover:bg-orange-600"
          >
            {isLastStep ? "Concluir Fase de Tiro" : "Próximo Passo"}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
