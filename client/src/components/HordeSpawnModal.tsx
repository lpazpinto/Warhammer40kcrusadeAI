import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skull, Dice6, Target, Plus, X } from "lucide-react";

interface SpawnResult {
  roll: number;
  modifiedRoll: number;
  bracket: string;
  availableUnits: string[];
  selectedUnit: string | null;
}

interface HordeSpawnModalProps {
  isOpen: boolean;
  onClose: () => void;
  spawnResult: SpawnResult | null;
  faction: string;
  battleRound: number;
  onConfirm: (unit: string) => void;
  isLoading?: boolean;
}

export default function HordeSpawnModal({
  isOpen,
  onClose,
  spawnResult,
  faction,
  battleRound,
  onConfirm,
  isLoading = false,
}: HordeSpawnModalProps) {
  if (!spawnResult) return null;

  const isNoSpawn = spawnResult.bracket === "2" || spawnResult.selectedUnit === null;
  const roundModifier = battleRound <= 2 ? 0 : battleRound <= 4 ? 1 : 2;

  const getBracketColor = (bracket: string) => {
    switch (bracket) {
      case "2": return "bg-gray-600";
      case "3-4": return "bg-green-600";
      case "5-6": return "bg-blue-600";
      case "7-9": return "bg-purple-600";
      case "10+": return "bg-red-600";
      default: return "bg-gray-600";
    }
  };

  const getBracketDescription = (bracket: string) => {
    switch (bracket) {
      case "2": return "Sem Spawn - A Horda não conseguiu reforços";
      case "3-4": return "Spawn Fraco - Unidades básicas";
      case "5-6": return "Spawn Médio - Unidades padrão";
      case "7-9": return "Spawn Forte - Unidades de elite";
      case "10+": return "Spawn Crítico - Unidades poderosas!";
      default: return "";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Skull className="h-5 w-5 text-red-500" />
            Spawn da Horda - {faction}
          </DialogTitle>
          <DialogDescription>
            Turno de Batalha {battleRound}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Roll Result */}
          <Card className="bg-muted/50">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Dice6 className="h-5 w-5 text-yellow-500" />
                  <span className="text-sm text-muted-foreground">Rolagem 2D6:</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{spawnResult.roll}</span>
                  {roundModifier > 0 && (
                    <span className="text-sm text-green-500">+{roundModifier}</span>
                  )}
                  {spawnResult.modifiedRoll !== spawnResult.roll && (
                    <span className="text-lg text-muted-foreground">= {spawnResult.modifiedRoll}</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bracket Result */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Bracket:</span>
            <Badge className={`${getBracketColor(spawnResult.bracket)} text-white`}>
              {spawnResult.bracket}
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground text-center">
            {getBracketDescription(spawnResult.bracket)}
          </p>

          {/* Selected Unit */}
          {!isNoSpawn && spawnResult.selectedUnit && (
            <Card className="border-red-500/50 bg-red-950/20">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium text-red-400">Unidade Spawnada:</span>
                </div>
                <p className="text-lg font-bold text-center">{spawnResult.selectedUnit}</p>
              </CardContent>
            </Card>
          )}

          {/* No Spawn Message */}
          {isNoSpawn && (
            <Card className="border-gray-500/50 bg-gray-950/20">
              <CardContent className="pt-4 text-center">
                <X className="h-8 w-8 mx-auto text-gray-500 mb-2" />
                <p className="text-muted-foreground">
                  Nenhuma unidade spawnou neste turno.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Available Units in Bracket */}
          {!isNoSpawn && spawnResult.availableUnits.length > 1 && (
            <details className="text-sm">
              <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                Ver outras unidades possíveis ({spawnResult.availableUnits.length})
              </summary>
              <ul className="mt-2 space-y-1 pl-4 text-muted-foreground">
                {spawnResult.availableUnits.map((unit, index) => (
                  <li key={index} className={unit === spawnResult.selectedUnit ? "text-red-400 font-medium" : ""}>
                    {unit === spawnResult.selectedUnit ? "→ " : "• "}{unit}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>

        <DialogFooter>
          {isNoSpawn ? (
            <Button onClick={onClose} className="w-full">
              Continuar
            </Button>
          ) : (
            <Button 
              onClick={() => spawnResult.selectedUnit && onConfirm(spawnResult.selectedUnit)}
              disabled={isLoading}
              className="w-full gap-2 bg-red-600 hover:bg-red-700"
            >
              <Plus className="h-4 w-4" />
              {isLoading ? "Adicionando..." : "Adicionar à Batalha"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
