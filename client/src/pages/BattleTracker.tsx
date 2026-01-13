console.log('[BattleTracker MODULE] File loaded at:', new Date().toISOString(), 'Path:', window.location.pathname);

import { useState, useMemo, useEffect } from "react";

// Safe JSON parse helper
function safeJSONParse<T>(value: any, fallback: T): T {
  // If value is already an object/array (parsed by superjson), return it
  if (value && typeof value === 'object') return value as T;
  
  // If value is not a string, return fallback
  if (typeof value !== 'string') return fallback;
  
  // If empty string, return fallback
  if (value.trim() === '') return fallback;
  
  // Try to parse JSON string
  try {
    return JSON.parse(value);
  } catch (error) {
    console.warn('[BattleTracker] Failed to parse JSON:', value, error);
    return fallback;
  }
}
import { toast } from "sonner";
import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import BattlePhaseTracker from "@/components/BattlePhaseTracker";
import CommandPhaseSteps from "@/components/CommandPhaseSteps";
import MovementPhaseSteps from "@/components/MovementPhaseSteps";
import ResupplyShop from "@/components/ResupplyShop";
import UnitTrackerPanel from "@/components/UnitTrackerPanel";
import BattleSummaryModal from "@/components/BattleSummaryModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

function BattleTrackerInner() {
  const [match, params] = useRoute("/battle/tracker/:id");
  const battleId = params?.id ? parseInt(params.id) : undefined;
  const [showSummary, setShowSummary] = useState(false);
  const [isDistributingXP, setIsDistributingXP] = useState(false);
  const [showCommandSteps, setShowCommandSteps] = useState(false);
  const [showResupplyShop, setShowResupplyShop] = useState(false);
  const [selectedParticipantForShop, setSelectedParticipantForShop] = useState<number | null>(null);
  const [commandPhaseCompleted, setCommandPhaseCompleted] = useState(false);
  const [showMovementSteps, setShowMovementSteps] = useState(false);
  const [movementPhaseCompleted, setMovementPhaseCompleted] = useState(false);

  // Validate battleId is a valid number
  const isValidBattleId = match && battleId !== undefined && !isNaN(battleId) && battleId > 0;

  // DEBUG: Log component state
  console.log('[BattleTracker] Component rendered:', {
    match,
    params,
    battleId,
    battleIdType: typeof battleId,
    isValidBattleId,
    currentPath: window.location.pathname,
    willExecuteQuery: isValidBattleId,
    queryInput: { id: battleId || 0 }
  });

  const { data: battle, isLoading } = trpc.battle.get.useQuery(
    { id: battleId || 0 },
    { enabled: isValidBattleId }
  );

  // Query battle participants
  const { data: participants } = trpc.battleParticipant.list.useQuery(
    { battleId: battleId || 0 },
    { enabled: isValidBattleId }
  );

  // Query players for names
  const { data: players } = trpc.player.list.useQuery(
    { campaignId: battle?.campaignId! },
    { enabled: !!battle?.campaignId }
  );

  // Collect all unit IDs from participants
  const allUnitIds = useMemo(() => {
    if (!participants) return [];
    const ids: number[] = [];
    participants.forEach(p => {
      if (p.unitsDeployed) ids.push(...p.unitsDeployed);
    });
    return ids;
  }, [participants]);

  // Query crusade units
  const { data: crusadeUnits } = trpc.crusadeUnit.getByIds.useQuery(
    { ids: allUnitIds },
    { enabled: allUnitIds.length > 0 }
  );

  // Build unit status list from participants and crusade units
  const unitStatuses = useMemo(() => {
    if (!participants || !players || !crusadeUnits) return [];
    
    const statuses: any[] = [];
    
    participants.forEach(participant => {
      const player = players.find(p => p.id === participant.playerId);
      const deployedUnits = participant.unitsDeployed || [];
      const destroyedUnits = participant.unitsDestroyed || [];
      
      deployedUnits.forEach((unitId: number) => {
        const unit = crusadeUnits.find(u => u.id === unitId);
        const isDestroyed = destroyedUnits.includes(unitId);
        
        statuses.push({
          id: unitId,
          name: unit?.unitName || `Unit ${unitId}`,
          crusadeName: unit?.crusadeName || unit?.unitName || `Unit ${unitId}`,
          powerRating: unit?.powerRating || 0,
          rank: unit?.rank,
          status: isDestroyed ? "destroyed" : "active",
          playerName: player?.name || "Unknown",
          participantId: participant.id,
          // Full details for popover
          experiencePoints: unit?.experiencePoints || 0,
          crusadePoints: unit?.powerRating || 0, // Use powerRating as crusade points
          battlesPlayed: unit?.battlesPlayed || 0,
          battlesSurvived: unit?.battlesSurvived || 0,
          enemyUnitsDestroyed: unit?.enemyUnitsDestroyed || 0,
          battleHonours: safeJSONParse(unit?.battleHonours as any, []),
          battleTraits: safeJSONParse(unit?.battleTraits as any, []),
          battleScars: safeJSONParse(unit?.battleScars as any, []),
        });
      });
    });
    
    return statuses;
  }, [participants, players, crusadeUnits]);

  const [phaseLog, setPhaseLog] = useState<Array<{ phase: string; round: number; timestamp: Date }>>([]);
  
  // Local state for current phase - updates immediately on phase change
  // This is used for conditional rendering instead of battle?.currentPhase which depends on database sync
  const [localCurrentPhase, setLocalCurrentPhase] = useState<string>(battle?.currentPhase || "command");
  
  // Sync localCurrentPhase when battle data loads from database
  useEffect(() => {
    if (battle?.currentPhase) {
      setLocalCurrentPhase(battle.currentPhase);
    }
  }, [battle?.currentPhase]);

  const updateBattleMutation = trpc.battle.update.useMutation({
    onSuccess: () => {
      // Invalidate battle query to refresh currentPhase
      utils.battle.get.invalidate({ id: battleId! });
    },
  });
  const updateParticipantMutation = trpc.battleParticipant.update.useMutation({
    onSuccess: () => {
      toast.success("Unit status updated");
    },
    onError: (error) => {
      toast.error(`Failed to update: ${error.message}`);
    },
  });

  const utils = trpc.useUtils();

  // Award SP mutation
  const awardSPMutation = trpc.battle.awardSupplyPoints.useMutation({
    onSuccess: () => {
      utils.battleParticipant.list.invalidate({ battleId: battleId! });
    },
    onError: (error) => {
      toast.error(`Failed to award SP: ${error.message}`);
    },
  });

  const handleMarkDestroyed = (unitId: number, participantId: number) => {
    const participant = participants?.find(p => p.id === participantId);
    if (!participant) return;

    const destroyedUnits = participant.unitsDestroyed || [];
    if (destroyedUnits.includes(unitId)) {
      toast.info("Unit already marked as destroyed");
      return;
    }

    updateParticipantMutation.mutate(
      {
        id: participantId,
        unitsDestroyed: [...destroyedUnits, unitId],
      },
      {
        onSuccess: () => {
          utils.battleParticipant.list.invalidate({ battleId: battleId! });
        },
      }
    );
  };

  const handleAddKill = (participantId: number) => {
    const participant = participants?.find(p => p.id === participantId);
    if (!participant) return;

    updateParticipantMutation.mutate(
      {
        id: participantId,
        enemyUnitsKilled: (participant.enemyUnitsKilled || 0) + 1,
      },
      {
        onSuccess: () => {
          utils.battleParticipant.list.invalidate({ battleId: battleId! });
        },
      }
    );
  };

  const [isSpawningHorde, setIsSpawningHorde] = useState(false);
  
  // Get campaign to know horde faction
  const { data: campaign } = trpc.campaign.get.useQuery(
    { id: battle?.campaignId! },
    { enabled: !!battle?.campaignId }
  );

  const spawnHordeMutation = trpc.horde.spawn.useMutation({
    onSuccess: (data: any) => {
      const unitCount = data?.units?.length || 0;
      const totalPower = data?.totalPower || 0;
      const roll = data?.roll || 0;
      toast.success(`Horda spawned! Roll: ${roll} | ${unitCount} unidades (${totalPower} pontos)`);
      setIsSpawningHorde(false);
      // TODO: Add spawned units to battle participants
    },
    onError: (error: any) => {
      toast.error(`Failed to spawn horde: ${error.message}`);
      setIsSpawningHorde(false);
    },
  });

  const handleSpawnHorde = () => {
    if (!campaign?.hordeFaction) {
      toast.error("Horde faction not configured");
      return;
    }

    setIsSpawningHorde(true);
    spawnHordeMutation.mutate({
      faction: campaign.hordeFaction,
      battleRound: battle?.battleRound || 1,
      additionalModifiers: 0,
    });
  };

  const handlePhaseChange = (phase: string, round: number, playerTurn: "player" | "opponent") => {
    setPhaseLog([...phaseLog, { phase, round, timestamp: new Date() }]);
    
    // Update local phase state immediately for UI responsiveness
    setLocalCurrentPhase(phase);
    
    // Close any open phase step panels
    setShowCommandSteps(false);
    setShowMovementSteps(false);
    
    // Reset phase completion when entering phases again
    if (phase === "command") {
      setCommandPhaseCompleted(false);
    }
    if (phase === "movement") {
      setMovementPhaseCompleted(false);
    }
    
    // Auto-save to database
    if (battleId) {
      updateBattleMutation.mutate({
        id: battleId,
        battleRound: round,
        // @ts-ignore - currentPhase and playerTurn exist in schema but not in type yet
        currentPhase: phase,
        playerTurn: playerTurn,
      });
    }
  };

  const distributeXPMutation = trpc.battle.distributeXP.useMutation({
    onSuccess: () => {
      toast.success("XP distribuído com sucesso!");
      setIsDistributingXP(false);
      setShowSummary(false);
    },
    onError: (error: any) => {
      toast.error(`Erro ao distribuir XP: ${error.message}`);
      setIsDistributingXP(false);
    },
  });

  const handleDistributeXP = () => {
    if (!battleId || !participants) return;
    setIsDistributingXP(true);
    
    // Build unit results from participants
    const unitResults: any[] = [];
    participants.forEach(p => {
      const deployedUnits = p.unitsDeployed || [];
      const destroyedUnits = p.unitsDestroyed || [];
      
      deployedUnits.forEach((unitId: number) => {
        unitResults.push({
          unitId,
          survived: !destroyedUnits.includes(unitId),
          enemyUnitsKilled: p.enemyUnitsKilled || 0,
          markedForGreatness: false,
        });
      });
    });
    
    distributeXPMutation.mutate({ 
      battleId, 
      unitResults,
      rpAwarded: 1, // Base RP
    });
  };

  const handleReturnToCampaign = () => {
    setShowSummary(false);
    // Navigation handled by Link component
  };

  // Build participant stats for summary modal
  const participantStats = useMemo(() => {
    if (!participants || !players) return [];
    return participants.map(p => {
      const player = players.find(pl => pl.id === p.playerId);
      return {
        playerName: player?.name || "Unknown",
        unitsDeployed: p.unitsDeployed?.length || 0,
        unitsDestroyed: p.unitsDestroyed?.length || 0,
        enemyUnitsKilled: p.enemyUnitsKilled || 0,
        supplyPoints: p.supplyPoints || 0,
      };
    });
  }, [participants, players]);

  if (isLoading) {
    return (
      <div className="container py-8">
        <p>Carregando batalha...</p>
      </div>
    );
  }

  if (!battle && battleId) {
    return (
      <div className="container py-8">
        <p>Batalha não encontrada.</p>
        <Link href="/campaigns">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Campanhas
          </Button>
        </Link>
      </div>
    );
  }

  // Show nothing if route doesn't match or ID is invalid
  if (!isValidBattleId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Rastreador de Batalha</h1>
            {battle && (
              <p className="text-muted-foreground">
                Batalha #{battle.battleNumber} - {battle.deployment || "Deployment não definido"}
              </p>
            )}
          </div>
          <Link href={battle ? `/campaign/${battle.campaignId}` : "/campaigns"}>
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          {/* Phase Tracker */}
          <div className="lg:col-span-3 space-y-6">
            <BattlePhaseTracker
              battleId={battleId}
              initialPhase={battle?.currentPhase || "command"}
              initialRound={battle?.battleRound || 1}
              initialPlayerTurn={(battle as any)?.playerTurn || "opponent"}  // Horde always plays first
              onPhaseChange={handlePhaseChange}
              onSpawnHorde={handleSpawnHorde}
              isSpawningHorde={isSpawningHorde}
              canAdvancePhase={
                (localCurrentPhase !== "command" || commandPhaseCompleted) &&
                (localCurrentPhase !== "movement" || movementPhaseCompleted)
              }
            />
            
            {/* Command Phase Detailed Steps */}
            {localCurrentPhase === "command" && showCommandSteps && (
              <CommandPhaseSteps
                battleId={battleId}
                playerCount={participants?.length || 1}
                isSoloMode={participants?.length === 1}
                onComplete={() => {
                  setShowCommandSteps(false);
                  setCommandPhaseCompleted(true);
                  toast.success("Fase de Comando concluída! Agora você pode avançar para a próxima fase.");
                }}
                onOpenResupply={() => {
                  // Open resupply shop for first participant (player)
                  const playerParticipant = participants?.[0];
                  if (playerParticipant) {
                    setSelectedParticipantForShop(playerParticipant.id);
                    setShowResupplyShop(true);
                  }
                }}
                onDistributeSP={(objectivesCount) => {
                  // Calculate SP per player
                  const isSolo = participants?.length === 1;
                  const spPerPlayer = isSolo ? objectivesCount * 2 : objectivesCount;
                  
                  // Award SP to all participants
                  participants?.forEach(participant => {
                    awardSPMutation.mutate({
                      participantId: participant.id,
                      amount: spPerPlayer,
                    });
                  });
                }}
              />
            )}
            
            {/* Button to show Command Phase steps */}
            {localCurrentPhase === "command" && !showCommandSteps && (
              <div className="space-y-3">
                {!commandPhaseCompleted && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
                    ⚠️ <strong>Fase de Comando Incompleta:</strong> Você precisa completar todos os passos da Fase de Comando antes de avançar para a próxima fase.
                  </div>
                )}
                <Button
                  onClick={() => setShowCommandSteps(true)}
                  variant="outline"
                  className="w-full"
                >
                  Mostrar Passos Detalhados da Fase de Comando
                </Button>
              </div>
            )}

            {/* Movement Phase Detailed Steps */}
            {localCurrentPhase === "movement" && showMovementSteps && (
              <MovementPhaseSteps
                battleId={battleId}
                onComplete={() => {
                  setShowMovementSteps(false);
                  setMovementPhaseCompleted(true);
                  toast.success("Fase de Movimento concluída! Agora você pode avançar para a próxima fase.");
                }}
              />
            )}

            {/* Button to show Movement Phase steps */}
            {localCurrentPhase === "movement" && !showMovementSteps && (
              <div className="space-y-3">
                {!movementPhaseCompleted && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
                    ⚠️ <strong>Fase de Movimento Incompleta:</strong> Você precisa completar todos os passos da Fase de Movimento antes de avançar para a próxima fase.
                  </div>
                )}
                <Button
                  onClick={() => setShowMovementSteps(true)}
                  variant="outline"
                  className="w-full"
                >
                  Mostrar Passos Detalhados da Fase de Movimento
                </Button>
              </div>
            )}
          </div>

          {/* Unit Tracker */}
          <div className="lg:col-span-2">
            <UnitTrackerPanel 
              units={unitStatuses}
              onMarkDestroyed={handleMarkDestroyed}
              onAddKill={handleAddKill}
            />
          </div>

          {/* Battle Info & Log - moved to bottom or sidebar */}
          <div className="lg:col-span-5 space-y-6">
            {/* Battle Info */}
            {battle && (
              <Card>
                <CardHeader>
                  <CardTitle>Informações da Batalha</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="font-medium capitalize">{battle.status}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Turno Atual</p>
                    <p className="font-medium">{battle.battleRound || 1}</p>
                  </div>
                  {battle.deployment && (
                    <div>
                      <p className="text-sm text-muted-foreground">Deployment</p>
                      <p className="font-medium">{battle.deployment}</p>
                    </div>
                  )}
                  {battle.missionPack && (
                    <div>
                      <p className="text-sm text-muted-foreground">Mission Pack</p>
                      <p className="font-medium">{battle.missionPack}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Phase Log */}
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Fases</CardTitle>
              </CardHeader>
              <CardContent>
                {phaseLog.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhuma fase registrada ainda</p>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {phaseLog.slice().reverse().map((log, index) => (
                      <div key={index} className="text-sm border-l-2 border-primary pl-3 py-1">
                        <p className="font-medium">
                          Turno {log.round} - {log.phase}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {log.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* End Battle Button */}
            <Button
              variant="destructive"
              size="lg"
              className="w-full"
              onClick={() => setShowSummary(true)}
            >
              Finalizar Batalha
            </Button>
          </div>
        </div>
      </div>

      {/* Battle Summary Modal */}
      <BattleSummaryModal
        open={showSummary}
        onOpenChange={setShowSummary}
        battleNumber={battle?.battleNumber}
        deployment={battle?.deployment || "Unknown"}
        victory="draw"
        participants={participantStats}
        onDistributeXP={handleDistributeXP}
        onReturnToCampaign={handleReturnToCampaign}
        isDistributingXP={isDistributingXP}
      />
      
      {/* Resupply Shop Modal */}
      {selectedParticipantForShop && (
        <ResupplyShop
          open={showResupplyShop}
          onOpenChange={setShowResupplyShop}
          battleId={battleId}
          participantId={selectedParticipantForShop}
          playerName={players?.find(p => 
            participants?.find(part => part.id === selectedParticipantForShop)?.playerId === p.id
          )?.name || "Jogador"}
          currentSP={participants?.find(p => p.id === selectedParticipantForShop)?.supplyPoints || 0}
          battleRound={battle?.battleRound || 1}
        />
      )}
    </div>
  );
}

// Wrapper component that prevents rendering if route doesn't match
export default function BattleTracker() {
  const [match] = useRoute("/battle/tracker/:id");
  
  // Don't render the component at all if route doesn't match
  if (!match) {
    console.log('[BattleTracker] Route does not match, not rendering');
    return null;
  }
  
  return <BattleTrackerInner />;
}