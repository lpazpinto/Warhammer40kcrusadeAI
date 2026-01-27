/**
 * BattleRoundIndicator - Prominent display of current Battle Round
 * Shows the current round number with visual emphasis
 */

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Swords, Users, Bug, Clock } from "lucide-react";

interface BattleRoundIndicatorProps {
  /** Current battle round number */
  battleRound: number;
  /** Current turn (horde or player) */
  currentTurn: 'horde' | 'player';
  /** Current phase name */
  currentPhase: string;
  /** Maximum rounds (optional, for progress display) */
  maxRounds?: number;
}

export default function BattleRoundIndicator({
  battleRound,
  currentTurn,
  currentPhase,
  maxRounds = 5,
}: BattleRoundIndicatorProps) {
  // Get phase display name in Portuguese
  const getPhaseDisplayName = (phase: string): string => {
    const phaseNames: Record<string, string> = {
      command: 'Comando',
      movement: 'Movimento',
      shooting: 'Tiro',
      charge: 'Carga',
      fight: 'Combate',
    };
    return phaseNames[phase] || phase;
  };

  // Get turn color
  const getTurnColor = () => {
    return currentTurn === 'horde' 
      ? 'bg-red-500 text-white' 
      : 'bg-blue-500 text-white';
  };

  // Get turn icon
  const TurnIcon = currentTurn === 'horde' ? Bug : Users;

  return (
    <Card className="bg-gradient-to-r from-slate-800 to-slate-900 text-white border-0 shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          {/* Battle Round Number */}
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center">
              <span className="text-xs uppercase tracking-wider text-slate-400">Battle Round</span>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-bold text-amber-400">{battleRound}</span>
                <span className="text-xl text-slate-500">/ {maxRounds}</span>
              </div>
            </div>
            
            {/* Round Progress Bar */}
            <div className="hidden sm:flex flex-col gap-1">
              <div className="flex gap-1">
                {Array.from({ length: maxRounds }, (_, i) => (
                  <div
                    key={i}
                    className={`w-8 h-2 rounded-full transition-colors ${
                      i < battleRound
                        ? 'bg-amber-400'
                        : 'bg-slate-600'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-slate-400">
                {battleRound === maxRounds ? 'Último Round!' : `${maxRounds - battleRound} rounds restantes`}
              </span>
            </div>
          </div>

          {/* Current Turn & Phase */}
          <div className="flex items-center gap-3">
            {/* Current Phase */}
            <div className="flex flex-col items-end">
              <span className="text-xs uppercase tracking-wider text-slate-400">Fase Atual</span>
              <div className="flex items-center gap-2">
                <Swords className="h-4 w-4 text-slate-400" />
                <span className="text-lg font-semibold">{getPhaseDisplayName(currentPhase)}</span>
              </div>
            </div>

            {/* Divider */}
            <div className="w-px h-12 bg-slate-600" />

            {/* Current Turn */}
            <div className="flex flex-col items-center">
              <span className="text-xs uppercase tracking-wider text-slate-400 mb-1">Turno</span>
              <Badge className={`${getTurnColor()} px-3 py-1 text-sm font-semibold`}>
                <TurnIcon className="h-4 w-4 mr-1" />
                {currentTurn === 'horde' ? 'Horda' : 'Jogador'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Phase Sequence Indicator */}
        <div className="mt-4 pt-3 border-t border-slate-700">
          <div className="flex items-center justify-between text-xs">
            {['command', 'movement', 'shooting', 'charge', 'fight'].map((phase, index) => {
              const isActive = phase === currentPhase;
              const isPast = ['command', 'movement', 'shooting', 'charge', 'fight'].indexOf(currentPhase) > index;
              
              return (
                <div key={phase} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold transition-colors ${
                      isActive
                        ? 'bg-amber-400 text-slate-900'
                        : isPast
                        ? 'bg-green-500 text-white'
                        : 'bg-slate-600 text-slate-400'
                    }`}
                  >
                    {isPast ? '✓' : index + 1}
                  </div>
                  <span className={`ml-1 hidden md:inline ${isActive ? 'text-amber-400 font-semibold' : 'text-slate-500'}`}>
                    {getPhaseDisplayName(phase)}
                  </span>
                  {index < 4 && (
                    <div className={`w-4 md:w-8 h-0.5 mx-1 ${isPast ? 'bg-green-500' : 'bg-slate-600'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
