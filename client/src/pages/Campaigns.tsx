import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

  const { data: campaigns, isLoading, refetch } = trpc.campaign.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: factions } = trpc.horde.factions.useQuery();

  const createCampaign = trpc.campaign.create.useMutation({
    onSuccess: async (data) => {
      console.log('[createCampaign] Success response:', data);

      if (!data || !data.id || isNaN(data.id) || data.id <= 0) {
        console.error('[createCampaign] Invalid ID received:', data);
        toast.error('Erro: ID inválido retornado ao criar campanha');
        return;
      }

      toast.success("Campanha criada com sucesso!");
      setDialogOpen(false);

      await refetch();

      setTimeout(() => {
        setLocation(`/campaign/${data.id}`);
      }, 100);
    },
    onError: (error) => {
      console.error('[createCampaign] Error:', error);
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
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Warhammer 40k Crusade AI Manager</CardTitle>
            <CardDescription>
              Faça login para gerenciar suas campanhas de Cruzada
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <a href={getLoginUrl()}>Fazer Login</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const ongoingCampaigns = campaigns?.filter(c => c.status === "ongoing").length ?? 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 space-y-6">
        <section className="command-surface p-6 md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <p className="command-title text-xs text-muted-foreground">Command Center</p>
              <h1 className="text-3xl md:text-5xl font-bold">Campanhas de Cruzada</h1>
              <p className="max-w-3xl text-muted-foreground">
                Coordene forças imperiais, acompanhe as frentes narrativas e responda às movimentações da Horda.
              </p>
            </div>

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
                      onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="faction">Facção da Horda</Label>
                    <Select
                      value={newCampaign.hordeFaction}
                      onValueChange={(value) => setNewCampaign({ ...newCampaign, hordeFaction: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a facção inimiga" />
                      </SelectTrigger>
                      <SelectContent>
                        {factions?.map((faction) => (
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
                      onChange={(e) => setNewCampaign({ ...newCampaign, battlesPerPhase: parseInt(e.target.value) || 3 })}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="strategicPoints">Pontos Estratégicos para Vitória</Label>
                    <Input
                      id="strategicPoints"
                      type="number"
                      min="1"
                      max="50"
                      value={newCampaign.strategicPointsForVictory}
                      onChange={(e) => setNewCampaign({ ...newCampaign, strategicPointsForVictory: parseInt(e.target.value) || 10 })}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    onClick={() => createCampaign.mutate(newCampaign)}
                    disabled={!newCampaign.name || !newCampaign.hordeFaction || createCampaign.isPending}
                  >
                    {createCampaign.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Criar Campanha
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-border/60 bg-background/40 p-4">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                <ScrollText className="h-3.5 w-3.5" /> Campanhas Registradas
              </div>
              <p className="mt-2 text-3xl font-bold">{campaigns?.length ?? 0}</p>
            </div>
            <div className="rounded-lg border border-border/60 bg-background/40 p-4">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                <Radar className="h-3.5 w-3.5" /> Em Andamento
              </div>
              <p className="mt-2 text-3xl font-bold">{ongoingCampaigns}</p>
            </div>
            <div className="rounded-lg border border-border/60 bg-background/40 p-4">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                <Sword className="h-3.5 w-3.5" /> Fases por Campanha
              </div>
              <p className="mt-2 text-3xl font-bold">4</p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="command-title text-lg">Teatros de Operação</h2>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : campaigns && campaigns.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {campaigns.map((campaign) => (
                <Link key={campaign.id} href={`/campaign/${campaign.id}`}>
                  <Card className="command-surface h-full border-border/70 transition-transform duration-200 hover:-translate-y-1 cursor-pointer">
                    <CardHeader className="space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <CardTitle className="text-xl leading-tight">{campaign.name}</CardTitle>
                        <div className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                          campaign.status === 'ongoing' ? 'bg-green-500/20 text-green-500' :
                          campaign.status === 'paused' ? 'bg-yellow-500/20 text-yellow-500' :
                          'bg-gray-500/20 text-gray-500'
                        }`}>
                          {campaign.status === 'ongoing' ? 'Em Andamento' :
                           campaign.status === 'paused' ? 'Pausada' : 'Concluída'}
                        </div>
                      </div>
                      <CardDescription className="text-sm">Frente hostil: {campaign.hordeFaction}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="rounded-md border border-border/50 bg-background/40 px-3 py-2">
                          <p className="text-xs text-muted-foreground">Batalhas/Fase</p>
                          <p className="font-semibold">{campaign.battlesPerPhase}</p>
                        </div>
                        <div className="rounded-md border border-border/50 bg-background/40 px-3 py-2">
                          <p className="text-xs text-muted-foreground">Fase Atual</p>
                          <p className="font-semibold">{campaign.currentPhase} / 4</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        Clique para abrir o dossiê completo da campanha
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="command-surface">
              <CardContent className="flex flex-col items-center justify-center py-14">
                <Sword className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma campanha criada</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Crie sua primeira campanha de Cruzada para começar
                </p>
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Campanha
                </Button>
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}
