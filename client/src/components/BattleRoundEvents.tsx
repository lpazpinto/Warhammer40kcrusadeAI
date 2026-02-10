import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle, Flag, Skull, Zap, Shield, Swords, Trash2 } from "lucide-react";

interface BattleRoundEventsProps {
  battleRound: number;
  maxRounds: number;
  isStartOfRound: boolean;
  isEndOfRound: boolean;
  onDismiss: () => void;
  activeMiseryCards?: number[];
  activeSecondaryMissions?: number[];
}

// Events that happen at the start of each Battle Round
interface RoundEvent {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  skipFirstRound?: boolean;
}

// Horde Mode Start of Round Events (Section 3.2)
const START_OF_ROUND_EVENTS: RoundEvent[] = [
  {
    id: "discard_misery",
    title: "Descartar Cartas de Miséria Ativas",
    description: "Descarte todas as Cartas de Miséria ativas do round anterior.",
    icon: Trash2,
    color: "text-red-500",
    skipFirstRound: true,
  },
  {
    id: "reveal_misery",
    title: "Revelar Novas Cartas de Miséria",
    description: "Revele as Cartas de Miséria para este round (incluindo modificadores de missões falhadas).",
    icon: Skull,
    color: "text-red-500",
    skipFirstRound: true,
  },
  {
    id: "reveal_secondary",
    title: "Revelar Nova Missão Secundária",
    description: "Revele a nova Missão Secundária para este round.",
    icon: Flag,
    color: "text-blue-500",
  },
  {
    id: "resolve_start_missions",
    title: "Resolver Recompensas/Punições de Início de Round",
    description: "Resolva todas as recompensas e punições de missões que se aplicam no início do Battle Round.",
    icon: Zap,
    color: "text-yellow-500",
    skipFirstRound: true,
  },
  {
    id: "misery_effects",
    title: "Aplicar Efeitos de Miséria",
    description: "Verifique se alguma Carta de Miséria ativa tem efeitos que ocorrem no início do round.",
    icon: Skull,
    color: "text-orange-500",
    skipFirstRound: true,
  },
  {
    id: "reinforcements",
    title: "Verificar Reforços",
    description: "Unidades em Reservas Estratégicas podem entrar a partir do Round 2.",
    icon: Shield,
    color: "text-green-500",
    skipFirstRound: true,
  },
];

// Events that happen at the end of each Battle Round (Section 3.6)
const END_OF_ROUND_EVENTS: RoundEvent[] = [
  {
    id: "resolve_secondary_missions",
    title: "Resolver Missões Secundárias",
    description: "Todas as Missões Secundárias reveladas são resolvidas. Missões bem-sucedidas dão recompensas, missões falhadas dão punições.",
    icon: Flag,
    color: "text-blue-500",
  },
  {
    id: "check_survival",
    title: "Verificar Sobrevivência",
    description: "O objetivo é sobreviver até o último Battle Round. Verifique se ainda há unidades vivas.",
    icon: Swords,
    color: "text-purple-500",
  },
  {
    id: "carry_over_effects",
    title: "Transferir Efeitos para o Próximo Round",
    description: "Resultados de Misery Cards e Spawn Roll são adicionados às revelações e rolls do próximo round.",
    icon: AlertTriangle,
    color: "text-yellow-500",
  },
  {
    id: "remove_effects",
    title: "Remover Efeitos Temporários",
    description: "Remova efeitos que duram 'até o final do round' ou 'até o final do turno'.",
    icon: Shield,
    color: "text-gray-500",
  },
];

export default function BattleRoundEvents({
  battleRound,
  maxRounds,
  isStartOfRound,
  isEndOfRound,
  onDismiss,
  activeMiseryCards = [],
  activeSecondaryMissions = [],
}: BattleRoundEventsProps) {
  const [checkedEvents, setCheckedEvents] = useState<Set<string>>(new Set());
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isStartOfRound || isEndOfRound) {
      setIsOpen(true);
      setCheckedEvents(new Set());
    }
  }, [isStartOfRound, isEndOfRound, battleRound]);

  const events = isStartOfRound ? START_OF_ROUND_EVENTS : END_OF_ROUND_EVENTS;
  const filteredEvents = events.filter(event => {
    if (event.skipFirstRound && battleRound === 1) return false;
    return true;
  });

  const handleToggleEvent = (eventId: string) => {
    const newChecked = new Set(checkedEvents);
    if (newChecked.has(eventId)) {
      newChecked.delete(eventId);
    } else {
      newChecked.add(eventId);
    }
    setCheckedEvents(newChecked);
  };

  const handleDismiss = () => {
    setIsOpen(false);
    onDismiss();
  };

  const allEventsChecked = filteredEvents.every(event => checkedEvents.has(event.id));

  // Get spawn roll modifier for current round
  const getSpawnRollModifier = () => {
    if (battleRound >= 5) return "+2";
    if (battleRound >= 3) return "+1";
    return null;
  };

  // Get misery card count for current round
  const getMiseryCardCount = () => {
    if (battleRound >= 5) return 3;
    if (battleRound >= 2) return 1;
    return 0;
  };

  const spawnModifier = getSpawnRollModifier();
  const miseryCount = getMiseryCardCount();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleDismiss(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isStartOfRound ? (
              <>
                <Zap className="h-5 w-5 text-yellow-500" />
                Início do Battle Round {battleRound}
              </>
            ) : (
              <>
                <Flag className="h-5 w-5 text-blue-500" />
                Fim do Battle Round {battleRound}
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isStartOfRound 
              ? "Verifique os seguintes eventos antes de começar o round:"
              : "Verifique os seguintes eventos antes de avançar para o próximo round:"
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Round Progress */}
          <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
            <span className="text-sm font-medium">Progresso da Batalha</span>
            <Badge variant="outline">
              Round {battleRound} de {maxRounds}
            </Badge>
          </div>

          {/* Round-specific info badges */}
          {isStartOfRound && (
            <div className="flex flex-wrap gap-2">
              {miseryCount > 0 && (
                <Badge variant="destructive" className="gap-1">
                  <Skull className="h-3 w-3" />
                  {miseryCount} Carta(s) de Miséria neste round
                </Badge>
              )}
              <Badge variant="default" className="gap-1">
                <Flag className="h-3 w-3" />
                1 Missão Secundária
              </Badge>
              {spawnModifier && (
                <Badge variant="outline" className="gap-1 border-orange-500 text-orange-500">
                  <Swords className="h-3 w-3" />
                  Spawn Roll: {spawnModifier}
                </Badge>
              )}
            </div>
          )}

          {/* Active Cards/Missions Summary */}
          {(activeMiseryCards.length > 0 || activeSecondaryMissions.length > 0) && (
            <div className="flex gap-2">
              {activeMiseryCards.length > 0 && (
                <Badge variant="destructive" className="gap-1">
                  <Skull className="h-3 w-3" />
                  {activeMiseryCards.length} Miséria(s) Ativa(s)
                </Badge>
              )}
              {activeSecondaryMissions.length > 0 && (
                <Badge variant="default" className="gap-1">
                  <Flag className="h-3 w-3" />
                  {activeSecondaryMissions.length} Missão(ões) Ativa(s)
                </Badge>
              )}
            </div>
          )}

          {/* Event Checklist */}
          <div className="space-y-3">
            {filteredEvents.map((event) => {
              const Icon = event.icon;
              const isChecked = checkedEvents.has(event.id);
              
              return (
                <div
                  key={event.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                    isChecked ? "bg-muted/50 border-muted" : "bg-background border-border"
                  }`}
                >
                  <Checkbox
                    id={event.id}
                    checked={isChecked}
                    onCheckedChange={() => handleToggleEvent(event.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <label
                      htmlFor={event.id}
                      className={`flex items-center gap-2 font-medium cursor-pointer ${
                        isChecked ? "text-muted-foreground line-through" : ""
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${event.color}`} />
                      {event.title}
                    </label>
                    <p className={`text-sm mt-1 ${isChecked ? "text-muted-foreground" : "text-muted-foreground"}`}>
                      {event.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Spawn Roll Modifier Warning */}
          {isStartOfRound && spawnModifier && (
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
              <p className="text-sm text-orange-600 dark:text-orange-400 font-medium flex items-center gap-2">
                <Swords className="h-4 w-4" />
                {battleRound >= 5 
                  ? "Round 5+: A Horda recebe +2 no Spawn Roll! 3 Cartas de Miséria reveladas!"
                  : `Rounds 3-4: A Horda recebe +1 no Spawn Roll! 1 Carta de Miséria revelada.`
                }
              </p>
            </div>
          )}

          {/* Special Round Warnings */}
          {battleRound === maxRounds && isEndOfRound && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
              <p className="text-sm text-yellow-600 dark:text-yellow-400 font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Este é o último round! A batalha terminará após este round.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            onClick={handleDismiss}
            className="w-full"
            variant={allEventsChecked ? "default" : "secondary"}
          >
            {allEventsChecked ? "Continuar" : "Pular Verificação"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
