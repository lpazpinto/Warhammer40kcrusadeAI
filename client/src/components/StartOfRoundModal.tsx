/**
 * StartOfRoundModal - Displays automatic card/mission reveals at the start of each battle round
 * Based on Horde Mode rules:
 * - Round 2: 1 Misery Card
 * - Rounds 3-4: 1 Misery Card + Spawn modifier +1
 * - Round 5+: 3 Misery Cards + Spawn modifier +2
 * - Each round: 1 Secondary Mission
 */

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skull, Target, AlertTriangle, Sparkles } from "lucide-react";
import { MiseryCard, drawMiseryCards } from "@shared/miseryCards";
import { SecondaryMission, drawSecondaryMissions } from "@shared/secondaryMissions";

interface StartOfRoundModalProps {
  battleRound: number;
  isOpen: boolean;
  onClose: () => void;
  onCardsRevealed: (cards: MiseryCard[]) => void;
  onMissionsRevealed: (missions: SecondaryMission[]) => void;
  existingMiseryCardIds: number[];
  existingMissionIds: number[];
}

/**
 * Get the number of Misery Cards to reveal based on battle round
 */
function getMiseryCardCount(round: number): number {
  if (round < 2) return 0;
  if (round >= 5) return 3;
  return 1; // Rounds 2, 3, 4
}

/**
 * Get the spawn roll modifier based on battle round
 */
function getSpawnModifier(round: number): number {
  if (round >= 5) return 2;
  if (round >= 3) return 1;
  return 0;
}

export default function StartOfRoundModal({
  battleRound,
  isOpen,
  onClose,
  onCardsRevealed,
  onMissionsRevealed,
  existingMiseryCardIds,
  existingMissionIds,
}: StartOfRoundModalProps) {
  const [revealedCards, setRevealedCards] = useState<MiseryCard[]>([]);
  const [revealedMission, setRevealedMission] = useState<SecondaryMission | null>(null);
  const [hasRevealed, setHasRevealed] = useState(false);

  const miseryCardCount = getMiseryCardCount(battleRound);
  const spawnModifier = getSpawnModifier(battleRound);

  // Reveal cards and missions when modal opens
  useEffect(() => {
    if (isOpen && !hasRevealed) {
      // Draw Misery Cards (if applicable)
      if (miseryCardCount > 0) {
        const cards = drawMiseryCards(miseryCardCount, existingMiseryCardIds);
        setRevealedCards(cards);
      }

      // Draw Secondary Mission (always 1 per round)
      const missions = drawSecondaryMissions(1, battleRound, existingMissionIds);
      if (missions.length > 0) {
        setRevealedMission(missions[0]);
      }

      setHasRevealed(true);
    }
  }, [isOpen, hasRevealed, miseryCardCount, existingMiseryCardIds, existingMissionIds]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setRevealedCards([]);
      setRevealedMission(null);
      setHasRevealed(false);
    }
  }, [isOpen]);

  const handleConfirm = () => {
    if (revealedCards.length > 0) {
      onCardsRevealed(revealedCards);
    }
    if (revealedMission) {
      onMissionsRevealed([revealedMission]);
    }
    onClose();
  };

  // Don't show modal for round 1
  if (battleRound < 2) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleConfirm()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="h-6 w-6 text-yellow-500" />
            Início do Battle Round {battleRound}
          </DialogTitle>
          <DialogDescription>
            Cartas e missões reveladas automaticamente de acordo com as regras do Horde Mode
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Spawn Modifier Alert */}
          {spawnModifier > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-orange-800">
                <AlertTriangle className="h-5 w-5" />
                <span className="font-semibold">
                  Modificador de Spawn: +{spawnModifier}
                </span>
              </div>
              <p className="text-sm text-orange-700 mt-1">
                Adicione +{spawnModifier} a todos os resultados de Spawn Roll neste round.
              </p>
            </div>
          )}

          {/* Misery Cards Section */}
          {revealedCards.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Skull className="h-5 w-5 text-red-600" />
                <h3 className="font-semibold text-red-800">
                  Cartas de Miséria Reveladas ({revealedCards.length})
                </h3>
              </div>
              <div className="space-y-2">
                {revealedCards.map((card) => (
                  <div
                    key={card.id}
                    className="bg-red-50 border border-red-200 rounded-lg p-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-semibold text-red-800">
                          #{card.id} - {card.namePt}
                        </span>
                        <p className="text-sm text-red-700 mt-1">
                          {card.effectPt}
                        </p>
                      </div>
                      <Badge variant="destructive" className="ml-2">
                        Nova
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Secondary Mission Section */}
          {revealedMission && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-blue-800">
                  Missão Secundária Revelada
                </h3>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-semibold text-blue-800">
                      #{revealedMission.id} - {revealedMission.namePt}
                    </span>
                    <p className="text-sm text-blue-700 mt-1">
                      {revealedMission.conditionPt}
                    </p>
                    <div className="flex gap-4 mt-2 text-xs">
                      <span className="text-green-700">
                        ✓ Recompensa: {revealedMission.rewardPt}
                      </span>
                      <span className="text-red-700">
                        ✗ Punição: {revealedMission.punishmentPt}
                      </span>
                    </div>
                  </div>
                  <Badge className="ml-2 bg-blue-500">
                    Nova
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {/* Round-specific rules reminder */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-600">
            <h4 className="font-semibold text-gray-800 mb-2">Regras do Round {battleRound}:</h4>
            <ul className="list-disc list-inside space-y-1">
              {battleRound === 2 && (
                <li>1 Carta de Miséria revelada</li>
              )}
              {(battleRound === 3 || battleRound === 4) && (
                <>
                  <li>1 Carta de Miséria revelada</li>
                  <li>+1 aos resultados de Spawn Roll</li>
                </>
              )}
              {battleRound >= 5 && (
                <>
                  <li>3 Cartas de Miséria reveladas</li>
                  <li>+2 aos resultados de Spawn Roll</li>
                </>
              )}
              <li>1 Missão Secundária revelada</li>
              <li>Descarte as Cartas de Miséria ativas do round anterior</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleConfirm} className="w-full">
            Confirmar e Continuar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
