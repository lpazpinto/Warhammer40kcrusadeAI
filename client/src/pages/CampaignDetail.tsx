import { useAuth } from "@/_core/hooks/useAuth";
import {
  CommandHero,
  DossierPanel,
  StatusSeal,
} from "@/components/CommandPanels";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { NARRATIVE_OBJECTIVES } from "@shared/narrativeObjectives";
import {
  CheckCircle2,
  Loader2,
  Plus,
  ScrollText,
  Shield,
  Sword,
  Upload,
  Users,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Link, useLocation, useParams } from "wouter";

export default function CampaignDetail() {
  const { id } = useParams<{ id: string }>();
  const campaignId = parseInt(id || "0");
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

  const { data: campaign, isLoading: campaignLoading } =
    trpc.campaign.get.useQuery(
      { id: campaignId },
      { enabled: !isNaN(campaignId) && campaignId > 0 }
    );

  const {
    data: players,
    isLoading: playersLoading,
    refetch: refetchPlayers,
  } = trpc.player.list.useQuery(
    { campaignId },
    { enabled: !isNaN(campaignId) && campaignId > 0 }
  );

  const createPlayer = trpc.player.create.useMutation({
    onSuccess: async data => {
      if (!data || !data.id || isNaN(data.id) || data.id <= 0) {
        toast.error("Erro: ID inválido retornado ao criar jogador");
        return;
      }

      toast.success("Lord Commander criado com sucesso!");
      setPlayerDialogOpen(false);
      setNewPlayer({
        name: "",
        faction: "",
        detachment: "",
        crusadeForceName: "",
      });
      await refetchPlayers();
    },
    onError: error => {
      toast.error(`Erro ao criar jogador: ${error.message}`);
    },
  });

  const importArmy = trpc.player.importArmy.useMutation({
    onSuccess: data => {
      toast.success(
        `Exército importado! ${data.unitsCreated} unidades criadas.`
      );
      setImportDialogOpen(false);
      setArmyListContent("");
      refetchPlayers();
    },
    onError: error => {
      toast.error(`Erro ao importar exército: ${error.message}`);
    },
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      setArmyListContent(content);
    };
    reader.readAsText(file);
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
        <DossierPanel
          title="Campanha não encontrada"
          subtitle="Retorne para a lista de campanhas para reabrir o dossiê correto."
        >
          <Button asChild>
            <Link href="/campaigns">Voltar</Link>
          </Button>
        </DossierPanel>
      </div>
    );
  }

  const statusTone =
    campaign.status === "ongoing"
      ? "operational"
      : campaign.status === "paused"
        ? "warning"
        : "victory";
  const statusLabel =
    campaign.status === "ongoing"
      ? "Em Andamento"
      : campaign.status === "paused"
        ? "Pausada"
        : "Concluída";

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 space-y-6">
        <div className="flex items-center gap-2 text-xs command-title text-muted-foreground">
          <Link href="/campaigns" className="hover:text-foreground">
            Campanhas
          </Link>
          <span>/</span>
          <span>{campaign.name}</span>
        </div>

        <CommandHero
          eyebrow="Dossiê da Campanha"
          title={campaign.name}
          description={`Frente ativa contra ${campaign.hordeFaction}. Conduza a campanha fase a fase e preserve os recursos da força.`}
          actions={
            <div className="flex w-full xl:w-auto flex-col sm:flex-row gap-3">
              <Button size="lg" asChild className="w-full sm:w-auto">
                <Link href={`/battle/setup/${campaign.id}`}>
                  <Sword className="mr-2 h-5 w-5" />
                  Iniciar Batalha
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setPlayerDialogOpen(true)}
                className="w-full sm:w-auto"
              >
                <Plus className="mr-2 h-5 w-5" />
                Reforçar Comandantes
              </Button>
            </div>
          }
          intel={
            <div className="grid gap-3 sm:grid-cols-4">
              <div className="rounded-lg border border-border/60 bg-background/50 p-4">
                <p className="text-xs command-title text-muted-foreground">
                  Status
                </p>
                <div className="mt-2">
                  <StatusSeal tone={statusTone} label={statusLabel} />
                </div>
              </div>
              <div className="rounded-lg border border-border/60 bg-background/50 p-4">
                <p className="text-xs command-title text-muted-foreground">
                  Fase Atual
                </p>
                <p className="mt-2 text-2xl font-bold">
                  {campaign.currentPhase} / 4
                </p>
              </div>
              <div className="rounded-lg border border-border/60 bg-background/50 p-4">
                <p className="text-xs command-title text-muted-foreground">
                  Horda
                </p>
                <p className="mt-2 font-semibold">{campaign.hordeFaction}</p>
              </div>
              <div className="rounded-lg border border-border/60 bg-background/50 p-4">
                <p className="text-xs command-title text-muted-foreground">
                  Vitória
                </p>
                <p className="mt-2 text-2xl font-bold">
                  {campaign.strategicPointsForVictory} SP
                </p>
              </div>
            </div>
          }
        />

        <div className="grid gap-6 xl:grid-cols-[1.45fr_1fr]">
          <DossierPanel
            title="Lord Commanders"
            subtitle="Forças ativas nesta frente de guerra"
            icon={<Users className="h-5 w-5" />}
            actions={
              <Dialog
                open={playerDialogOpen}
                onOpenChange={setPlayerDialogOpen}
              >
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
                        onChange={e =>
                          setNewPlayer({ ...newPlayer, name: e.target.value })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="faction">Facção</Label>
                      <Input
                        id="faction"
                        placeholder="Ex: Astra Militarum"
                        value={newPlayer.faction}
                        onChange={e =>
                          setNewPlayer({
                            ...newPlayer,
                            faction: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="detachment">
                        Destacamento (opcional)
                      </Label>
                      <Input
                        id="detachment"
                        placeholder="Ex: Combined Arms"
                        value={newPlayer.detachment}
                        onChange={e =>
                          setNewPlayer({
                            ...newPlayer,
                            detachment: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="forceName">
                        Nome da Força de Cruzada (opcional)
                      </Label>
                      <Input
                        id="forceName"
                        placeholder="Ex: 13th Death Korps Regiment"
                        value={newPlayer.crusadeForceName}
                        onChange={e =>
                          setNewPlayer({
                            ...newPlayer,
                            crusadeForceName: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      onClick={() =>
                        createPlayer.mutate({
                          campaignId,
                          userId: user?.id || 0,
                          ...newPlayer,
                        })
                      }
                      disabled={
                        !newPlayer.name ||
                        !newPlayer.faction ||
                        createPlayer.isPending
                      }
                    >
                      {createPlayer.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Criar Jogador
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            }
          >
            {playersLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : players && players.length > 0 ? (
              <div className="space-y-4">
                {players.map(player => (
                  <div
                    key={player.id}
                    className="rounded-lg border border-border/70 bg-background/35 p-4"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-1">
                          {player.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          {player.faction}{" "}
                          {player.detachment && `• ${player.detachment}`}
                        </p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                          <div className="rounded-md border border-border/50 px-2 py-1.5">
                            <div className="text-muted-foreground text-xs">
                              RP
                            </div>
                            <div className="font-semibold">
                              {player.requisitionPoints}
                            </div>
                          </div>
                          <div className="rounded-md border border-border/50 px-2 py-1.5">
                            <div className="text-muted-foreground text-xs">
                              Batalhas
                            </div>
                            <div className="font-semibold">
                              {player.battleTally}
                            </div>
                          </div>
                          <div className="rounded-md border border-border/50 px-2 py-1.5">
                            <div className="text-muted-foreground text-xs">
                              Vitórias
                            </div>
                            <div className="font-semibold">
                              {player.victories}
                            </div>
                          </div>
                          <div className="rounded-md border border-border/50 px-2 py-1.5">
                            <div className="text-muted-foreground text-xs">
                              SP
                            </div>
                            <div className="font-semibold">
                              {player.supplyPoints}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (
                              player.id &&
                              !isNaN(player.id) &&
                              player.id > 0
                            ) {
                              setSelectedPlayerId(player.id);
                              setImportDialogOpen(true);
                            } else {
                              toast.error("ID do jogador inválido");
                            }
                          }}
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          Importar Exército
                        </Button>

                        <Button
                          size="sm"
                          asChild={
                            !!(player.id && !isNaN(player.id) && player.id > 0)
                          }
                          disabled={
                            !player.id || isNaN(player.id) || player.id <= 0
                          }
                        >
                          {player.id && !isNaN(player.id) && player.id > 0 ? (
                            <Link href={`/player/${player.id}`}>
                              Ver Dossiê
                            </Link>
                          ) : (
                            <span>Ver Dossiê</span>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum jogador adicionado ainda</p>
              </div>
            )}
          </DossierPanel>

          <div className="space-y-6">
            <DossierPanel
              title="Briefing da Campanha"
              subtitle="Diretrizes estratégicas do teatro atual"
              icon={<ScrollText className="h-5 w-5" />}
            >
              <div className="space-y-3 text-sm">
                <div className="rounded-md border border-border/60 bg-background/40 p-3">
                  <div className="text-xs text-muted-foreground command-title">
                    Facção da Horda
                  </div>
                  <div className="font-semibold">{campaign.hordeFaction}</div>
                </div>
                <div className="rounded-md border border-border/60 bg-background/40 p-3">
                  <div className="text-xs text-muted-foreground command-title">
                    Pontos para Vitória
                  </div>
                  <div className="font-semibold">
                    {campaign.strategicPointsForVictory}
                  </div>
                </div>
              </div>
            </DossierPanel>

            <DossierPanel
              title={`Objetivo Narrativo - Fase ${campaign.currentPhase}`}
              subtitle={
                NARRATIVE_OBJECTIVES[campaign.currentNarrativeObjective]
                  ?.titlePt || campaign.currentNarrativeObjective
              }
              icon={<Shield className="h-5 w-5" />}
            >
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-semibold mb-1">Descrição</div>
                  <p className="text-sm text-muted-foreground">
                    {
                      NARRATIVE_OBJECTIVES[campaign.currentNarrativeObjective]
                        ?.descriptionPt
                    }
                  </p>
                </div>

                <div className="grid gap-3">
                  <div className="border rounded-lg p-3 bg-green-500/10 border-green-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-semibold text-green-500">
                        SUCESSO
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {
                        NARRATIVE_OBJECTIVES[campaign.currentNarrativeObjective]
                          ?.successBenefitPt
                      }
                    </p>
                  </div>

                  <div className="border rounded-lg p-3 bg-red-500/10 border-red-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span className="text-sm font-semibold text-red-500">
                        FALHA
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {
                        NARRATIVE_OBJECTIVES[campaign.currentNarrativeObjective]
                          ?.failureConsequencePt
                      }
                    </p>
                  </div>
                </div>
              </div>
            </DossierPanel>
          </div>
        </div>

        <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Importar Lista de Exército</DialogTitle>
              <DialogDescription>
                Faça upload do arquivo .txt exportado do aplicativo oficial do
                Warhammer 40k
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
                  onChange={e => setArmyListContent(e.target.value)}
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
                    return;
                  }
                  setLocation("/campaigns");
                }}
                disabled={
                  !armyListContent || !selectedPlayerId || importArmy.isPending
                }
              >
                {importArmy.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Importar Exército
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
