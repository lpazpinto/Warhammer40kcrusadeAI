import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Loader2, Plus, Sword, Upload, Users, CheckCircle2, XCircle, ScrollText, Shield } from "lucide-react";
import { useState } from "react";
import { Link, useParams, useLocation } from "wouter";
import { toast } from "sonner";
import { NARRATIVE_OBJECTIVES } from "@shared/narrativeObjectives";
import { useAuth } from "@/_core/hooks/useAuth";

export default function CampaignDetail() {
  const { id } = useParams<{ id: string }>();
  const campaignId = parseInt(id || '0');
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const [playerDialogOpen, setPlayerDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);

  const [newPlayer, setNewPlayer] = useState({
    name: "",
    faction: "",
    detachment: "",
    crusadeForceName: "",
  });

  const [armyListContent, setArmyListContent] = useState("");

  const { data: campaign, isLoading: campaignLoading } = trpc.campaign.get.useQuery(
    { id: campaignId },
    { enabled: !isNaN(campaignId) && campaignId > 0 }
  );
  const { data: players, isLoading: playersLoading, refetch: refetchPlayers } = trpc.player.list.useQuery(
    { campaignId },
    { enabled: !isNaN(campaignId) && campaignId > 0 }
  );

  const createPlayer = trpc.player.create.useMutation({
    onSuccess: async (data) => {
      console.log('[createPlayer] Success response:', data);

      if (!data || !data.id || isNaN(data.id) || data.id <= 0) {
        console.error('[createPlayer] Invalid ID received:', data);
        toast.error('Erro: ID inválido retornado ao criar jogador');
        return;
      }

      toast.success("Lord Commander criado com sucesso!");
      setPlayerDialogOpen(false);
      setNewPlayer({ name: "", faction: "", detachment: "", crusadeForceName: "" });
      await refetchPlayers();
    },
    onError: (error) => {
      console.error('[createPlayer] Error:', error);
      toast.error(`Erro ao criar jogador: ${error.message}`);
    },
  });

  const importArmy = trpc.player.importArmy.useMutation({
    onSuccess: (data) => {
      toast.success(`Exército importado! ${data.unitsCreated} unidades criadas.`);
      setImportDialogOpen(false);
      setArmyListContent("");
      refetchPlayers();
    },
    onError: (error) => {
      toast.error(`Erro ao importar exército: ${error.message}`);
    },
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setArmyListContent(content);
      };
      reader.readAsText(file);
    }
  };

  if (campaignLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <p>Campanha não encontrada</p>
            <Button asChild className="mt-4">
              <Link href="/campaigns">Voltar</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 space-y-6">
        <section className="command-surface p-6 md:p-8">
          <div className="flex items-center gap-2 text-xs command-title text-muted-foreground mb-3">
            <Link href="/campaigns" className="hover:text-foreground">Campanhas</Link>
            <span>/</span>
            <span>{campaign.name}</span>
          </div>

          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="space-y-3">
              <p className="command-title text-xs text-muted-foreground">Dossiê da Campanha</p>
              <h1 className="text-3xl md:text-5xl font-bold">{campaign.name}</h1>
              <p className="text-muted-foreground max-w-2xl">Frente ativa contra {campaign.hordeFaction}. Conduza a campanha fase a fase e preserve os recursos da força.</p>
            </div>

            <div className="flex w-full xl:w-auto flex-col sm:flex-row gap-3">
              <Button size="lg" asChild className="w-full sm:w-auto">
                <Link href={`/battle/setup/${campaign.id}`}>
                  <Sword className="mr-2 h-5 w-5" />
                  Iniciar Batalha
                </Link>
              </Button>
              <Button size="lg" variant="outline" onClick={() => setPlayerDialogOpen(true)} className="w-full sm:w-auto">
                <Plus className="mr-2 h-5 w-5" />
                Reforçar Comandantes
              </Button>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-4">
            <div className="rounded-lg border border-border/60 bg-background/40 p-4">
              <p className="text-xs command-title text-muted-foreground">Status</p>
              <p className="mt-1 font-semibold">{campaign.status === 'ongoing' ? 'Em Andamento' : campaign.status === 'paused' ? 'Pausada' : 'Concluída'}</p>
            </div>
            <div className="rounded-lg border border-border/60 bg-background/40 p-4">
              <p className="text-xs command-title text-muted-foreground">Fase Atual</p>
              <p className="mt-1 font-semibold">{campaign.currentPhase} / 4</p>
            </div>
            <div className="rounded-lg border border-border/60 bg-background/40 p-4">
              <p className="text-xs command-title text-muted-foreground">Batalhas por Fase</p>
              <p className="mt-1 font-semibold">{campaign.battlesPerPhase}</p>
            </div>
            <div className="rounded-lg border border-border/60 bg-background/40 p-4">
              <p className="text-xs command-title text-muted-foreground">SP para Vitória</p>
              <p className="mt-1 font-semibold">{campaign.strategicPointsForVictory}</p>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-3">
          <section className="xl:col-span-2">
            <Card className="command-surface">
              <CardHeader className="border-b border-border/50">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-primary" /> Lord Commanders</CardTitle>
                    <CardDescription>Jogadores ativos nesta frente de guerra</CardDescription>
                  </div>

                  <Dialog open={playerDialogOpen} onOpenChange={setPlayerDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Adicionar Jogador
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Adicionar Lord Commander</DialogTitle>
                        <DialogDescription>
                          Crie um novo jogador para esta campanha
                        </DialogDescription>
                      </DialogHeader>

                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="playerName">Nome do Lord Commander</Label>
                          <Input id="playerName" placeholder="Ex: Lord Commander Dreir" value={newPlayer.name} onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })} />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="faction">Facção</Label>
                          <Input id="faction" placeholder="Ex: Astra Militarum" value={newPlayer.faction} onChange={(e) => setNewPlayer({ ...newPlayer, faction: e.target.value })} />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="detachment">Destacamento (opcional)</Label>
                          <Input id="detachment" placeholder="Ex: Combined Arms" value={newPlayer.detachment} onChange={(e) => setNewPlayer({ ...newPlayer, detachment: e.target.value })} />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="forceName">Nome da Força de Cruzada (opcional)</Label>
                          <Input id="forceName" placeholder="Ex: 13th Death Korps Regiment" value={newPlayer.crusadeForceName} onChange={(e) => setNewPlayer({ ...newPlayer, crusadeForceName: e.target.value })} />
                        </div>
                      </div>

                      <DialogFooter>
                        <Button onClick={() => createPlayer.mutate({ campaignId, userId: user?.id || 0, ...newPlayer })} disabled={!newPlayer.name || !newPlayer.faction || createPlayer.isPending}>
                          {createPlayer.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Criar Jogador
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {playersLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : players && players.length > 0 ? (
                  <div className="space-y-4">
                    {players.map((player) => (
                      <Card key={player.id} className="border border-border/70 bg-background/30">
                        <CardContent className="pt-5">
                          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold mb-1">{player.name}</h3>
                              <p className="text-sm text-muted-foreground mb-3">{player.faction} {player.detachment && `• ${player.detachment}`}</p>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                                <div className="rounded-md border border-border/50 px-2 py-1.5">
                                  <div className="text-muted-foreground text-xs">RP</div>
                                  <div className="font-semibold">{player.requisitionPoints}</div>
                                </div>
                                <div className="rounded-md border border-border/50 px-2 py-1.5">
                                  <div className="text-muted-foreground text-xs">Batalhas</div>
                                  <div className="font-semibold">{player.battleTally}</div>
                                </div>
                                <div className="rounded-md border border-border/50 px-2 py-1.5">
                                  <div className="text-muted-foreground text-xs">Vitórias</div>
                                  <div className="font-semibold">{player.victories}</div>
                                </div>
                                <div className="rounded-md border border-border/50 px-2 py-1.5">
                                  <div className="text-muted-foreground text-xs">SP</div>
                                  <div className="font-semibold">{player.supplyPoints}</div>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2">
                              <Button size="sm" variant="outline" onClick={() => {
                                if (player.id && !isNaN(player.id) && player.id > 0) {
                                  setSelectedPlayerId(player.id);
                                  setImportDialogOpen(true);
                                } else {
                                  console.error('Invalid player ID:', player.id);
                                  toast.error('ID do jogador inválido');
                                }
                              }}>
                                <Upload className="mr-2 h-4 w-4" />
                                Importar Exército
                              </Button>

                              <Button size="sm" asChild={!!(player.id && !isNaN(player.id) && player.id > 0)} disabled={!player.id || isNaN(player.id) || player.id <= 0}>
                                {player.id && !isNaN(player.id) && player.id > 0 ? (
                                  <Link href={`/player/${player.id}`}>Ver Dossiê</Link>
                                ) : (
                                  <span>Ver Dossiê</span>
                                )}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum jogador adicionado ainda</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          <section className="space-y-5">
            <Card className="command-surface">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2"><ScrollText className="h-5 w-5 text-primary" /> Briefing da Campanha</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="rounded-md border border-border/60 bg-background/40 p-3">
                  <div className="text-xs text-muted-foreground command-title">Facção da Horda</div>
                  <div className="font-semibold">{campaign.hordeFaction}</div>
                </div>
                <div className="rounded-md border border-border/60 bg-background/40 p-3">
                  <div className="text-xs text-muted-foreground command-title">Pontos para Vitória</div>
                  <div className="font-semibold">{campaign.strategicPointsForVictory}</div>
                </div>
              </CardContent>
            </Card>

            <Card className="command-surface">
              <CardHeader>
                <CardTitle>Objetivo Narrativo - Fase {campaign.currentPhase}</CardTitle>
                <CardDescription>
                  {NARRATIVE_OBJECTIVES[campaign.currentNarrativeObjective]?.titlePt || campaign.currentNarrativeObjective}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm font-semibold mb-1">Descrição</div>
                  <p className="text-sm text-muted-foreground">
                    {NARRATIVE_OBJECTIVES[campaign.currentNarrativeObjective]?.descriptionPt}
                  </p>
                </div>

                <div className="grid gap-3">
                  <div className="border rounded-lg p-3 bg-green-500/10 border-green-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-semibold text-green-500">SUCESSO</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {NARRATIVE_OBJECTIVES[campaign.currentNarrativeObjective]?.successBenefitPt}
                    </p>
                  </div>

                  <div className="border rounded-lg p-3 bg-red-500/10 border-red-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span className="text-sm font-semibold text-red-500">FALHA</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {NARRATIVE_OBJECTIVES[campaign.currentNarrativeObjective]?.failureConsequencePt}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>

        <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Importar Lista de Exército</DialogTitle>
              <DialogDescription>
                Faça upload do arquivo .txt exportado do aplicativo oficial do Warhammer 40k
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4 overflow-y-auto flex-1">
              <div className="grid gap-2">
                <Label htmlFor="file">Arquivo .txt</Label>
                <Input id="file" type="file" accept=".txt" onChange={handleFileUpload} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="content">Conteúdo (ou cole aqui)</Label>
                <Textarea id="content" placeholder="Cole o conteúdo da lista de exército aqui..." value={armyListContent} onChange={(e) => setArmyListContent(e.target.value)} rows={15} className="font-mono text-xs min-h-[300px]" />
              </div>
            </div>

            <DialogFooter className="flex-shrink-0">
              <Button onClick={() => {
                if (selectedPlayerId) {
                  importArmy.mutate({ playerId: selectedPlayerId, armyListContent });
                }
              }} disabled={!armyListContent || !selectedPlayerId || importArmy.isPending}>
                {importArmy.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Importar Exército
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
