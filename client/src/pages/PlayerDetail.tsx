import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Loader2, ArrowLeft, Star, Skull, Award } from "lucide-react";
import { Link, useParams } from "wouter";

export default function PlayerDetail() {
  const { id } = useParams<{ id: string }>();
  const playerId = parseInt(id || '0');

  const { data: player, isLoading: playerLoading } = trpc.player.get.useQuery(
    { id: playerId },
    { enabled: !isNaN(playerId) && playerId > 0 }
  );
  const { data: units, isLoading: unitsLoading } = trpc.crusadeUnit.list.useQuery(
    { playerId },
    { enabled: !isNaN(playerId) && playerId > 0 }
  );

  if (playerLoading || unitsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!player) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <p>Jogador não encontrado</p>
            <Button asChild className="mt-4">
              <Link href="/campaigns">Voltar</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'legendary': return 'bg-purple-500/20 text-purple-500 border-purple-500/50';
      case 'heroic': return 'bg-orange-500/20 text-orange-500 border-orange-500/50';
      case 'battle_hardened': return 'bg-blue-500/20 text-blue-500 border-blue-500/50';
      case 'blooded': return 'bg-green-500/20 text-green-500 border-green-500/50';
      default: return 'bg-gray-500/20 text-gray-500 border-gray-500/50';
    }
  };

  const getRankLabel = (rank: string) => {
    switch (rank) {
      case 'legendary': return 'Lendário';
      case 'heroic': return 'Heroico';
      case 'battle_hardened': return 'Veterano';
      case 'blooded': return 'Experiente';
      default: return 'Pronto para Batalha';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link href={`/campaign/${player.campaignId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Campanha
          </Link>
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{player.name}</h1>
          <p className="text-xl text-muted-foreground mb-4">
            {player.faction} {player.detachment && `• ${player.detachment}`}
          </p>
          {player.crusadeForceName && (
            <p className="text-lg text-muted-foreground italic">
              "{player.crusadeForceName}"
            </p>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Pontos de Requisição</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{player.requisitionPoints}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Batalhas Jogadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{player.battleTally}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Vitórias</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{player.victories}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Pontos de Suprimento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{player.supplyPoints}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Order of Battle</CardTitle>
            <CardDescription>
              Unidades de Cruzada desta força • {units?.length || 0} unidades
            </CardDescription>
          </CardHeader>
          <CardContent>
            {units && units.length > 0 ? (
              <div className="space-y-4">
                {units.map((unit) => (
                  <Card key={unit.id} className="border-2">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold">{unit.unitName}</h3>
                            {unit.crusadeName && (
                              <span className="text-muted-foreground italic">
                                "{unit.crusadeName}"
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 mb-3">
                            <Badge className={getRankColor(unit.rank)}>
                              {getRankLabel(unit.rank)}
                            </Badge>
                            {unit.category && (
                              <Badge variant="outline">{unit.category}</Badge>
                            )}
                            {unit.isDestroyed && (
                              <Badge variant="destructive">
                                <Skull className="mr-1 h-3 w-3" />
                                Destruído
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-2xl font-bold">{unit.experiencePoints} XP</div>
                          <div className="text-sm text-muted-foreground">
                            {unit.powerRating} PR • {unit.pointsCost} pts
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Batalhas</div>
                          <div className="font-semibold">{unit.battlesPlayed}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Sobrevivências</div>
                          <div className="font-semibold">{unit.battlesSurvived}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Kills</div>
                          <div className="font-semibold">{unit.enemyUnitsDestroyed}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Modelos</div>
                          <div className="font-semibold">
                            {unit.models.reduce((sum: number, m: any) => sum + m.count, 0)}
                          </div>
                        </div>
                      </div>

                      {(unit.battleHonours.length > 0 || unit.battleTraits.length > 0 || unit.battleScars.length > 0) && (
                        <div className="space-y-2 pt-4 border-t">
                          {unit.battleHonours.length > 0 && (
                            <div>
                              <div className="flex items-center gap-2 text-sm font-semibold mb-1">
                                <Award className="h-4 w-4 text-yellow-500" />
                                Battle Honours
                              </div>
                              <div className="text-sm text-muted-foreground pl-6">
                                {unit.battleHonours.join(', ')}
                              </div>
                            </div>
                          )}
                          
                          {unit.battleTraits.length > 0 && (
                            <div>
                              <div className="flex items-center gap-2 text-sm font-semibold mb-1">
                                <Star className="h-4 w-4 text-blue-500" />
                                Battle Traits
                              </div>
                              <div className="text-sm text-muted-foreground pl-6">
                                {unit.battleTraits.join(', ')}
                              </div>
                            </div>
                          )}
                          
                          {unit.battleScars.length > 0 && (
                            <div>
                              <div className="flex items-center gap-2 text-sm font-semibold mb-1">
                                <Skull className="h-4 w-4 text-red-500" />
                                Battle Scars
                              </div>
                              <div className="text-sm text-muted-foreground pl-6">
                                {unit.battleScars.join(', ')}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {unit.notes && (
                        <div className="mt-4 pt-4 border-t">
                          <div className="text-sm text-muted-foreground">{unit.notes}</div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>Nenhuma unidade importada ainda</p>
                <p className="text-sm mt-2">
                  Use o botão "Importar Exército" na página da campanha
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

