import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trophy, Zap, Skull, Shield } from "lucide-react";

interface UnitDetails {
  id: number;
  unitName: string;
  crusadeName?: string;
  powerRating: number;
  rank: string;
  experiencePoints: number;
  crusadePoints: number;
  battlesPlayed: number;
  battlesSurvived: number;
  enemyUnitsDestroyed: number;
  battleHonours?: string[];
  battleTraits?: string[];
  battleScars?: string[];
}

interface UnitDetailsPopoverProps {
  unit: UnitDetails;
  children: React.ReactNode;
}

export default function UnitDetailsPopover({ unit, children }: UnitDetailsPopoverProps) {
  const getRankColor = (rank: string) => {
    switch (rank.toLowerCase()) {
      case "battle_ready":
        return "bg-gray-500";
      case "blooded":
        return "bg-blue-500";
      case "battle_hardened":
        return "bg-purple-500";
      case "heroic":
        return "bg-orange-500";
      case "legendary":
        return "bg-yellow-500";
      default:
        return "bg-gray-400";
    }
  };

  const getRankLabel = (rank: string) => {
    switch (rank.toLowerCase()) {
      case "battle_ready":
        return "Battle Ready";
      case "blooded":
        return "Blooded";
      case "battle_hardened":
        return "Battle Hardened";
      case "heroic":
        return "Heroic";
      case "legendary":
        return "Legendary";
      default:
        return rank;
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-96" align="start">
        <ScrollArea className="max-h-[600px]">
          <div className="space-y-4">
            {/* Header */}
            <div>
              <h3 className="font-bold text-lg">{unit.crusadeName || unit.unitName}</h3>
              {unit.crusadeName && (
                <p className="text-sm text-muted-foreground">{unit.unitName}</p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <Badge className={getRankColor(unit.rank)}>
                  {getRankLabel(unit.rank)}
                </Badge>
                <Badge variant="outline">{unit.powerRating} PL</Badge>
              </div>
            </div>

            {/* Stats Grid */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Estatísticas</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">XP</p>
                    <p className="font-bold">{unit.experiencePoints}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">CP</p>
                    <p className="font-bold">{unit.crusadePoints}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Batalhas</p>
                    <p className="font-bold">{unit.battlesPlayed}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Skull className="h-4 w-4 text-red-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Kills</p>
                    <p className="font-bold">{unit.enemyUnitsDestroyed}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Battle Honours */}
            {unit.battleHonours && unit.battleHonours.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    Battle Honours
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {unit.battleHonours.map((honour, index) => (
                    <div key={index} className="text-sm">
                      <Badge variant="secondary" className="mb-1">
                        {honour}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Battle Traits */}
            {unit.battleTraits && unit.battleTraits.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Zap className="h-4 w-4 text-blue-500" />
                    Battle Traits
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {unit.battleTraits.map((trait, index) => (
                    <div key={index} className="text-sm">
                      <Badge variant="outline" className="mb-1">
                        {trait}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Battle Scars */}
            {unit.battleScars && unit.battleScars.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Skull className="h-4 w-4 text-red-500" />
                    Battle Scars
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {unit.battleScars.map((scar, index) => (
                    <div key={index} className="text-sm">
                      <Badge variant="destructive" className="mb-1">
                        {scar}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Empty States */}
            {(!unit.battleHonours || unit.battleHonours.length === 0) &&
             (!unit.battleTraits || unit.battleTraits.length === 0) &&
             (!unit.battleScars || unit.battleScars.length === 0) && (
              <Card>
                <CardContent className="py-6">
                  <p className="text-sm text-muted-foreground text-center">
                    Nenhum honour, trait ou scar ainda
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
