import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import {
  CommandHero,
  DossierPanel,
  StatusSeal,
} from "@/components/CommandPanels";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Loader2, Plus, Radar, ScrollText, Sword, Users } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

export default function Campaigns() {
  const { loading: authLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [dialogOpen, setDialogOpen] = useState(false);

  const [newCampaign, setNewCampaign] = useState({
    name: "",
    hordeFaction: "",
    battlesPerPhase: 3,
    strategicPointsForVictory: 10,
  });

  const {
    data: campaigns,
    isLoading,
    refetch,
  } = trpc.campaign.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: factions } = trpc.horde.factions.useQuery();

  const createCampaign = trpc.campaign.create.useMutation({
    onSuccess: async data => {
      console.log("[createCampaign] Success response:", data);

      if (!data || !data.id || isNaN(data.id) || data.id <= 0) {
        console.error("[createCampaign] Invalid ID received:", data);
        toast.error("Erro: ID inválido retornado ao criar campanha");
        return;
      }

      toast.success("Campanha criada com sucesso!");
      setDialogOpen(false);

      await refetch();

      setTimeout(() => {
        setLocation(`/campaign/${data.id}`);
      }, 100);
    },
    onError: error => {
      console.error("[createCampaign] Error:", error);
      toast.error(`Erro ao criar campanha: ${error.message}`);
    },
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <DossierPanel
          title="Acesso ao Centro de Comando"
          subtitle="Autentique-se para consultar os dossiês ativos"
          className="max-w-md w-full"
        >
          <Button asChild className="w-full">
            <a href={getLoginUrl()}>Fazer Login</a>
          </Button>
        </DossierPanel>
      </div>
    );
  }

  const ongoingCampaigns =
    campaigns?.filter(c => c.status === "ongoing").length ?? 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 space-y-6">
        <CommandHero
          eyebrow="Centro de Comando"
          title="Campanhas de Cruzada"
          description="Coordene forças imperiais, acompanhe as frentes narrativas e responda às movimentações da Horda."
          actions={
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="w-full lg:w-auto">
                  <Plus className="mr-2 h-5 w-5" />
                  Nova Campanha
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Criar Nova Campanha</DialogTitle>
                  <DialogDescription>
                    Configure uma nova campanha de Cruzada contra a Horda
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nome da Campanha</Label>
                    <Input
                      id="name"
                      placeholder="Ex: Defesa de Armageddon"
                      value={newCampaign.name}
                      onChange={e =>
                        setNewCampaign({ ...newCampaign, name: e.target.value })
                      }
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="faction">Facção da Horda</Label>
                    <Select
                      value={newCampaign.hordeFaction}
                      onValueChange={value =>
                        setNewCampaign({ ...newCampaign, hordeFaction: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a facção inimiga" />
                      </SelectTrigger>
                      <SelectContent>
                        {factions?.map(faction => (
                          <SelectItem key={faction} value={faction}>
                            {faction}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="battlesPerPhase">Batalhas por Fase</Label>
                    <Input
                      id="battlesPerPhase"
                      type="number"
                      min="1"
                      max="10"
                      value={newCampaign.battlesPerPhase}
                      onChange={e =>
                        setNewCampaign({
                          ...newCampaign,
                          battlesPerPhase: parseInt(e.target.value) || 3,
                        })
                      }
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="strategicPoints">
                      Pontos Estratégicos para Vitória
                    </Label>
                    <Input
                      id="strategicPoints"
                      type="number"
                      min="1"
                      max="50"
                      value={newCampaign.strategicPointsForVictory}
                      onChange={e =>
                        setNewCampaign({
                          ...newCampaign,
                          strategicPointsForVictory:
                            parseInt(e.target.value) || 10,
                        })
                      }
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    onClick={() => createCampaign.mutate(newCampaign)}
                    disabled={
                      !newCampaign.name ||
                      !newCampaign.hordeFaction ||
                      createCampaign.isPending
                    }
                  >
                    {createCampaign.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Criar Campanha
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          }
          intel={
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-border/60 bg-background/50 p-4">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                  <ScrollText className="h-3.5 w-3.5" /> Campanhas Registradas
                </div>
                <p className="mt-2 text-3xl font-bold">
                  {campaigns?.length ?? 0}
                </p>
              </div>
              <div className="rounded-lg border border-border/60 bg-background/50 p-4">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                  <Radar className="h-3.5 w-3.5" /> Em Andamento
                </div>
                <p className="mt-2 text-3xl font-bold">{ongoingCampaigns}</p>
              </div>
              <div className="rounded-lg border border-border/60 bg-background/50 p-4">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                  <Sword className="h-3.5 w-3.5" /> Fases por Campanha
                </div>
                <p className="mt-2 text-3xl font-bold">4</p>
              </div>
            </div>
          }
        />

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="command-title text-lg">Teatros de Operação</h2>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : campaigns && campaigns.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2">
              {campaigns.map(campaign => (
                <Link key={campaign.id} href={`/campaign/${campaign.id}`}>
                  <DossierPanel
                    title={campaign.name}
                    subtitle={`Frente hostil: ${campaign.hordeFaction}`}
                    icon={<Users className="h-4 w-4" />}
                    className="h-full transition-transform duration-200 hover:-translate-y-1 cursor-pointer"
                    actions={
                      <StatusSeal
                        tone={
                          campaign.status === "ongoing"
                            ? "operational"
                            : campaign.status === "paused"
                              ? "warning"
                              : "victory"
                        }
                        label={
                          campaign.status === "ongoing"
                            ? "Em Andamento"
                            : campaign.status === "paused"
                              ? "Pausada"
                              : "Concluída"
                        }
                      />
                    }
                  >
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-md border border-border/50 bg-background/40 px-3 py-2">
                        <p className="text-xs text-muted-foreground">
                          Batalhas/Fase
                        </p>
                        <p className="font-semibold">
                          {campaign.battlesPerPhase}
                        </p>
                      </div>
                      <div className="rounded-md border border-border/50 bg-background/40 px-3 py-2">
                        <p className="text-xs text-muted-foreground">
                          Fase Atual
                        </p>
                        <p className="font-semibold">
                          {campaign.currentPhase} / 4
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      Abrir dossiê completo da campanha
                    </div>
                  </DossierPanel>
                </Link>
              ))}
            </div>
          ) : (
            <DossierPanel
              title="Nenhuma campanha criada"
              subtitle="Abra uma nova frente de guerra para iniciar o registro de operações"
              icon={<Sword className="h-4 w-4" />}
            >
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <picture>
                  <source
                    srcSet="/assets/ui-theme/icons/empty-state-emblem.webp"
                    type="image/webp"
                  />
                  <img
                    src="/assets/ui-theme/icons/empty-state-emblem.png"
                    alt=""
                    aria-hidden="true"
                    className="w-20 h-20 opacity-30 mb-4 object-contain"
                  />
                </picture>
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Campanha
                </Button>
              </div>
            </DossierPanel>
          )}
        </section>
      </div>
    </div>
  );
}
