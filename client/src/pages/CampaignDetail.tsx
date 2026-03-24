import { useAuth } from "@/_core/hooks/useAuth";
import { DossierPanel, StatusSeal } from "@/components/CommandPanels";
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
        {/* ── Hero / Dossier Header ─────────────────────────────────── */}
        <header className="campaign-command-header">
          {/* Dossier header strip overlay */}
          <div className="campaign-command-header__strip" aria-hidden="true">
            <picture className="campaign-command-header__strip-picture">
              <source
                srcSet="/assets/ui-theme/overlays/dossier-header-strip.webp"
                type="image/webp"
              />
              <img
                src="/assets/ui-theme/overlays/dossier-header-strip.png"
                alt=""
                aria-hidden="true"
                className="campaign-command-header__strip-image"
              />
            </picture>
          </div>

          {/* Command sigil watermark */}
          <div className="campaign-command-header__sigil" aria-hidden="true">
            <picture className="campaign-command-header__sigil-picture">
              <source
                srcSet="/assets/ui-theme/overlays/command-sigil-watermark.webp"
                type="image/webp"
              />
              <img
                src="/assets/ui-theme/overlays/command-sigil-watermark.png"
                alt=""
                aria-hidden="true"
                className="campaign-command-header__sigil-image"
              />
            </picture>
          </div>

          <div className="campaign-command-header__content">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs command-title text-muted-foreground">
              <Link
                href="/campaigns"
                className="hover:text-foreground transition-colors"
              >
                Campanhas
              </Link>
              <span>/</span>
              <span>{campaign.name}</span>
            </div>

            {/* Title block */}
            <div className="campaign-command-header__heading">
              <p className="command-title text-xs text-muted-foreground">
                Dossiê da Campanha
              </p>
              <h1 className="campaign-command-header__title">{campaign.name}</h1>
              <p className="campaign-command-header__description">
                Frente ativa contra{" "}
                <strong className="text-foreground/80">
                  {campaign.hordeFaction}
                </strong>
                . Conduza a campanha fase a fase e preserve os recursos da força.
              </p>
            </div>

            {/* Primary actions */}
            <div className="campaign-command-header__actions">
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
            </div>

            {/* Summary intel grid */}
            <div className="campaign-command-header__intel grid gap-3 sm:grid-cols-4">
              <div className="campaign-intel-box">
                <div className="campaign-intel-box__label">Status</div>
                <div className="mt-3">
                  <StatusSeal
                    tone={statusTone}
                    label={statusLabel}
                    className="status-seal--stamped"
                  />
                </div>
              </div>
              <div className="campaign-intel-box">
                <div className="campaign-intel-box__label">Fase Atual</div>
                <p className="campaign-intel-box__value">
                  {campaign.currentPhase}
                  <span className="text-base font-normal text-muted-foreground">
                    {" "}
                    / 4
                  </span>
                </p>
              </div>
              <div className="campaign-intel-box">
                <div className="campaign-intel-box__label">Facção da Horda</div>
                <p className="campaign-intel-box__value--sm">
                  {campaign.hordeFaction}
                </p>
              </div>
              <div className="campaign-intel-box">
                <div className="campaign-intel-box__label">
                  Pontos de Vitória
                </div>
                <p className="campaign-intel-box__value">
                  {campaign.strategicPointsForVictory}
                  <span className="text-base font-normal text-muted-foreground">
                    {" "}
                    SP
                  </span>
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* ── Main content grid ──────────────────────────────────────── */}
        <div className="grid gap-6 xl:grid-cols-[1.45fr_1fr]">
          <DossierPanel
            title="Lord Commanders"
            subtitle="Registros de força desta campanha"
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
                  <div key={player.id} className="commander-card">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="commander-card__name">{player.name}</h3>
                        <p className="commander-card__faction">
                          {player.faction}
                          {player.detachment && ` · ${player.detachment}`}
                        </p>
                        {player.crusadeForceName && (
                          <p className="text-xs text-muted-foreground mt-1 italic">
                            &quot;{player.crusadeForceName}&quot;
                          </p>
                        )}

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
                          <div className="commander-card__stat">
                            <div className="commander-card__stat-label">RP</div>
                            <div className="commander-card__stat-value">
                              {player.requisitionPoints}
                            </div>
                          </div>
                          <div className="commander-card__stat">
                            <div className="commander-card__stat-label">
                              Batalhas
                            </div>
                            <div className="commander-card__stat-value">
                              {player.battleTally}
                            </div>
                          </div>
                          <div className="commander-card__stat">
                            <div className="commander-card__stat-label">
                              Vitórias
                            </div>
                            <div className="commander-card__stat-value">
                              {player.victories}
                            </div>
                          </div>
                          <div className="commander-card__stat">
                            <div className="commander-card__stat-label">SP</div>
                            <div className="commander-card__stat-value">
                              {player.supplyPoints}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
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
                <Users className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p className="text-sm">Nenhum jogador adicionado ainda</p>
                <p className="text-xs mt-1 opacity-60">
                  Reforce sua força de cruzada
                </p>
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
                <div className="rounded-md border border-border/50 border-l-2 border-l-primary/45 bg-background/60 px-3 py-2.5">
                  <div className="text-xs text-muted-foreground command-title">
                    Facção da Horda
                  </div>
                  <div className="font-semibold mt-0.5">
                    {campaign.hordeFaction}
                  </div>
                </div>
                <div className="rounded-md border border-border/50 border-l-2 border-l-primary/45 bg-background/60 px-3 py-2.5">
                  <div className="text-xs text-muted-foreground command-title">
                    Pontos para Vitória
                  </div>
                  <div className="font-semibold mt-0.5">
                    {campaign.strategicPointsForVictory} SP
                  </div>
                </div>
              </div>
            </DossierPanel>

            <DossierPanel
              title={`Objetivo Narrativo — Fase ${campaign.currentPhase}`}
              subtitle={
                NARRATIVE_OBJECTIVES[campaign.currentNarrativeObjective]
                  ?.titlePt || campaign.currentNarrativeObjective
              }
              icon={<Shield className="h-5 w-5" />}
            >
              <div className="space-y-4">
                <div>
                  <div className="text-xs command-title text-muted-foreground mb-1">
                    Descrição
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {
                      NARRATIVE_OBJECTIVES[campaign.currentNarrativeObjective]
                        ?.descriptionPt
                    }
                  </p>
                </div>

                <div className="grid gap-3">
                  <div className="objective-outcome objective-outcome--success">
                    <div className="objective-outcome__header">
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                      <span className="objective-outcome__label text-green-500/90">
                        Resultado: Sucesso
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {
                        NARRATIVE_OBJECTIVES[campaign.currentNarrativeObjective]
                          ?.successBenefitPt
                      }
                    </p>
                  </div>

                  <div className="objective-outcome objective-outcome--failure">
                    <div className="objective-outcome__header">
                      <XCircle className="h-3.5 w-3.5 text-red-500" />
                      <span className="objective-outcome__label text-red-500/90">
                        Resultado: Falha
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
