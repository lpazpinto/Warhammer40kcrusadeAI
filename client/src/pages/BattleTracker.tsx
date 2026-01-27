import { useState, useMemo, useEffect, useRef } from "react";

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
import ShootingPhaseSteps from "@/components/ShootingPhaseSteps";
import ChargePhaseSteps from "@/components/ChargePhaseSteps";
import FightPhaseSteps from "@/components/FightPhaseSteps";
import ResupplyShop from "@/components/ResupplyShop";
import UnitTrackerPanel from "@/components/UnitTrackerPanel";
import BattleSummaryModal from "@/components/BattleSummaryModal";
import HordeSpawnModal from "@/components/HordeSpawnModal";
import HordeUnitsPanel, { HordeUnit } from "@/components/HordeUnitsPanel";
import MiseryCardsPanel from "@/components/MiseryCardsPanel";
import SecondaryMissionsPanel from "@/components/SecondaryMissionsPanel";
import BattleRoundIndicator from "@/components/BattleRoundIndicator";
import BattleRoundEvents from "@/components/BattleRoundEvents";
import StartOfRoundModal from "@/components/StartOfRoundModal";
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
  const [showShootingSteps, setShowShootingSteps] = useState(false);
  const [shootingPhaseCompleted, setShootingPhaseCompleted] = useState(false);
  const [showChargeSteps, setShowChargeSteps] = useState(false);
  const [chargePhaseCompleted, setChargePhaseCompleted] = useState(false);
  const [showFightSteps, setShowFightSteps] = useState(false);
  const [fightPhaseCompleted, setFightPhaseCompleted] = useState(false);
  
  // Battle Round Events state
  const [showStartOfRoundEvents, setShowStartOfRoundEvents] = useState(false);
  const [showEndOfRoundEvents, setShowEndOfRoundEvents] = useState(false);
  const [showStartOfRoundModal, setShowStartOfRoundModal] = useState(false);
  const [previousRound, setPreviousRound] = useState<number | null>(null);
  
  // Horde spawn state
  const [showSpawnModal, setShowSpawnModal] = useState(false);
  const [spawnResult, setSpawnResult] = useState<any>(null);
  const [hordeUnits, setHordeUnits] = useState<HordeUnit[]>([]);
  
   // Misery Cards and Secondary Missions state
  const [activeMiseryCardIds, setActiveMiseryCardIds] = useState<number[]>([]);
  const [activeSecondaryMissions, setActiveSecondaryMissions] = useState<{
    missionId: number;
    status: 'active' | 'completed' | 'failed';
    progress?: string;
  }[]>([]);
  
  // Ref to store timeout ID for cleanup
  const startRoundEventsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Validate battleId is a valid number
  const isValidBattleId = match && battleId !== undefined && !isNaN(battleId) && battleId > 0;

  // DEBUG: Log component state (removed for production)

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
  
  // Local state for current turn - updates immediately on turn change
  const [localCurrentTurn, setLocalCurrentTurn] = useState<"player" | "opponent">((battle as any)?.currentTurn === 'horde' ? 'opponent' : 'opponent');
  
  // Local state for current round - updates immediately on round change
  const [localCurrentRound, setLocalCurrentRound] = useState<number>(battle?.battleRound || 1);
  
  // Sync localCurrentPhase when battle data loads from database
  useEffect(() => {
    if (battle?.currentPhase) {
      setLocalCurrentPhase(battle.currentPhase);
    }
  }, [battle?.currentPhase]);
  
  // Sync hordeUnits from battle data
  useEffect(() => {
    if (battle?.hordeUnits && Array.isArray(battle.hordeUnits)) {
      setHordeUnits(battle.hordeUnits as HordeUnit[]);
    }
  }, [battle?.hordeUnits]);
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (startRoundEventsTimeoutRef.current) {
        clearTimeout(startRoundEventsTimeoutRef.current);
      }
    };
  }, []);
  
  // Show StartOfRoundModal for Round 1 when battle first loads (for initial Secondary Mission)
  const [hasShownRound1Modal, setHasShownRound1Modal] = useState(false);
  useEffect(() => {
    if (battle && !hasShownRound1Modal && battle.battleRound === 1 && activeSecondaryMissions.length === 0) {
      // Only show if no missions have been revealed yet
      setShowStartOfRoundModal(true);
      setHasShownRound1Modal(true);
    }
  }, [battle, hasShownRound1Modal, activeSecondaryMissions.length]);
  
  // DEBUG: Log commandPhaseCompleted state changes (removed for production)
  
  // Calculate canAdvancePhase: require phase completion before advancing
  const canAdvancePhase = (
    (localCurrentPhase !== "command" || commandPhaseCompleted) &&
    (localCurrentPhase !== "movement" || movementPhaseCompleted) &&
    (localCurrentPhase !== "shooting" || shootingPhaseCompleted) &&
    (localCurrentPhase !== "charge" || chargePhaseCompleted) &&
    (localCurrentPhase !== "fight" || fightPhaseCompleted)
  );
  // DEBUG: canAdvancePhase calculated (removed for production)

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

  const [isSpawningHorde, setIsSpawningHorde] = useState(false);
  
  // Get campaign to know horde faction
  const { data: campaign } = trpc.campaign.get.useQuery(
    { id: battle?.campaignId! },
    { enabled: !!battle?.campaignId }
  );

  const spawnHordeMutation = trpc.horde.spawn.useMutation({
    onSuccess: (data: any) => {
      setSpawnResult(data);
      setShowSpawnModal(true);
      setIsSpawningHorde(false);
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

    // Get max supply limit from players to determine number of zones
    const maxSupplyLimit = players?.reduce((max, p) => Math.max(max, p.supplyLimit || 1000), 1000) || 1000;
    
    // Calculate battle round modifiers
    const currentRound = battle?.battleRound || 1;
    let roundModifier = 0;
    if (currentRound >= 5) {
      roundModifier = 2; // +2 for round 5+
    } else if (currentRound >= 3) {
      roundModifier = 1; // +1 for rounds 3-4
    }
    
    setIsSpawningHorde(true);
    spawnHordeMutation.mutate({
      faction: campaign.hordeFaction,
      battleRound: currentRound,
      pointsLimit: maxSupplyLimit, // For zone assignment based on player supply limits
      additionalModifiers: roundModifier,
    });
  };
  
  // Calculate number of zones based on player supply limits (1000pts = 2 zones, 2000pts = 4 zones)
  const maxSupplyLimit = players?.reduce((max, p) => Math.max(max, p.supplyLimit || 1000), 1000) || 1000;
  const numberOfZones = maxSupplyLimit <= 1000 ? 2 : 4;
  
  // Add spawned unit to battle
  const handleConfirmSpawn = (unitName: string, zone: number) => {
    const newUnit: HordeUnit = {
      id: `horde-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: unitName,
      spawnedRound: battle?.battleRound || 1,
      status: "active",
      bracket: spawnResult?.bracket || "5-6",
      spawnZone: zone,
    };
    
    const updatedUnits = [...hordeUnits, newUnit];
    setHordeUnits(updatedUnits);
    
    // Save to database
    if (battleId) {
      updateBattleMutation.mutate({
        id: battleId,
        hordeUnits: updatedUnits,
      });
    }
    
    setShowSpawnModal(false);
    setSpawnResult(null);
    toast.success(`${unitName} adicionada à batalha!`);
  };
  
  // Update crusade unit mutation for incrementing kills
  const updateCrusadeUnitMutation = trpc.crusadeUnit.update.useMutation({
    onSuccess: () => {
      utils.crusadeUnit.getByIds.invalidate({ ids: allUnitIds });
    },
  });

  // Handle destroying a horde unit
  const handleDestroyHordeUnit = (unitId: string, destroyedByUnitId?: number, destroyedByUnitName?: string) => {
    const updatedUnits = hordeUnits.map(unit => 
      unit.id === unitId 
        ? { ...unit, status: "destroyed" as const, destroyedByUnitId, destroyedByUnitName } 
        : unit
    );
    setHordeUnits(updatedUnits);
    
    // Save to database
    if (battleId) {
      updateBattleMutation.mutate({
        id: battleId,
        hordeUnits: updatedUnits,
      });
    }
    
    // Increment enemyUnitsDestroyed for the unit that made the kill
    if (destroyedByUnitId) {
      const killerUnit = crusadeUnits?.find(u => u.id === destroyedByUnitId);
      if (killerUnit) {
        updateCrusadeUnitMutation.mutate({
          id: destroyedByUnitId,
          enemyUnitsDestroyed: (killerUnit.enemyUnitsDestroyed || 0) + 1,
        });
        toast.success(`+1 Kill para ${destroyedByUnitName || killerUnit.unitName}!`);
      }
      
      // Also award SP to the player
      const participant = participants?.find(p => {
        const deployedUnits = p.unitsDeployed || [];
        return deployedUnits.includes(destroyedByUnitId);
      });
      
      if (participant) {
        awardSPMutation.mutate({
          participantId: participant.id,
          amount: 1,
        });
      }
    }
  };

  const handlePhaseChange = (phase: string, round: number, playerTurn: "player" | "opponent") => {
    setPhaseLog(prev => [...prev, { phase, round, timestamp: new Date() }]);
    
    // Detect round change and show events (skip on first load when previousRound is null)
    if (previousRound !== null && round !== previousRound) {
      // End of previous round
      if (round > previousRound) {
        setShowEndOfRoundEvents(true);
      }
    }
    // Always update previousRound to current round
    setPreviousRound(round);
    
    // Show start of round events when entering Command phase at start of new round
    if (phase === "command" && playerTurn === "opponent" && round > 1) {
      // Small delay to show start events after end events are dismissed
      // Clear any pending timeout first
      if (startRoundEventsTimeoutRef.current) {
        clearTimeout(startRoundEventsTimeoutRef.current);
      }
      startRoundEventsTimeoutRef.current = setTimeout(() => {
        setShowStartOfRoundEvents(true);
        startRoundEventsTimeoutRef.current = null;
        // Show automatic card/mission reveal modal for rounds 2+
        setShowStartOfRoundModal(true);
      }, 500);
    }
    
    // Update local state immediately for UI responsiveness
    setLocalCurrentPhase(phase);
    setLocalCurrentTurn(playerTurn);
    setLocalCurrentRound(round);
    
    // Close any open phase step panels
    setShowCommandSteps(false);
    setShowMovementSteps(false);
    setShowShootingSteps(false);
    setShowChargeSteps(false);
    setShowFightSteps(false);
    
    // Reset phase completion when entering phases again
    if (phase === "command") {
      setCommandPhaseCompleted(false);
    }
    if (phase === "movement") {
      setMovementPhaseCompleted(false);
    }
    if (phase === "shooting") {
      setShootingPhaseCompleted(false);
    }
    if (phase === "charge") {
      setChargePhaseCompleted(false);
    }
    if (phase === "fight") {
      setFightPhaseCompleted(false);
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

        {/* Battle Round Indicator - Prominent display */}
        <BattleRoundIndicator
          battleRound={localCurrentRound}
          currentTurn={localCurrentTurn === 'opponent' ? 'horde' : 'player'}
          currentPhase={localCurrentPhase}
          maxRounds={5}
        />

        <div className="grid gap-6 lg:grid-cols-5">
          {/* Phase Tracker */}
          <div className="lg:col-span-3 space-y-6 relative z-10">
            <BattlePhaseTracker
              battleId={battleId}
              initialPhase={battle?.currentPhase || "command"}
              initialRound={battle?.battleRound || 1}
              initialPlayerTurn={(battle as any)?.playerTurn || "opponent"}  // Horde always plays first
              onPhaseChange={handlePhaseChange}
              onSpawnHorde={handleSpawnHorde}
              isSpawningHorde={isSpawningHorde}
              battleRound={battle?.battleRound || 1}
              canAdvancePhase={canAdvancePhase}
            />
            
            {/* Command Phase Detailed Steps */}
            {localCurrentPhase === "command" && showCommandSteps && (
              <CommandPhaseSteps
                battleId={battleId}
                playerCount={participants?.length || 1}
                isSoloMode={participants?.length === 1}
                isHordeTurn={localCurrentTurn === 'opponent'}
                 onComplete={() => {
                  // First set commandPhaseCompleted to true
                  setCommandPhaseCompleted(true);
                  // Then close the steps panel
                  setShowCommandSteps(false);
                  toast.success("Fase de Comando concluída! Agora você pode avançar para a próxima fase.");
                }}
                onOpenResupply={() => {
                  // Disable shop during Horde turn - use localCurrentTurn for real-time state
                  if (localCurrentTurn === 'opponent') {
                    toast.error("A loja de reabastecimento não está disponível durante o turno da Horda.");
                    return;
                  }
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

            {/* Shooting Phase Detailed Steps */}
            {localCurrentPhase === "shooting" && showShootingSteps && (
              <ShootingPhaseSteps
                battleId={battleId}
                onComplete={() => {
                  setShowShootingSteps(false);
                  setShootingPhaseCompleted(true);
                  toast.success("Fase de Tiro concluída! Agora você pode avançar para a próxima fase.");
                }}
              />
            )}

            {/* Button to show Shooting Phase steps */}
            {localCurrentPhase === "shooting" && !showShootingSteps && (
              <div className="space-y-3">
                {!shootingPhaseCompleted && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
                    ⚠️ <strong>Fase de Tiro Incompleta:</strong> Você precisa completar todos os passos da Fase de Tiro antes de avançar para a próxima fase.
                  </div>
                )}
                <Button
                  onClick={() => setShowShootingSteps(true)}
                  variant="outline"
                  className="w-full"
                >
                  Mostrar Passos Detalhados da Fase de Tiro
                </Button>
              </div>
            )}

            {/* Charge Phase Detailed Steps */}
            {localCurrentPhase === "charge" && showChargeSteps && (
              <ChargePhaseSteps
                battleId={battleId}
                onComplete={() => {
                  setShowChargeSteps(false);
                  setChargePhaseCompleted(true);
                  toast.success("Fase de Carga concluída! Agora você pode avançar para a Fase de Combate.");
                }}
              />
            )}

            {/* Button to show Charge Phase steps */}
            {localCurrentPhase === "charge" && !showChargeSteps && (
              <div className="space-y-3">
                {!chargePhaseCompleted && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
                    ⚠️ <strong>Fase de Carga Incompleta:</strong> Você precisa completar todos os passos da Fase de Carga antes de avançar para a próxima fase.
                  </div>
                )}
                <Button
                  onClick={() => setShowChargeSteps(true)}
                  variant="outline"
                  className="w-full"
                >
                  Mostrar Passos Detalhados da Fase de Carga
                </Button>
              </div>
            )}

            {/* Fight Phase Detailed Steps */}
            {localCurrentPhase === "fight" && showFightSteps && (
              <FightPhaseSteps
                battleId={battleId}
                onComplete={() => {
                  setShowFightSteps(false);
                  setFightPhaseCompleted(true);
                  toast.success("Fase de Combate concluída! Agora você pode avançar para a Fase de Moral.");
                }}
              />
            )}

            {/* Button to show Fight Phase steps */}
            {localCurrentPhase === "fight" && !showFightSteps && (
              <div className="space-y-3">
                {!fightPhaseCompleted && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
                    ⚠️ <strong>Fase de Combate Incompleta:</strong> Você precisa completar todos os passos da Fase de Combate antes de avançar para a próxima fase.
                  </div>
                )}
                <Button
                  onClick={() => setShowFightSteps(true)}
                  variant="outline"
                  className="w-full"
                >
                  Mostrar Passos Detalhados da Fase de Combate
                </Button>
              </div>
            )}
          </div>

          {/* Unit Tracker */}
          <div className="lg:col-span-2 space-y-4">
            <UnitTrackerPanel 
              units={unitStatuses}
              onMarkDestroyed={handleMarkDestroyed}
            />
          </div>
        </div>
        
        {/* Horde Units Panel - Full width row */}
        <HordeUnitsPanel
          units={hordeUnits}
          faction={campaign?.hordeFaction || "Horda"}
          numberOfZones={numberOfZones}
          onDestroyUnit={handleDestroyHordeUnit}
          playerUnits={unitStatuses.map(u => ({
            id: u.id,
            name: u.name,
            crusadeName: u.crusadeName,
            playerName: u.playerName,
            status: u.status,
          }))}
        />
        
        {/* Misery Cards and Secondary Missions - Full width row */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Misery Cards Panel */}
          <MiseryCardsPanel
            activeCardIds={activeMiseryCardIds}
            battleRound={battle?.battleRound || 1}
            onDrawCards={(cards) => {
              setActiveMiseryCardIds(prev => [...prev, ...cards.map(c => c.id)]);
              toast.info(`${cards.length} Carta(s) de Miséria comprada(s)!`);
            }}
            onDismissCard={(cardId) => {
              setActiveMiseryCardIds(prev => prev.filter(id => id !== cardId));
              toast.success('Carta de Miséria removida!');
            }}
          />
          
          {/* Secondary Missions Panel */}
          <SecondaryMissionsPanel
            activeMissions={activeSecondaryMissions}
            battleRound={battle?.battleRound || 1}
            onDrawMissions={(missions) => {
              setActiveSecondaryMissions(prev => [
                ...prev,
                ...missions.map(m => ({ missionId: m.id, status: 'active' as const }))
              ]);
              toast.info(`${missions.length} Missão(ões) Secundária(s) comprada(s)!`);
            }}
            onCompleteMission={(missionId) => {
              setActiveSecondaryMissions(prev =>
                prev.map(m => m.missionId === missionId ? { ...m, status: 'completed' as const } : m)
              );
              toast.success('Missão Secundária concluída!');
            }}
            onFailMission={(missionId) => {
              setActiveSecondaryMissions(prev =>
                prev.map(m => m.missionId === missionId ? { ...m, status: 'failed' as const } : m)
              );
              toast.error('Missão Secundária falhou!');
            }}
          />
        </div>

        {/* Battle Info & Log - Full width row */}
        <div className="grid gap-6 lg:grid-cols-2">
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
                    <p className="text-sm text-muted-foreground">Battle Round</p>
                    <p className="font-medium">
                      Round {battle.battleRound || 1} - {(battle as any).currentTurn === 'horde' ? 'Turno da Horda' : 'Turno do Jogador'}
                    </p>
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

        </div>
        
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
      
      {/* Horde Spawn Modal */}
      <HordeSpawnModal
        isOpen={showSpawnModal}
        onClose={() => {
          setShowSpawnModal(false);
          setSpawnResult(null);
        }}
        spawnResult={spawnResult}
        faction={campaign?.hordeFaction || "Horda"}
        battleRound={battle?.battleRound || 1}
        numberOfZones={numberOfZones}
        onConfirm={handleConfirmSpawn}
      />
      
      {/* Battle Round Events Modal */}
      <BattleRoundEvents
        battleRound={battle?.battleRound || 1}
        maxRounds={5}
        isStartOfRound={showStartOfRoundEvents}
        isEndOfRound={showEndOfRoundEvents}
        onDismiss={() => {
          setShowStartOfRoundEvents(false);
          setShowEndOfRoundEvents(false);
        }}
        activeMiseryCards={activeMiseryCardIds}
        activeSecondaryMissions={activeSecondaryMissions.map(m => m.missionId)}
      />
      
      {/* Start of Round Modal - Automatic card/mission reveals */}
      <StartOfRoundModal
        battleRound={battle?.battleRound || 1}
        isOpen={showStartOfRoundModal}
        onClose={() => setShowStartOfRoundModal(false)}
        onCardsRevealed={(cards) => {
          // Clear previous round's cards and add new ones
          setActiveMiseryCardIds(cards.map(c => c.id));
          if (cards.length > 0) {
            toast.info(`${cards.length} Carta(s) de Miséria revelada(s) para o Round ${battle?.battleRound || 1}!`);
          }
        }}
        onMissionsRevealed={(missions) => {
          setActiveSecondaryMissions(prev => [
            ...prev,
            ...missions.map(m => ({ missionId: m.id, status: 'active' as const }))
          ]);
          if (missions.length > 0) {
            toast.info(`Nova Missão Secundária revelada: ${missions[0].namePt}`);
          }
        }}
        existingMiseryCardIds={activeMiseryCardIds}
        existingMissionIds={activeSecondaryMissions.map(m => m.missionId)}
      />
    </div>
  );
}

// Wrapper component that prevents rendering if route doesn't match
export default function BattleTracker() {
  const [match] = useRoute("/battle/tracker/:id");
  
  // Don't render the component at all if route doesn't match
  if (!match) {
    // DEBUG: Route does not match (removed for production)
    return null;
  }
  
  return <BattleTrackerInner />;
}