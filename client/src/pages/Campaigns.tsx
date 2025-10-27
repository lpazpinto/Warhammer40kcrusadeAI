import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Loader2, Plus, Sword, Users } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

export default function Campaigns() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    hordeFaction: "",
    gameMode: "5_rounds" as "5_rounds" | "infinite",
    pointsLimit: 1000,
  });

  const { data: campaigns, isLoading, refetch } = trpc.campaign.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: factions } = trpc.horde.factions.useQuery();

  const createCampaign = trpc.campaign.create.useMutation({
    onSuccess: async (data) => {
      console.log('[createCampaign] Success response:', data);
      
      // Validate that we received a valid ID
      if (!data || !data.id || isNaN(data.id) || data.id <= 0) {
        console.error('[createCampaign] Invalid ID received:', data);
        toast.error('Erro: ID inválido retornado ao criar campanha');
        return;
      }
      
      toast.success("Campanha criada com sucesso!");
      setDialogOpen(false);
      
      // Wait for refetch to complete before redirecting
      await refetch();
      
      // Use setTimeout to ensure React has time to update
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Campanhas de Cruzada</h1>
            <p className="text-muted-foreground">
              Gerencie suas campanhas cooperativas contra a Horda
            </p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg">
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
                  <Label htmlFor="gameMode">Modo de Jogo</Label>
                  <Select
                    value={newCampaign.gameMode}
                    onValueChange={(value: "5_rounds" | "infinite") => 
                      setNewCampaign({ ...newCampaign, gameMode: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5_rounds">5 Rodadas</SelectItem>
                      <SelectItem value="infinite">Infinito</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="points">Limite de Pontos</Label>
                  <Select
                    value={newCampaign.pointsLimit.toString()}
                    onValueChange={(value) => 
                      setNewCampaign({ ...newCampaign, pointsLimit: parseInt(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1000">1000 pontos (2 zonas de spawn)</SelectItem>
                      <SelectItem value="2000">2000 pontos (4 zonas de spawn)</SelectItem>
                    </SelectContent>
                  </Select>
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

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : campaigns && campaigns.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {campaigns.map((campaign) => (
              <Link key={campaign.id} href={`/campaign/${campaign.id}`}>
                <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl">{campaign.name}</CardTitle>
                        <CardDescription className="mt-1">
                          vs {campaign.hordeFaction}
                        </CardDescription>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-medium ${
                        campaign.status === 'ongoing' ? 'bg-green-500/20 text-green-500' :
                        campaign.status === 'paused' ? 'bg-yellow-500/20 text-yellow-500' :
                        'bg-gray-500/20 text-gray-500'
                      }`}>
                        {campaign.status === 'ongoing' ? 'Em Andamento' :
                         campaign.status === 'paused' ? 'Pausada' : 'Concluída'}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Sword className="h-4 w-4 text-muted-foreground" />
                        <span>{campaign.pointsLimit} pontos</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {campaign.gameMode === '5_rounds' ? '5 Rodadas' : 'Modo Infinito'}
                        </span>
                      </div>
                      <div className="text-muted-foreground">
                        Rodada atual: {campaign.currentBattleRound}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
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
      </div>
    </div>
  );
}

