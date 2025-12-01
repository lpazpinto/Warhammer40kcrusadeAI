console.log('[BattleTracker MODULE] File loaded at:', new Date().toISOString(), 'Path:', window.location.pathname);

import { useState, useMemo } from "react";

// Safe JSON parse helper
function safeJSONParse<T>(value: string | null | undefined, fallback: T): T {
  if (!value || value.trim() === '') return fallback;
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

  const updateBattleMutation = trpc.battle.update.useMutation();
  const updateParticipantMutation = trpc.battleParticipant.update.useMutation({
    onSuccess: () => {
      toast.success("Unit status updated");
    },
    onError: (error) => {
      toast.error(`Failed to update: ${error.message}`);
    },
  });

  const utils = trpc.useUtils();

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
      toast.success(`Horda spawned! Roll: ${data.roll} | ${data.units.length} unidades (${data.totalPower} pontos)`);
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
        objectivesCaptured: p.objectivesControlled || 0,
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
          <div className="lg:col-span-3">
            <BattlePhaseTracker
              battleId={battleId}
              initialPhase={battle?.currentPhase || "command"}
              initialRound={battle?.battleRound || 1}
              initialPlayerTurn={(battle as any)?.playerTurn || "player"}
              onPhaseChange={handlePhaseChange}
              onSpawnHorde={handleSpawnHorde}
              isSpawningHorde={isSpawningHorde}
            />
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