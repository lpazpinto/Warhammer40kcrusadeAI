/**
 * StartOfRoundModal - Displays automatic card/mission reveals at the start of each battle round
 * Based on Horde Mode rules (Section 3.2-3.5):
 * 
 * At the start of each battle round:
 * 1. Discard any active Misery cards
 * 2. Reveal any cards triggered from the Misery Deck (including modifiers from failed Secondary Missions last round)
 * 3. Reveal the new Secondary Mission for the round
 * 4. Resolve all mission rewards and punishments that require resolving at the start of the battle round
 * 5. Spawn the Horde
 * 6. Resolve any effects that occur at the start of the battle round
 * 
 * Round-specific:
 * - Round 1: 1 Secondary Mission only (no Misery Cards)
 * - Round 2: 1 Misery Card revealed
 * - Rounds 3-4: 1 Misery Card + Spawn modifier +1
 * - Round 5+: 3 Misery Cards + Spawn modifier +2
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
import { Skull, Target, AlertTriangle, Sparkles, Trash2 } from "lucide-react";
import { MiseryCard, drawMiseryCards, getMiseryCardById } from "@shared/miseryCards";
import { SecondaryMission, drawSecondaryMissions } from "@shared/secondaryMissions";

interface StartOfRoundModalProps {
  battleRound: number;
  isOpen: boolean;
  onClose: () => void;
  onCardsRevealed: (cards: MiseryCard[]) => void;
  onMissionsRevealed: (missions: SecondaryMission[]) => void;
  /** Called to discard all active misery cards from previous round */
  onDiscardMiseryCards?: () => void;
  /** Additional misery cards to reveal from failed secondary missions last round */
  pendingMiseryCardsFromFailures?: number;
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
  onDiscardMiseryCards,
  pendingMiseryCardsFromFailures = 0,
  existingMiseryCardIds,
  existingMissionIds,
}: StartOfRoundModalProps) {
  const [revealedCards, setRevealedCards] = useState<MiseryCard[]>([]);
  const [revealedMission, setRevealedMission] = useState<SecondaryMission | null>(null);
  const [hasRevealed, setHasRevealed] = useState(false);
  const [discardedCardNames, setDiscardedCardNames] = useState<string[]>([]);

  const miseryCardCount = getMiseryCardCount(battleRound);
  const totalMiseryCards = miseryCardCount + pendingMiseryCardsFromFailures;
  const spawnModifier = getSpawnModifier(battleRound);

  // Reveal cards and missions when modal opens
  useEffect(() => {
    if (isOpen && !hasRevealed) {
      // Step 1: Record names of cards being discarded (for display)
      if (battleRound >= 2 && existingMiseryCardIds.length > 0) {
        const names = existingMiseryCardIds.map(id => {
          const card = getMiseryCardById(id);
          return card ? `#${card.id} - ${card.namePt}` : `Carta #${id}`;
        });
        setDiscardedCardNames(names);
      }

      // Step 2: Draw new Misery Cards (round-based + failed mission penalties)
      // We draw from a clean slate since previous cards are discarded
      if (totalMiseryCards > 0) {
        const cards = drawMiseryCards(totalMiseryCards, []);
        setRevealedCards(cards);
      }

      // Step 3: Draw Secondary Mission (always 1 per round)
      const missions = drawSecondaryMissions(1, battleRound, existingMissionIds);
      if (missions.length > 0) {
        setRevealedMission(missions[0]);
      }

      setHasRevealed(true);
    }
  }, [isOpen, hasRevealed, totalMiseryCards, existingMiseryCardIds, existingMissionIds, battleRound]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setRevealedCards([]);
      setRevealedMission(null);
      setHasRevealed(false);
      setDiscardedCardNames([]);
    }
  }, [isOpen]);

  const handleConfirm = () => {
    // Step 1: Discard previous round's misery cards
    if (onDiscardMiseryCards && battleRound >= 2) {
      onDiscardMiseryCards();
    }

    // Step 2: Apply new misery cards
    if (revealedCards.length > 0) {
      onCardsRevealed(revealedCards);
    }

    // Step 3: Apply new secondary mission
    if (revealedMission) {
      onMissionsRevealed([revealedMission]);
    }

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleConfirm()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="h-6 w-6 text-yellow-500" />
            Início do Battle Round {battleRound}
          </DialogTitle>
          <DialogDescription>
            Eventos automáticos do início do round de acordo com as regras do Horde Mode (Seção 3.2)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Step 1: Discard active Misery Cards from previous round */}
          {battleRound >= 2 && discardedCardNames.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-gray-500" />
                <h3 className="font-semibold text-gray-700">
                  Passo 1: Descarte de Cartas de Miséria Ativas
                </h3>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <p className="text-sm text-gray-600 mb-2">
                  As seguintes cartas do round anterior foram descartadas:
                </p>
                <ul className="list-disc list-inside text-sm text-gray-500 space-y-1">
                  {discardedCardNames.map((name, i) => (
                    <li key={i} className="line-through">{name}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {battleRound >= 2 && discardedCardNames.length === 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-gray-500" />
                <h3 className="font-semibold text-gray-700">
                  Passo 1: Descarte de Cartas de Miséria
                </h3>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <p className="text-sm text-gray-500">
                  Nenhuma Carta de Miséria ativa para descartar.
                </p>
              </div>
            </div>
          )}

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

          {/* Step 2: Misery Cards Section */}
          {revealedCards.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Skull className="h-5 w-5 text-red-600" />
                <h3 className="font-semibold text-red-800">
                  Passo 2: Cartas de Miséria Reveladas ({revealedCards.length})
                  {pendingMiseryCardsFromFailures > 0 && (
                    <span className="text-sm font-normal ml-2 text-red-600">
                      (inclui {pendingMiseryCardsFromFailures} de missões falhadas)
                    </span>
                  )}
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

          {battleRound >= 2 && revealedCards.length === 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Skull className="h-5 w-5 text-gray-400" />
                <h3 className="font-semibold text-gray-500">
                  Passo 2: Nenhuma Carta de Miséria para revelar
                </h3>
              </div>
            </div>
          )}

          {/* Step 3: Secondary Mission Section */}
          {revealedMission && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-blue-800">
                  Passo 3: Missão Secundária Revelada
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
              {battleRound === 1 && (
                <>
                  <li>1 Missão Secundária revelada (primeira missão da batalha)</li>
                  <li>Sem Cartas de Miséria no Round 1</li>
                </>
              )}
              {battleRound === 2 && (
                <>
                  <li>Descartar Cartas de Miséria ativas do round anterior</li>
                  <li>1 Carta de Miséria revelada</li>
                  <li>1 Missão Secundária revelada</li>
                </>
              )}
              {(battleRound === 3 || battleRound === 4) && (
                <>
                  <li>Descartar Cartas de Miséria ativas do round anterior</li>
                  <li>1 Carta de Miséria revelada</li>
                  <li>+1 aos resultados de Spawn Roll</li>
                  <li>1 Missão Secundária revelada</li>
                </>
              )}
              {battleRound >= 5 && (
                <>
                  <li>Descartar Cartas de Miséria ativas do round anterior</li>
                  <li>3 Cartas de Miséria reveladas</li>
                  <li>+2 aos resultados de Spawn Roll</li>
                  <li>1 Missão Secundária revelada</li>
                </>
              )}
              {pendingMiseryCardsFromFailures > 0 && (
                <li className="text-red-600 font-medium">
                  +{pendingMiseryCardsFromFailures} Carta(s) de Miséria adicionais de missões falhadas no round anterior
                </li>
              )}
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
