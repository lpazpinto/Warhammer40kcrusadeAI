import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Skull, Target, Zap } from "lucide-react";

interface BattleParticipantStats {
  playerName: string;
  unitsDeployed: number;
  unitsDestroyed: number;
  enemyUnitsKilled: number;
  objectivesCaptured: number;
}

interface BattleSummaryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  battleNumber?: number;
  deployment?: string;
  victory?: "player" | "opponent" | "draw";
  participants: BattleParticipantStats[];
  onDistributeXP: () => void;
  onReturnToCampaign: () => void;
  isDistributingXP?: boolean;
}

export default function BattleSummaryModal({
  open,
  onOpenChange,
  battleNumber,
  deployment,
  victory = "draw",
  participants,
  onDistributeXP,
  onReturnToCampaign,
  isDistributingXP = false,
}: BattleSummaryModalProps) {
  const victoryColor = {
    player: "bg-green-500",
    opponent: "bg-red-500",
    draw: "bg-yellow-500",
  }[victory];

  const victoryText = {
    player: "Vitória!",
    opponent: "Derrota",
    draw: "Empate",
  }[victory];

  // Calculate total RP awarded (1 RP per battle + bonuses)
  const totalRP = participants.reduce((sum, p) => {
    let rp = 1; // Base RP
    if (p.objectivesCaptured >= 3) rp += 1; // Bonus for objectives
    if (p.enemyUnitsKilled >= 5) rp += 1; // Bonus for kills
    return sum + rp;
  }, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Trophy className="h-6 w-6" />
            Resumo da Batalha #{battleNumber}
          </DialogTitle>
          <DialogDescription>
            {deployment} - {victoryText}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Victory Status */}
          <Card className={`${victoryColor} text-white`}>
            <CardHeader>
              <CardTitle className="text-center text-2xl">{victoryText}</CardTitle>
            </CardHeader>
          </Card>

          {/* Participants Stats */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Estatísticas dos Jogadores</h3>
            {participants.map((participant, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-base">{participant.playerName}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-blue-500" />
                      <div>
                        <p className="text-xs text-muted-foreground">Deployadas</p>
                        <p className="font-bold">{participant.unitsDeployed}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Skull className="h-4 w-4 text-red-500" />
                      <div>
                        <p className="text-xs text-muted-foreground">Destruídas</p>
                        <p className="font-bold">{participant.unitsDestroyed}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-yellow-500" />
                      <div>
                        <p className="text-xs text-muted-foreground">Kills</p>
                        <p className="font-bold">{participant.enemyUnitsKilled}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-green-500" />
                      <div>
                        <p className="text-xs text-muted-foreground">Objetivos</p>
                        <p className="font-bold">{participant.objectivesCaptured}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* RP Summary */}
          <Card className="bg-primary/10">
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                <span>Requisition Points Totais</span>
                <Badge variant="secondary" className="text-lg px-4 py-1">
                  {totalRP} RP
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                1 RP base por batalha + bônus por objetivos e kills
              </p>
            </CardContent>
          </Card>

          {/* XP Distribution Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Distribuição de XP</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm">
                • <strong>Unidades sobreviventes:</strong> 1 XP base
              </p>
              <p className="text-sm">
                • <strong>Unidades com kills:</strong> +1 XP por kill
              </p>
              <p className="text-sm">
                • <strong>Promoções automáticas:</strong> Ranks atualizados conforme XP
              </p>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onReturnToCampaign}
          >
            Voltar para Campanha
          </Button>
          <Button
            onClick={onDistributeXP}
            disabled={isDistributingXP}
            className="gap-2"
          >
            <Zap className="h-4 w-4" />
            {isDistributingXP ? "Distribuindo..." : "Distribuir XP"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
