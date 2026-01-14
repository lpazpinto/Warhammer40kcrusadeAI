import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skull, Trash2, Target, Swords, MapPin } from "lucide-react";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface HordeUnit {
  id: string;
  name: string;
  spawnedRound: number;
  status: "active" | "destroyed";
  bracket: string;
  spawnZone?: number; // Zone where unit spawned (1-based index)
  destroyedByUnitId?: number; // Unit ID that destroyed this horde unit
  destroyedByUnitName?: string; // Unit name that destroyed this horde unit
}

export interface PlayerUnit {
  id: number;
  name: string;
  crusadeName?: string;
  playerName: string;
  status: "active" | "destroyed" | "out_of_action";
}

interface HordeUnitsPanelProps {
  units: HordeUnit[];
  faction: string;
  numberOfZones: number;
  onDestroyUnit: (unitId: string, destroyedByUnitId?: number, destroyedByUnitName?: string) => void;
  playerUnits?: PlayerUnit[];
}

/**
 * Painel que exibe as unidades da Horda, permite marcar unidades como destruídas e atribuir a kill a uma unidade de jogador ativa.
 *
 * @param onDestroyUnit - Callback chamado quando uma unidade da Horda é destruída. Recebe `unitId`, `destroyedByUnitId` (opcional) e `destroyedByUnitName` (opcional) para indicar a unidade responsável pela kill.
 * @param playerUnits - Lista opcional de unidades de jogadores usada para selecionar a unidade que realizou a kill (somente unidades com status "active" são oferecidas).
 * @returns O elemento JSX do painel de unidades da Horda, incluindo diálogo de confirmação para destruição e seleção de atribuição de kill.
 */
export default function HordeUnitsPanel({
  units,
  faction,
  numberOfZones,
  onDestroyUnit,
  playerUnits = [],
}: HordeUnitsPanelProps) {
  const [unitToDestroy, setUnitToDestroy] = useState<HordeUnit | null>(null);
  const [selectedDestroyerUnitId, setSelectedDestroyerUnitId] = useState<number | null>(null);

  const activeUnits = units.filter(u => u.status === "active");
  const destroyedUnits = units.filter(u => u.status === "destroyed");
  
  // Only show active player units as options for kill attribution
  const activePlayerUnits = playerUnits.filter(u => u.status === "active");

  const getBracketColor = (bracket: string) => {
    switch (bracket) {
      case "3-4": return "bg-green-600/20 text-green-400 border-green-600/50";
      case "5-6": return "bg-blue-600/20 text-blue-400 border-blue-600/50";
      case "7-9": return "bg-purple-600/20 text-purple-400 border-purple-600/50";
      case "10+": return "bg-red-600/20 text-red-400 border-red-600/50";
      default: return "bg-gray-600/20 text-gray-400 border-gray-600/50";
    }
  };

  const handleConfirmDestroy = () => {
    if (unitToDestroy) {
      const selectedUnit = activePlayerUnits.find(u => u.id === selectedDestroyerUnitId);
      const unitName = selectedUnit ? (selectedUnit.crusadeName || selectedUnit.name) : undefined;
      onDestroyUnit(unitToDestroy.id, selectedDestroyerUnitId || undefined, unitName);
      setUnitToDestroy(null);
      setSelectedDestroyerUnitId(null);
    }
  };

  if (units.length === 0) {
    return (
      <Card className="border-red-500/30 bg-red-950/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Skull className="h-5 w-5 text-red-500" />
            Unidades da Horda
            <Badge variant="outline" className="ml-auto text-red-400 border-red-500/50">
              {faction}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhuma unidade da Horda em campo.
            <br />
            <span className="text-xs">Use "Spawn Horda" durante o turno da Horda para adicionar unidades.</span>
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-red-500/30 bg-red-950/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Skull className="h-5 w-5 text-red-500" />
            Unidades da Horda
            <Badge variant="outline" className="ml-auto text-red-400 border-red-500/50">
              {faction}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ScrollArea className="max-h-[400px]">
            <div className="space-y-3 pr-2">
              {/* Active Units */}
              {activeUnits.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Swords className="h-4 w-4" />
                    <span>Ativas ({activeUnits.length})</span>
                  </div>
                  {activeUnits.map((unit) => (
                    <div
                      key={unit.id}
                      className={`flex items-center justify-between p-2 rounded-md border ${getBracketColor(unit.bracket)}`}
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm">{unit.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Spawnou no turno {unit.spawnedRound} • Bracket {unit.bracket}
                          {unit.spawnZone && (
                            <span className="inline-flex items-center gap-1 ml-2">
                              <MapPin className="h-3 w-3 text-yellow-500" />
                              Zona {unit.spawnZone}
                            </span>
                          )}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300 hover:bg-red-950/50"
                        onClick={() => setUnitToDestroy(unit)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Destruir
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Destroyed Units */}
              {destroyedUnits.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Target className="h-4 w-4" />
                    <span>Destruídas ({destroyedUnits.length})</span>
                  </div>
                  {destroyedUnits.map((unit) => (
                    <div
                      key={unit.id}
                      className="flex items-center justify-between p-2 rounded-md border border-gray-700/50 bg-gray-900/30 opacity-60"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm line-through">{unit.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {unit.destroyedByUnitName 
                            ? `Destruída por: ${unit.destroyedByUnitName}` 
                            : "Destruída"}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-gray-500 border-gray-600">
                        ☠️
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Summary */}
          <div className="flex items-center justify-between pt-2 border-t border-red-500/20 text-sm">
            <span className="text-muted-foreground">Total:</span>
            <div className="flex gap-2">
              <Badge className="bg-green-600/20 text-green-400">
                {activeUnits.length} ativas
              </Badge>
              <Badge className="bg-gray-600/20 text-gray-400">
                {destroyedUnits.length} destruídas
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Destroy Confirmation Dialog with Unit Selection */}
      <AlertDialog open={!!unitToDestroy} onOpenChange={() => {
        setUnitToDestroy(null);
        setSelectedDestroyerUnitId(null);
      }}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Skull className="h-5 w-5 text-red-500" />
              Destruir Unidade da Horda
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <p>
                  Marcar "<strong>{unitToDestroy?.name}</strong>" como destruída?
                </p>
                
                {activePlayerUnits.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground block">
                      Qual unidade fez a kill?
                    </label>
                    <p className="text-xs text-muted-foreground">
                      A unidade selecionada receberá +1 em "Unidades Inimigas Destruídas"
                    </p>
                    <ScrollArea className="h-[200px] border rounded-md p-2">
                      <div className="space-y-2">
                        {activePlayerUnits.map((unit) => (
                          <div
                            key={unit.id}
                            className={`p-2 rounded-md border cursor-pointer transition-colors ${
                              selectedDestroyerUnitId === unit.id
                                ? "bg-primary/20 border-primary"
                                : "hover:bg-muted/50 border-border"
                            }`}
                            onClick={() => setSelectedDestroyerUnitId(unit.id)}
                          >
                            <p className="font-medium text-sm">
                              {unit.crusadeName || unit.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {unit.playerName}
                            </p>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}
                
                {activePlayerUnits.length === 0 && (
                  <p className="text-sm text-yellow-500">
                    ⚠️ Nenhuma unidade ativa disponível para atribuir a kill.
                  </p>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDestroy}
              className="bg-red-600 hover:bg-red-700"
              disabled={activePlayerUnits.length > 0 && !selectedDestroyerUnitId}
            >
              {selectedDestroyerUnitId ? "Confirmar Kill" : "Destruir sem Atribuição"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}