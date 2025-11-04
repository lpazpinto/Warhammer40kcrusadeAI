import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Loader2, Plus, Sword, Upload, Users, CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";
import { Link, useParams, useLocation } from "wouter";
import { toast } from "sonner";
import { NARRATIVE_OBJECTIVES } from "@shared/narrativeObjectives";

export default function CampaignDetail() {
  const { id } = useParams<{ id: string }>();
  const campaignId = parseInt(id || '0');
  const [, setLocation] = useLocation();
  
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
      
      // Validate that we received a valid ID
      if (!data || !data.id || isNaN(data.id) || data.id <= 0) {
        console.error('[createPlayer] Invalid ID received:', data);
        toast.error('Erro: ID inválido retornado ao criar jogador');
        return;
      }
      
      toast.success("Lord Commander criado com sucesso!");
      setPlayerDialogOpen(false);
      setNewPlayer({ name: "", faction: "", detachment: "", crusadeForceName: "" });
      
      // Wait for refetch to complete
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
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Link href="/campaigns" className="hover:text-foreground">Campanhas</Link>
            <span>/</span>
            <span>{campaign.name}</span>
          </div>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">{campaign.name}</h1>
              <p className="text-muted-foreground">
                vs {campaign.hordeFaction} • Fase {campaign.currentPhase}/{4}
              </p>
            </div>
            
            <Button size="lg" asChild>
              <Link href={`/battle/setup/${campaign.id}`}>
                <Sword className="mr-2 h-5 w-5" />
                Iniciar Batalha
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Lord Commanders</CardTitle>
                    <CardDescription>Jogadores participando desta campanha</CardDescription>
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
                          <Input
                            id="playerName"
                            placeholder="Ex: Lord Commander Dreir"
                            value={newPlayer.name}
                            onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
                          />
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor="faction">Facção</Label>
                          <Input
                            id="faction"
                            placeholder="Ex: Astra Militarum"
                            value={newPlayer.faction}
                            onChange={(e) => setNewPlayer({ ...newPlayer, faction: e.target.value })}
                          />
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor="detachment">Destacamento (opcional)</Label>
                          <Input
                            id="detachment"
                            placeholder="Ex: Combined Arms"
                            value={newPlayer.detachment}
                            onChange={(e) => setNewPlayer({ ...newPlayer, detachment: e.target.value })}
                          />
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor="forceName">Nome da Força de Cruzada (opcional)</Label>
                          <Input
                            id="forceName"
                            placeholder="Ex: 13th Death Korps Regiment"
                            value={newPlayer.crusadeForceName}
                            onChange={(e) => setNewPlayer({ ...newPlayer, crusadeForceName: e.target.value })}
                          />
                        </div>
                      </div>
                      
                      <DialogFooter>
                        <Button
                          onClick={() => createPlayer.mutate({ campaignId, ...newPlayer })}
                          disabled={!newPlayer.name || !newPlayer.faction || createPlayer.isPending}
                        >
                          {createPlayer.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Criar Jogador
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {playersLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : players && players.length > 0 ? (
                  <div className="space-y-4">
                    {players.map((player) => (
                      <Card key={player.id} className="hover:border-primary transition-colors">
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold mb-1">{player.name}</h3>
                              <p className="text-sm text-muted-foreground mb-3">
                                {player.faction} {player.detachment && `• ${player.detachment}`}
                              </p>
                              
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <div className="text-muted-foreground">RP</div>
                                  <div className="font-semibold">{player.requisitionPoints}</div>
                                </div>
                                <div>
                                  <div className="text-muted-foreground">Batalhas</div>
                                  <div className="font-semibold">{player.battleTally}</div>
                                </div>
                                <div>
                                  <div className="text-muted-foreground">Vitórias</div>
                                  <div className="font-semibold">{player.victories}</div>
                                </div>
                                <div>
                                  <div className="text-muted-foreground">SP</div>
                                  <div className="font-semibold">{player.supplyPoints}</div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  // Validate player ID before setting
                                  if (player.id && !isNaN(player.id) && player.id > 0) {
                                    setSelectedPlayerId(player.id);
                                    setImportDialogOpen(true);
                                  } else {
                                    console.error('Invalid player ID:', player.id);
                                    toast.error('ID do jogador inválido');
                                  }
                                }}
                              >
                                <Upload className="mr-2 h-4 w-4" />
                                Importar Exército
                              </Button>
                              
                              <Button 
                                size="sm" 
                                asChild={!!(player.id && !isNaN(player.id) && player.id > 0)}
                                disabled={!player.id || isNaN(player.id) || player.id <= 0}
                              >
                                {player.id && !isNaN(player.id) && player.id > 0 ? (
                                  <Link href={`/player/${player.id}`}>Ver Detalhes</Link>
                                ) : (
                                  <span>Ver Detalhes</span>
                                )}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum jogador adicionado ainda</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Informações da Campanha</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground">Status</div>
                  <div className="font-semibold">
                    {campaign.status === 'ongoing' ? 'Em Andamento' :
                     campaign.status === 'paused' ? 'Pausada' : 'Concluída'}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-muted-foreground">Facção da Horda</div>
                  <div className="font-semibold">{campaign.hordeFaction}</div>
                </div>
                
                <div>
                  <div className="text-sm text-muted-foreground">Batalhas por Fase</div>
                  <div className="font-semibold">{campaign.battlesPerPhase}</div>
                </div>
                
                <div>
                  <div className="text-sm text-muted-foreground">Pontos Estratégicos para Vitória</div>
                  <div className="font-semibold">{campaign.strategicPointsForVictory}</div>
                </div>
                
                <div>
                  <div className="text-sm text-muted-foreground">Fase Atual</div>
                  <div className="font-semibold">{campaign.currentPhase}</div>
                </div>
              </CardContent>
            </Card>
            
            {/* Narrative Objective Card */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>Objetivo Narrativo - Fase {campaign.currentPhase}</span>
                </CardTitle>
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
                
                <div className="grid gap-4 md:grid-cols-2">
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
          </div>
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
                <Input
                  id="file"
                  type="file"
                  accept=".txt"
                  onChange={handleFileUpload}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="content">Conteúdo (ou cole aqui)</Label>
                <Textarea
                  id="content"
                  placeholder="Cole o conteúdo da lista de exército aqui..."
                  value={armyListContent}
                  onChange={(e) => setArmyListContent(e.target.value)}
                  rows={15}
                  className="font-mono text-xs min-h-[300px]"
                />
              </div>
            </div>
            
            <DialogFooter className="flex-shrink-0">
              <Button
                onClick={() => {
                  if (selectedPlayerId) {
                    importArmy.mutate({
                      playerId: selectedPlayerId,
                      armyListContent,
                    });
                  }
                }}
                disabled={!armyListContent || !selectedPlayerId || importArmy.isPending}
              >
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

