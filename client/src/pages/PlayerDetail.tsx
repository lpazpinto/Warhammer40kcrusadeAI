import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { Loader2, ArrowLeft, Star, Skull, Award, Pencil, ScrollText } from "lucide-react";
import { Link, useParams } from "wouter";

const parseModels = (modelsJson: any): any[] => {
  if (Array.isArray(modelsJson)) return modelsJson;
  if (typeof modelsJson === 'string') {
    try {
      return JSON.parse(modelsJson);
    } catch (e) {
      console.error('Failed to parse models JSON:', e);
      return [];
    }
  }
  return [];
};

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

  const utils = trpc.useUtils();
  const updateUnit = trpc.crusadeUnit.update.useMutation({
    onSuccess: () => {
      utils.crusadeUnit.list.invalidate({ playerId });
    },
  });

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

  const totalSupplyUsed = units?.reduce((sum, unit) => sum + (unit.pointsCost || 0), 0) || 0;
  const supplyLimit = player.supplyLimit || 1000;
  const percentage = Math.min((totalSupplyUsed / supplyLimit) * 100, 100);
  const isOverLimit = totalSupplyUsed > supplyLimit;
  const isNearLimit = percentage >= 80 && !isOverLimit;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 space-y-6">
        <Button variant="ghost" asChild>
          <Link href={`/campaign/${player.campaignId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Campanha
          </Link>
        </Button>

        <section className="command-surface p-6 md:p-8">
          <div className="space-y-3">
            <p className="command-title text-xs text-muted-foreground">Force Dossier</p>
            <h1 className="text-3xl md:text-5xl font-bold">{player.name}</h1>
            <p className="text-lg text-muted-foreground">{player.faction} {player.detachment && `• ${player.detachment}`}</p>
            {player.crusadeForceName && (
              <p className="text-base text-muted-foreground italic">"{player.crusadeForceName}"</p>
            )}
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-border/60 bg-background/40 p-4"><p className="text-xs command-title text-muted-foreground">Pontos de Requisição</p><p className="mt-1 text-2xl font-bold">{player.requisitionPoints}</p></div>
            <div className="rounded-lg border border-border/60 bg-background/40 p-4"><p className="text-xs command-title text-muted-foreground">Batalhas</p><p className="mt-1 text-2xl font-bold">{player.battleTally}</p></div>
            <div className="rounded-lg border border-border/60 bg-background/40 p-4"><p className="text-xs command-title text-muted-foreground">Vitórias</p><p className="mt-1 text-2xl font-bold">{player.victories}</p></div>
            <div className="rounded-lg border border-border/60 bg-background/40 p-4"><p className="text-xs command-title text-muted-foreground">Limite de Suprimento</p><p className="mt-1 text-2xl font-bold">{supplyLimit}</p></div>
          </div>
        </section>

        <Card className="command-surface">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Uso de Suprimento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Supply Consumido</span>
                <span className={`font-medium ${isOverLimit ? 'text-red-500' : isNearLimit ? 'text-yellow-500' : 'text-green-500'}`}>
                  {totalSupplyUsed} / {supplyLimit}
                </span>
              </div>
              <Progress value={percentage} className="h-2" />
              {isOverLimit && (
                <p className="text-xs text-red-500 mt-1">⚠️ Limite de suprimento excedido! Remova unidades ou compre "Aumentar Limite de Suprimento".</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="command-surface">
          <CardHeader className="border-b border-border/50">
            <CardTitle className="flex items-center gap-2"><ScrollText className="h-5 w-5 text-primary" /> Order of Battle</CardTitle>
            <CardDescription>
              Unidades de Cruzada desta força • {units?.length || 0} unidades
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {units && units.length > 0 ? (
              <div className="space-y-4">
                {units.map((unit) => (
                  <Card key={unit.id} className="border border-border/70 bg-background/25">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4 gap-4">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold">{unit.unitName}</h3>
                            {unit.crusadeName && <span className="text-muted-foreground italic">"{unit.crusadeName}"</span>}
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => {
                              const newName = prompt('Digite um apelido para esta unidade (deixe vazio para remover):', unit.crusadeName || '');
                              if (newName !== null) {
                                updateUnit.mutate({ id: unit.id, crusadeName: newName || undefined });
                              }
                            }}>
                              <Pencil className="h-3 w-3" />
                            </Button>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            <Badge className={getRankColor(unit.rank)}>{getRankLabel(unit.rank)}</Badge>
                            {unit.category && <Badge variant="outline">{unit.category}</Badge>}
                            {unit.isDestroyed && (
                              <Badge variant="destructive"><Skull className="mr-1 h-3 w-3" />Destruído</Badge>
                            )}
                          </div>
                        </div>

                        <div className="text-right rounded-md border border-border/50 px-3 py-2 bg-background/40">
                          <div className="text-2xl font-bold">{unit.experiencePoints} XP</div>
                          <div className="text-sm text-muted-foreground">{unit.powerRating} PR • {unit.pointsCost} pts</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4 text-sm">
                        <div className="rounded-md border border-border/50 px-2 py-1.5"><div className="text-muted-foreground text-xs">Batalhas</div><div className="font-semibold">{unit.battlesPlayed}</div></div>
                        <div className="rounded-md border border-border/50 px-2 py-1.5"><div className="text-muted-foreground text-xs">Sobrevivências</div><div className="font-semibold">{unit.battlesSurvived}</div></div>
                        <div className="rounded-md border border-border/50 px-2 py-1.5"><div className="text-muted-foreground text-xs">Kills</div><div className="font-semibold">{unit.enemyUnitsDestroyed}</div></div>
                        <div className="rounded-md border border-border/50 px-2 py-1.5"><div className="text-muted-foreground text-xs">Modelos</div><div className="font-semibold">{parseModels(unit.models).reduce((sum: number, m: any) => sum + m.count, 0)}</div></div>
                      </div>

                      {parseModels(unit.models).length > 0 && (
                        <div className="space-y-3 pt-4 border-t border-border/50">
                          <div className="flex items-center gap-2 text-sm font-semibold"><Award className="h-4 w-4" />Modelos & Armas</div>
                          <div className="space-y-2">
                            {parseModels(unit.models).map((model: any, idx: number) => (
                              <div key={idx} className="text-sm rounded-md border border-border/40 p-2">
                                <div className="font-medium">{model.count}x {model.name}</div>
                                {model.weapons && model.weapons.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {model.weapons.map((weapon: string, wIdx: number) => (
                                      <Badge key={wIdx} variant="outline" className="text-xs">{weapon}</Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {(unit.battleHonours.length > 0 || unit.battleTraits.length > 0 || unit.battleScars.length > 0) && (
                        <div className="space-y-2 pt-4 border-t border-border/50">
                          {unit.battleHonours.length > 0 && <div><div className="flex items-center gap-2 text-sm font-semibold mb-1"><Award className="h-4 w-4 text-yellow-500" />Battle Honours</div><div className="text-sm text-muted-foreground pl-6">{unit.battleHonours.join(', ')}</div></div>}
                          {unit.battleTraits.length > 0 && <div><div className="flex items-center gap-2 text-sm font-semibold mb-1"><Star className="h-4 w-4 text-blue-500" />Battle Traits</div><div className="text-sm text-muted-foreground pl-6">{unit.battleTraits.join(', ')}</div></div>}
                          {unit.battleScars.length > 0 && <div><div className="flex items-center gap-2 text-sm font-semibold mb-1"><Skull className="h-4 w-4 text-red-500" />Battle Scars</div><div className="text-sm text-muted-foreground pl-6">{unit.battleScars.join(', ')}</div></div>}
                        </div>
                      )}

                      {unit.notes && <div className="mt-4 pt-4 border-t border-border/50"><div className="text-sm text-muted-foreground">{unit.notes}</div></div>}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>Nenhuma unidade importada ainda</p>
                <p className="text-sm mt-2">Use o botão "Importar Exército" na página da campanha</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
