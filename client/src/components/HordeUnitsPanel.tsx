import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skull, Trash2, Target, Shield, Swords } from "lucide-react";
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

export interface HordeUnit {
  id: string;
  name: string;
  spawnedRound: number;
  status: "active" | "destroyed";
  bracket: string;
  destroyedBy?: string; // Player name who destroyed it
}

interface HordeUnitsPanelProps {
  units: HordeUnit[];
  faction: string;
  onDestroyUnit: (unitId: string, destroyedBy?: string) => void;
  playerNames?: string[];
}

export default function HordeUnitsPanel({
  units,
  faction,
  onDestroyUnit,
  playerNames = [],
}: HordeUnitsPanelProps) {
  const [unitToDestroy, setUnitToDestroy] = useState<HordeUnit | null>(null);
  const [selectedDestroyer, setSelectedDestroyer] = useState<string>("");

  const activeUnits = units.filter(u => u.status === "active");
  const destroyedUnits = units.filter(u => u.status === "destroyed");

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
      onDestroyUnit(unitToDestroy.id, selectedDestroyer || undefined);
      setUnitToDestroy(null);
      setSelectedDestroyer("");
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
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300 hover:bg-red-950/50"
                    onClick={() => setUnitToDestroy(unit)}
                  >
                    <Trash2 className="h-4 w-4" />
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
                      {unit.destroyedBy ? `Destruída por ${unit.destroyedBy}` : "Destruída"}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-gray-500 border-gray-600">
                    ☠️
                  </Badge>
                </div>
              ))}
            </div>
          )}

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

      {/* Destroy Confirmation Dialog */}
      <AlertDialog open={!!unitToDestroy} onOpenChange={() => setUnitToDestroy(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Destruir Unidade da Horda</AlertDialogTitle>
            <AlertDialogDescription>
              Marcar "{unitToDestroy?.name}" como destruída?
              {playerNames.length > 0 && (
                <div className="mt-4">
                  <label className="text-sm font-medium text-foreground">
                    Quem destruiu esta unidade? (opcional - ganha +1 SP)
                  </label>
                  <select
                    className="w-full mt-2 p-2 rounded-md border bg-background"
                    value={selectedDestroyer}
                    onChange={(e) => setSelectedDestroyer(e.target.value)}
                  >
                    <option value="">Não especificado</option>
                    {playerNames.map((name) => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDestroy}
              className="bg-red-600 hover:bg-red-700"
            >
              Confirmar Destruição
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
