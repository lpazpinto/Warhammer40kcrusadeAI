import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skull, Heart, AlertTriangle, Shield } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import UnitDetailsPopover from "@/components/UnitDetailsPopover";

interface UnitStatus {
  id: number;
  name: string;
  crusadeName?: string;
  powerRating: number;
  rank?: string;
  status: "active" | "destroyed" | "out_of_action";
  playerName: string;
  participantId?: number;
  // Full unit details for popover
  experiencePoints?: number;
  crusadePoints?: number;
  battlesPlayed?: number;
  battlesSurvived?: number;
  enemyUnitsDestroyed?: number;
  battleHonours?: string[];
  battleTraits?: string[];
  battleScars?: string[];
}

interface UnitTrackerPanelProps {
  units: UnitStatus[];
  onMarkDestroyed?: (unitId: number, participantId: number) => void;
}

export default function UnitTrackerPanel({ units, onMarkDestroyed }: UnitTrackerPanelProps) {
  const activeUnits = units.filter(u => u.status === "active");
  const destroyedUnits = units.filter(u => u.status === "destroyed");
  const outOfActionUnits = units.filter(u => u.status === "out_of_action");

  const getStatusIcon = (status: UnitStatus["status"]) => {
    switch (status) {
      case "active":
        return <Heart className="h-4 w-4 text-green-500" />;
      case "destroyed":
        return <Skull className="h-4 w-4 text-red-500" />;
      case "out_of_action":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: UnitStatus["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-300";
      case "destroyed":
        return "bg-red-100 text-red-800 border-red-300";
      case "out_of_action":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
    }
  };

  const getRankBadge = (rank?: string) => {
    if (!rank) return null;
    
    const rankColors: Record<string, string> = {
      battle_ready: "bg-gray-500",
      blooded: "bg-blue-500",
      battle_hardened: "bg-purple-500",
      heroic: "bg-orange-500",
      legendary: "bg-yellow-500",
    };
    
    const rankLabels: Record<string, string> = {
      battle_ready: "Battle Ready",
      blooded: "Blooded",
      battle_hardened: "Battle Hardened",
      heroic: "Heroic",
      legendary: "Legendary",
    };
    
    return (
      <Badge className={`${rankColors[rank]} text-white text-xs`}>
        {rankLabels[rank] || rank}
      </Badge>
    );
  };

  const renderUnitList = (unitList: UnitStatus[], title: string, emptyMessage: string) => (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-muted-foreground">{title}</h4>
      {unitList.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">{emptyMessage}</p>
      ) : (
        <div className="space-y-2">
          {unitList.map((unit) => (
            <UnitDetailsPopover
              key={unit.id}
              unit={{
                id: unit.id,
                unitName: unit.name,
                crusadeName: unit.crusadeName,
                powerRating: unit.powerRating,
                rank: unit.rank || "battle_ready",
                experiencePoints: unit.experiencePoints || 0,
                crusadePoints: unit.crusadePoints || 0,
                battlesPlayed: unit.battlesPlayed || 0,
                battlesSurvived: unit.battlesSurvived || 0,
                enemyUnitsDestroyed: unit.enemyUnitsDestroyed || 0,
                battleHonours: unit.battleHonours,
                battleTraits: unit.battleTraits,
                battleScars: unit.battleScars,
              }}
            >
              <div
                className={`p-3 rounded-lg border ${getStatusColor(unit.status)} cursor-pointer hover:shadow-md transition-shadow`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(unit.status)}
                        <p className="font-medium text-sm truncate">
                          {unit.crusadeName || unit.name}
                        </p>
                        {getRankBadge(unit.rank)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {unit.playerName} • PR {unit.powerRating}
                        {unit.enemyUnitsDestroyed && unit.enemyUnitsDestroyed > 0 && (
                          <span className="ml-2 text-red-600 font-medium">
                            • {unit.enemyUnitsDestroyed} kills
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  {unit.status === "active" && unit.participantId && (
                    <Button
                      size="sm"
                      variant="destructive"
                      className="w-full h-7 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMarkDestroyed?.(unit.id, unit.participantId!);
                      }}
                    >
                      <Skull className="h-3 w-3 mr-1" />
                      Marcar Destruída
                    </Button>
                  )}
                </div>
              </div>
            </UnitDetailsPopover>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <Card className="h-full border-blue-500/30 bg-blue-950/10">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-500" />
            Unidades dos Jogadores
          </span>
          <Badge variant="outline" className="text-blue-400 border-blue-500/50">
            {units.length} Total
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-2xl font-bold text-green-700">{activeUnits.length}</p>
                <p className="text-xs text-green-600">Ativas</p>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-2xl font-bold text-yellow-700">{outOfActionUnits.length}</p>
                <p className="text-xs text-yellow-600">Fora de Ação</p>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                <p className="text-2xl font-bold text-red-700">{destroyedUnits.length}</p>
                <p className="text-xs text-red-600">Destruídas</p>
              </div>
            </div>

            {/* Active Units */}
            {renderUnitList(activeUnits, "Unidades Ativas", "Nenhuma unidade ativa")}

            {/* Out of Action Units */}
            {outOfActionUnits.length > 0 && (
              renderUnitList(outOfActionUnits, "Fora de Ação", "Nenhuma unidade fora de ação")
            )}

            {/* Destroyed Units */}
            {destroyedUnits.length > 0 && (
              renderUnitList(destroyedUnits, "Unidades Destruídas", "Nenhuma unidade destruída")
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
