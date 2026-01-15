import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, RotateCcw, Skull } from "lucide-react";
import { toast } from "sonner";

const BATTLE_PHASES = [
  { id: "command", name: "Comando", color: "bg-blue-500" },
  { id: "movement", name: "Movimento", color: "bg-green-500" },
  { id: "shooting", name: "Tiro", color: "bg-red-500" },
  { id: "charge", name: "Carga", color: "bg-orange-500" },
  { id: "fight", name: "Combate", color: "bg-purple-500" },
] as const;

interface BattlePhaseTrackerProps {
  battleId?: number;
  initialPhase?: string;
  initialRound?: number;
  initialPlayerTurn?: "player" | "opponent";
  onPhaseChange?: (phase: string, round: number, playerTurn: "player" | "opponent") => void;
  onSpawnHorde?: () => void;
  isSpawningHorde?: boolean;
  canAdvancePhase?: boolean; // Block phase advancement when in sub-steps
}

export default function BattlePhaseTracker({ 
  battleId,
  initialPhase = "command",
  initialRound = 1,
  initialPlayerTurn = "opponent",  // Horde always plays first
  onPhaseChange,
  onSpawnHorde,
  isSpawningHorde = false,
  canAdvancePhase = true
}: BattlePhaseTrackerProps) {
  // Find initial phase index
  const initialPhaseIndex = BATTLE_PHASES.findIndex(p => p.id === initialPhase);
  
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(initialPhaseIndex >= 0 ? initialPhaseIndex : 0);
  const [currentRound, setCurrentRound] = useState(initialRound);
  const [playerTurn, setPlayerTurn] = useState<"player" | "opponent">(initialPlayerTurn);

  const currentPhase = BATTLE_PHASES[currentPhaseIndex];

  const handleNextPhase = () => {
    let nextPhaseIndex = currentPhaseIndex;
    let nextRound = currentRound;
    let nextPlayerTurn = playerTurn;
    
    if (currentPhaseIndex === BATTLE_PHASES.length - 1) {
      // End of round - switch to opponent or next round
      if (playerTurn === "player") {
        nextPlayerTurn = "opponent";
        nextPhaseIndex = 0;
        setPlayerTurn("opponent");
        setCurrentPhaseIndex(0);
      } else {
        nextPlayerTurn = "player";
        nextPhaseIndex = 0;
        nextRound = currentRound + 1;
        setPlayerTurn("player");
        setCurrentPhaseIndex(0);
        setCurrentRound(currentRound + 1);
      }
    } else {
      nextPhaseIndex = currentPhaseIndex + 1;
      setCurrentPhaseIndex(currentPhaseIndex + 1);
    }
    
    // Call onPhaseChange with the NEW phase, not the old one
    onPhaseChange?.(BATTLE_PHASES[nextPhaseIndex].id, nextRound, nextPlayerTurn);
  };

  const handlePreviousPhase = () => {
    if (currentPhaseIndex === 0) {
      if (playerTurn === "opponent") {
        setPlayerTurn("player");
        setCurrentPhaseIndex(BATTLE_PHASES.length - 1);
      } else if (currentRound > 1) {
        setPlayerTurn("opponent");
        setCurrentPhaseIndex(BATTLE_PHASES.length - 1);
        setCurrentRound(currentRound - 1);
      }
    } else {
      setCurrentPhaseIndex(currentPhaseIndex - 1);
    }
  };

  const handleReset = () => {
    setCurrentPhaseIndex(0);
    setCurrentRound(1);
    setPlayerTurn("player");
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Rastreador de Fases</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reiniciar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Round and Turn Info */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Turno de Batalha</p>
            <p className="text-2xl font-bold">{currentRound}</p>
          </div>
          <Badge variant={playerTurn === "player" ? "default" : "secondary"} className="text-lg px-4 py-2">
            {playerTurn === "player" ? "Seu Turno" : "Turno do Oponente"}
          </Badge>
        </div>

        {/* Current Phase Display */}
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Fase Atual</p>
            <div className={`${currentPhase.color} text-white rounded-lg p-6`}>
              <h3 className="text-3xl font-bold">{currentPhase.name}</h3>
            </div>
          </div>

          {/* Phase Progress Bar */}
          <div className="flex gap-2">
            {BATTLE_PHASES.map((phase, index) => (
              <div
                key={phase.id}
                className={`flex-1 h-2 rounded-full transition-all ${
                  index === currentPhaseIndex
                    ? phase.color
                    : index < currentPhaseIndex
                    ? "bg-gray-400"
                    : "bg-gray-200"
                }`}
              />
            ))}
          </div>

          {/* Phase List */}
          <div className="grid grid-cols-5 gap-2">
            {BATTLE_PHASES.map((phase, index) => (
              <button
                key={phase.id}
                onClick={() => {
                  setCurrentPhaseIndex(index);
                  onPhaseChange?.(phase.id, currentRound, playerTurn);
                }}
                className={`p-3 rounded-lg text-sm font-medium transition-all ${
                  index === currentPhaseIndex
                    ? `${phase.color} text-white shadow-lg scale-105`
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {phase.name}
              </button>
            ))}
          </div>
        </div>

        {/* Spawn Horde Button - Only visible during Horde (opponent) turn in Command Phase */}
        {currentPhase.id === "command" && playerTurn === "opponent" && onSpawnHorde && (
          <Button
            variant="destructive"
            onClick={onSpawnHorde}
            disabled={isSpawningHorde}
            className="w-full gap-2"
            size="lg"
          >
            <Skull className="h-5 w-5" />
            {isSpawningHorde ? "Spawnando Horda..." : "Spawn Horda (2D6)"}
          </Button>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handlePreviousPhase}
            disabled={currentRound === 1 && currentPhaseIndex === 0 && playerTurn === "opponent"}  // Can't go back before first phase of first round
            className="flex-1 gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Fase Anterior
          </Button>
          <Button
            onClick={handleNextPhase}
            className="flex-1 gap-2"
            disabled={!canAdvancePhase}
          >
            Próxima Fase
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
