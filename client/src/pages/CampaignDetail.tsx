import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, Loader2, Plus, Sword, Upload, Users } from "lucide-react";
import { useState } from "react";
import { Link, useParams, useLocation } from "wouter";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

export default function CampaignDetail() {
  const { id } = useParams<{ id: string }>();
  const campaignId = parseInt(id || '0');
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  
  const [playerDialogOpen, setPlayerDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<{ id: number; name: string | null; email: string | null } | null>(null);
  
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

  const toggleReady = trpc.player.toggleReady.useMutation({
    onSuccess: (data) => {
      toast.success(data.isReady ? "Você está pronto para batalha!" : "Status de prontidão removido");
      refetchPlayers();
    },
    onError: (error) => {
      toast.error(`Erro ao alterar status: ${error.message}`);
    },
  });

  // Search users for invites
  const { data: searchResults } = trpc.user.search.useQuery(
    { query: userSearchQuery },
    { enabled: userSearchQuery.length >= 2 }
  );

  const sendInvite = trpc.campaign.sendInvite.useMutation({
    onSuccess: () => {
      toast.success('Convite enviado com sucesso!');
      setInviteDialogOpen(false);
      setUserSearchQuery("");
      setSelectedUser(null);
    },
    onError: (error) => {
      toast.error(`Erro ao enviar convite: ${error.message}`);
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
                vs {campaign.hordeFaction} • {campaign.pointsLimit} pontos • Fase {campaign.currentPhase || 1} de 4
              </p>
              {players && players.length > 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  {players.filter(p => p.isReady).length}/{players.length} jogadores prontos
                </p>
              )}
            </div>
            
            <div className="flex flex-col items-end gap-2">
              <Button 
                size="lg" 
                asChild={players && players.length > 0 && players.every(p => p.isReady)}
                disabled={!players || players.length === 0 || !players.every(p => p.isReady)}
              >
                {players && players.length > 0 && players.every(p => p.isReady) ? (
                  <Link href={`/battle/setup/${campaign.id}`}>
                    <Sword className="mr-2 h-5 w-5" />
                    Iniciar Batalha
                  </Link>
                ) : (
                  <>
                    <Sword className="mr-2 h-5 w-5" />
                    Iniciar Batalha
                  </>
                )}
              </Button>
              {players && players.length > 0 && !players.every(p => p.isReady) && (
                <p className="text-xs text-muted-foreground">
                  Aguardando todos os jogadores ficarem prontos
                </p>
              )}
            </div>
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
                  
                  <div className="flex gap-2">
                    <Dialog open={playerDialogOpen} onOpenChange={setPlayerDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="mr-2 h-4 w-4" />
                          Adicionar Jogador
                        </Button>
                      </DialogTrigger>
                    </Dialog>
                    
                    <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          <Users className="mr-2 h-4 w-4" />
                          Convidar Jogador
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Convidar Jogador</DialogTitle>
                          <DialogDescription>
                            Busque um usuário registrado para convidar
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="userSearch">Buscar Usuário</Label>
                            <Input
                              id="userSearch"
                              placeholder="Digite nome ou email..."
                              value={userSearchQuery}
                              onChange={(e) => setUserSearchQuery(e.target.value)}
                            />
                            {userSearchQuery.length >= 2 && searchResults && searchResults.length > 0 && (
                              <div className="border rounded-md max-h-48 overflow-y-auto">
                                {searchResults.map((user) => {
                                  // Check if user is already a player in this campaign
                                  const isAlreadyPlayer = players?.some(p => p.userId === user.id);
                                  
                                  return (
                                    <button
                                      key={user.id}
                                      className={`w-full text-left px-3 py-2 hover:bg-accent transition-colors ${
                                        selectedUser?.id === user.id ? 'bg-accent' : ''
                                      } ${
                                        isAlreadyPlayer ? 'opacity-50 cursor-not-allowed' : ''
                                      }`}
                                      onClick={() => {
                                        if (!isAlreadyPlayer) {
                                          setSelectedUser(user);
                                        }
                                      }}
                                      disabled={isAlreadyPlayer}
                                    >
                                      <div className="font-medium">{user.name || 'Sem nome'}</div>
                                      <div className="text-sm text-muted-foreground">{user.email}</div>
                                      {isAlreadyPlayer && (
                                        <div className="text-xs text-muted-foreground">Já está na campanha</div>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                            {userSearchQuery.length >= 2 && searchResults && searchResults.length === 0 && (
                              <p className="text-sm text-muted-foreground">Nenhum usuário encontrado</p>
                            )}
                            {userSearchQuery.length > 0 && userSearchQuery.length < 2 && (
                              <p className="text-sm text-muted-foreground">Digite pelo menos 2 caracteres</p>
                            )}
                          </div>
                          
                          {selectedUser && (
                            <div className="border rounded-md p-3 bg-accent/50">
                              <p className="text-sm font-medium">Usuário selecionado:</p>
                              <p className="font-semibold">{selectedUser.name}</p>
                              <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                            </div>
                          )}
                        </div>
                        
                        <DialogFooter>
                          <Button 
                            onClick={() => {
                              if (selectedUser) {
                                sendInvite.mutate({
                                  campaignId,
                                  invitedUserId: selectedUser.id,
                                });
                              }
                            }}
                            disabled={!selectedUser || sendInvite.isPending}
                          >
                            {sendInvite.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Enviar Convite
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                  
                  <Dialog open={playerDialogOpen} onOpenChange={setPlayerDialogOpen}>
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
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-lg font-semibold">{player.name}</h3>
                                {player.isReady && (
                                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                                )}
                              </div>
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
                              {/* Show Ready button only for own player */}
                              {player.userId === user?.id && (
                                <Button
                                  size="sm"
                                  variant={player.isReady ? "default" : "outline"}
                                  onClick={() => toggleReady.mutate({ playerId: player.id })}
                                  disabled={toggleReady.isPending}
                                >
                                  {toggleReady.isPending ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  ) : player.isReady ? (
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                  ) : null}
                                  {player.isReady ? "Pronto" : "Marcar Pronto"}
                                </Button>
                              )}
                              
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
                              
                              <Button size="sm" asChild>
                                <Link href={`/player/${player.id}`}>Ver Detalhes</Link>
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
                  <div className="text-sm text-muted-foreground">Fase Atual</div>
                  <div className="font-semibold">Fase {campaign.currentPhase || 1} de 4</div>
                </div>
                
                <div>
                  <div className="text-sm text-muted-foreground">Pontos Estratégicos</div>
                  <div className="font-semibold">
                    {(() => {
                      const phase = campaign.currentPhase || 1;
                      const points = [
                        campaign.phase1StrategicPoints || 0,
                        campaign.phase2StrategicPoints || 0,
                        campaign.phase3StrategicPoints || 0,
                        campaign.phase4StrategicPoints || 0
                      ][phase - 1];
                      return `${points} / ${campaign.strategicPointsToWin || 10}`;
                    })()}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-muted-foreground">Batalhas por Fase</div>
                  <div className="font-semibold">{campaign.battlesPerPhase || 3}</div>
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

