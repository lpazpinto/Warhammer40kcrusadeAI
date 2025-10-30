import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { trpc } from "@/lib/trpc";

type Player = {
  id: number;
  name: string;
  faction: string;
};

type UnitSelectionProps = {
  players: Player[];
  selectedPlayerIds: number[];
  gameSize: number;
  playerUnits: Record<number, number[]>;
  onUnitsChange: (playerId: number, unitIds: number[]) => void;
  onComplete: () => void;
};

export default function UnitSelection({
  players,
  selectedPlayerIds,
  gameSize,
  playerUnits,
  onUnitsChange,
  onComplete,
}: UnitSelectionProps) {
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);

  const currentPlayerId = selectedPlayerIds[currentPlayerIndex];
  const currentPlayer = players.find((p) => p.id === currentPlayerId);
  const pointsPerPlayer = Math.floor(gameSize / selectedPlayerIds.length);

  // Fetch units for current player
  const { data: units, isLoading } = trpc.crusadeUnit.list.useQuery(
    { playerId: currentPlayerId },
    { enabled: !!currentPlayerId }
  );

  // Get selected unit IDs for current player
  const selectedUnitIds = playerUnits[currentPlayerId] || [];

  // Calculate total points of selected units
  const totalPoints =
    units?.reduce((sum, unit) => {
      if (selectedUnitIds.includes(unit.id)) {
        return sum + unit.pointsCost;
      }
      return sum;
    }, 0) || 0;

  const isOverLimit = totalPoints > pointsPerPlayer;

  const toggleUnit = (unitId: number, unitPoints: number) => {
    const currentSelected = playerUnits[currentPlayerId] || [];
    const isSelected = currentSelected.includes(unitId);

    let newSelected: number[];
    if (isSelected) {
      // Remove unit
      newSelected = currentSelected.filter((id) => id !== unitId);
    } else {
      // Add unit only if it doesn't exceed limit
      const newTotal = totalPoints + unitPoints;
      if (newTotal <= pointsPerPlayer) {
        newSelected = [...currentSelected, unitId];
      } else {
        return; // Don't add if over limit
      }
    }

    onUnitsChange(currentPlayerId, newSelected);
  };

  const handleNextPlayer = () => {
    if (currentPlayerIndex < selectedPlayerIds.length - 1) {
      setCurrentPlayerIndex(currentPlayerIndex + 1);
    } else {
      onComplete();
    }
  };

  const canProceed = selectedUnitIds.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-lg font-medium">{currentPlayer?.name}</p>
          <p className="text-sm text-muted-foreground">
            Jogador {currentPlayerIndex + 1} de {selectedPlayerIds.length}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Pontos Usados</p>
          <p
            className={`text-2xl font-bold ${
              isOverLimit ? "text-destructive" : "text-primary"
            }`}
          >
            {totalPoints} / {pointsPerPlayer} pts
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="p-8 border-2 border-dashed rounded-lg text-center text-muted-foreground">
          <p>Carregando unidades...</p>
        </div>
      ) : units && units.length > 0 ? (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {units.map((unit) => {
            const isSelected = selectedUnitIds.includes(unit.id);
            const wouldExceed =
              !isSelected && totalPoints + unit.pointsCost > pointsPerPlayer;

            return (
              <div
                key={unit.id}
                className={`flex items-center space-x-3 p-3 border rounded-lg ${
                  isSelected ? "bg-primary/10 border-primary" : "hover:bg-muted"
                } ${wouldExceed ? "opacity-50" : "cursor-pointer"}`}
                onClick={() => !wouldExceed && toggleUnit(unit.id, unit.pointsCost)}
              >
                <Checkbox
                  checked={isSelected}
                  disabled={wouldExceed}
                  onCheckedChange={() => toggleUnit(unit.id, unit.pointsCost)}
                />
                <div className="flex-1">
                  <p className="font-medium">{unit.unitName}</p>
                  <p className="text-sm text-muted-foreground">
                    {unit.category} • {unit.powerRating} PL • Rank: {unit.rank}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{unit.pointsCost} pts</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-8 border-2 border-dashed rounded-lg text-center text-muted-foreground">
          <p>Nenhuma unidade disponível</p>
          <p className="text-xs mt-2">Adicione unidades ao Order of Battle primeiro</p>
        </div>
      )}

      {selectedUnitIds.length === 0 && (
        <p className="text-sm text-muted-foreground text-center">
          Selecione pelo menos uma unidade para continuar
        </p>
      )}

      {canProceed && (
        <Button onClick={handleNextPlayer} className="w-full">
          {currentPlayerIndex < selectedPlayerIds.length - 1
            ? "Próximo Jogador"
            : "Concluir Seleção"}
        </Button>
      )}
    </div>
  );
}

