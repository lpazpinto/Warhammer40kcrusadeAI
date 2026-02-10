/**
 * SecondaryMissionResolutionModal - Asks players to resolve secondary missions
 * 
 * Per rules (Section 3.6):
 * - At the end of each battle round, all revealed Secondary Missions are resolved
 * - Successful missions give their listed rewards and failed missions give their punishments
 * - Misery card and Spawn Roll-related results are added to the next battle round's reveals and rolls
 * 
 * Some action-based missions resolve at end of turn instead of end of round.
 * If a mission's punishment includes Misery Cards, they are revealed immediately as active.
 */

import { useState, useEffect } from "react";
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
import { Card, CardContent } from "@/components/ui/card";
import { Target, CheckCircle2, XCircle, Skull, AlertTriangle } from "lucide-react";
import { 
  SecondaryMission, 
  getMissionResolutionTiming, 
  parseMiseryCardPunishment,
  ResolutionTiming 
} from "@shared/secondaryMissions";
import { MiseryCard, drawMiseryCards } from "@shared/miseryCards";

interface MissionResolution {
  mission: SecondaryMission;
  resolved: boolean;
  success: boolean | null;
}

interface SecondaryMissionResolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeMissions: SecondaryMission[];
  timing: ResolutionTiming;
  battleRound: number;
  existingMiseryCardIds: number[];
  onMissionsResolved: (results: { 
    completedMissionIds: number[]; 
    failedMissionIds: number[];
    newMiseryCards: MiseryCard[];
    /** Number of misery cards to add to next round's reveal (from failed missions) */
    pendingMiseryCardsForNextRound: number;
  }) => void;
}

export default function SecondaryMissionResolutionModal({
  isOpen,
  onClose,
  activeMissions,
  timing,
  battleRound,
  existingMiseryCardIds,
  onMissionsResolved,
}: SecondaryMissionResolutionModalProps) {
  // Filter missions that should be resolved at this timing
  const missionsToResolve = activeMissions.filter(
    mission => getMissionResolutionTiming(mission.id) === timing
  );

  const [resolutions, setResolutions] = useState<MissionResolution[]>([]);
  const [pendingMiseryCards, setPendingMiseryCards] = useState<MiseryCard[]>([]);
  const [showingMiseryCards, setShowingMiseryCards] = useState(false);
  const [pendingMiseryCountForNextRound, setPendingMiseryCountForNextRound] = useState(0);

  // Reset resolutions when modal opens with new missions
  useEffect(() => {
    if (isOpen && missionsToResolve.length > 0) {
      setResolutions(
        missionsToResolve.map(mission => ({
          mission,
          resolved: false,
          success: null,
        }))
      );
      setPendingMiseryCards([]);
      setShowingMiseryCards(false);
      setPendingMiseryCountForNextRound(0);
    }
  }, [isOpen, missionsToResolve.map(m => m.id).join(',')]);

  const handleResolution = (missionId: number, success: boolean) => {
    setResolutions(prev => 
      prev.map(r => 
        r.mission.id === missionId 
          ? { ...r, resolved: true, success } 
          : r
      )
    );
  };

  const allResolved = resolutions.length > 0 && resolutions.every(r => r.resolved);

  const handleConfirm = () => {
    // Calculate Misery Cards from failed missions
    let totalImmediateMiseryCards = 0;
    let totalNextRoundMiseryCards = 0;
    const failedMissionIds: number[] = [];
    const completedMissionIds: number[] = [];

    resolutions.forEach(r => {
      if (r.success === true) {
        completedMissionIds.push(r.mission.id);
      } else if (r.success === false) {
        failedMissionIds.push(r.mission.id);
        // Parse how many Misery Cards from punishment
        const miseryCount = parseMiseryCardPunishment(r.mission.punishmentPt);
        if (miseryCount > 0) {
          // Per rules 3.6: "Misery card and Spawn Roll-related results are added to the 
          // next battle round's reveals and rolls respectively"
          // However, if the punishment says "immediately" or it's an end_of_turn resolution,
          // reveal them now. Otherwise, add to next round.
          if (timing === 'end_of_turn') {
            // End of turn failures: reveal misery cards immediately as they affect current round
            totalImmediateMiseryCards += miseryCount;
          } else {
            // End of round failures: per rules 3.6, add to next round's reveals
            totalNextRoundMiseryCards += miseryCount;
          }
        }
      }
    });

    setPendingMiseryCountForNextRound(totalNextRoundMiseryCards);

    // Draw immediate Misery Cards if any are needed
    if (totalImmediateMiseryCards > 0) {
      const newCards = drawMiseryCards(totalImmediateMiseryCards, existingMiseryCardIds);
      setPendingMiseryCards(newCards);
      setShowingMiseryCards(true);
    } else {
      // No immediate Misery Cards needed, close
      onMissionsResolved({
        completedMissionIds,
        failedMissionIds,
        newMiseryCards: [],
        pendingMiseryCardsForNextRound: totalNextRoundMiseryCards,
      });
      onClose();
    }
  };

  const handleMiseryCardsConfirmed = () => {
    const failedMissionIds = resolutions
      .filter(r => r.success === false)
      .map(r => r.mission.id);
    const completedMissionIds = resolutions
      .filter(r => r.success === true)
      .map(r => r.mission.id);

    onMissionsResolved({
      completedMissionIds,
      failedMissionIds,
      newMiseryCards: pendingMiseryCards,
      pendingMiseryCardsForNextRound: pendingMiseryCountForNextRound,
    });
    setShowingMiseryCards(false);
    setPendingMiseryCards([]);
    onClose();
  };

  // Don't show if no missions to resolve at this timing
  if (missionsToResolve.length === 0) {
    return null;
  }

  // Show Misery Cards reveal screen
  if (showingMiseryCards && pendingMiseryCards.length > 0) {
    return (
      <Dialog open={isOpen} onOpenChange={() => {}}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl text-red-600">
              <Skull className="h-6 w-6" />
              Punição: Cartas de Miséria Reveladas
            </DialogTitle>
            <DialogDescription>
              Devido à falha em missões secundárias, as seguintes Cartas de Miséria foram reveladas e estão ativas imediatamente:
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            {pendingMiseryCards.map((card) => (
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
                    Ativa
                  </Badge>
                </div>
              </div>
            ))}

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
              <p className="text-sm text-yellow-800 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Estas cartas estão agora ativas e seus efeitos devem ser aplicados imediatamente.
              </p>
            </div>

            {pendingMiseryCountForNextRound > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800 flex items-center gap-2">
                  <Skull className="h-4 w-4" />
                  Além disso, +{pendingMiseryCountForNextRound} Carta(s) de Miséria serão adicionadas à revelação do próximo round.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button onClick={handleMiseryCardsConfirmed} className="w-full" variant="destructive">
              Confirmar e Aplicar Efeitos
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Target className="h-6 w-6 text-blue-500" />
            Resolver Missões Secundárias
          </DialogTitle>
          <DialogDescription>
            {timing === 'end_of_turn' 
              ? "Resolva as missões baseadas em ações que terminam no final do turno:"
              : `Fim do Battle Round ${battleRound} - Resolva todas as missões secundárias reveladas (Seção 3.6):`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Rules reminder */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
            <p className="font-medium mb-1">Regra 3.6:</p>
            <p>Missões bem-sucedidas dão suas recompensas listadas. Missões falhadas dão suas punições. 
            Resultados de Cartas de Miséria e Spawn Roll são adicionados às revelações e rolagens do próximo round.</p>
          </div>

          {resolutions.map((resolution) => (
            <Card 
              key={resolution.mission.id}
              className={`border-2 ${
                resolution.resolved 
                  ? resolution.success 
                    ? 'border-green-300 bg-green-50' 
                    : 'border-red-300 bg-red-50'
                  : 'border-blue-200'
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">
                      #{resolution.mission.id} - {resolution.mission.namePt}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {resolution.mission.conditionPt}
                    </p>
                  </div>
                  {resolution.resolved && (
                    <Badge 
                      variant={resolution.success ? "default" : "destructive"}
                      className="ml-2"
                    >
                      {resolution.success ? "Sucesso" : "Falha"}
                    </Badge>
                  )}
                </div>

                {/* Reward/Punishment Info */}
                <div className="flex gap-4 text-xs mb-3">
                  <span className="text-green-700">
                    ✓ Recompensa: {resolution.mission.rewardPt}
                  </span>
                  <span className="text-red-700">
                    ✗ Punição: {resolution.mission.punishmentPt}
                  </span>
                </div>

                {/* Resolution Buttons */}
                {!resolution.resolved && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 border-green-500 text-green-700 hover:bg-green-50"
                      onClick={() => handleResolution(resolution.mission.id, true)}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Missão Completa
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 border-red-500 text-red-700 hover:bg-red-50"
                      onClick={() => handleResolution(resolution.mission.id, false)}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Missão Falhou
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <DialogFooter>
          <Button
            onClick={handleConfirm}
            className="w-full"
            disabled={!allResolved}
          >
            {allResolved ? "Confirmar Resoluções" : "Resolva todas as missões"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
