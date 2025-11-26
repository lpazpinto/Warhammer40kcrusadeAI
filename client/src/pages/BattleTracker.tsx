import { useState, useMemo } from "react";
import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import BattlePhaseTracker from "@/components/BattlePhaseTracker";
import UnitTrackerPanel from "@/components/UnitTrackerPanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function BattleTracker() {
  const [, params] = useRoute("/battle/:id");
  const battleId = params?.id ? parseInt(params.id) : undefined;

  const { data: battle, isLoading } = trpc.battle.get.useQuery(
    { id: battleId! },
    { enabled: !!battleId }
  );

  // Query battle participants
  const { data: participants } = trpc.battleParticipant.list.useQuery(
    { battleId: battleId! },
    { enabled: !!battleId }
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
          status: isDestroyed ? "destroyed" : "active",
          playerName: player?.name || "Unknown",
        });
      });
    });
    
    return statuses;
  }, [participants, players, crusadeUnits]);

  const [phaseLog, setPhaseLog] = useState<Array<{ phase: string; round: number; timestamp: Date }>>([]);

  const updateBattleMutation = trpc.battle.update.useMutation();

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
            />
          </div>

          {/* Unit Tracker */}
          <div className="lg:col-span-2">
            <UnitTrackerPanel units={unitStatuses} />
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
          </div>
        </div>
      </div>
    </div>
  );
}
