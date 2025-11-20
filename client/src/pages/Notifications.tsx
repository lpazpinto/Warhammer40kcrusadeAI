import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Loader2, Mail, Check, X, Users, Swords } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

interface Invite {
  id: number;
  campaignId: number;
  inviterId: number;
  inviteeId: number;
  status: "pending" | "accepted" | "declined";
  createdAt: Date;
  respondedAt: Date | null;
  campaignName: string | null;
  hordeFaction: string | null;
  inviterName: string | null;
  playerCount: number;
}

export default function Notifications() {
  const { data: invites, isLoading, refetch } = trpc.campaign.listInvites.useQuery();
  const respondMutation = trpc.campaign.respondToInvite.useMutation({
    onSuccess: (data) => {
      if (data.accepted) {
        toast.success("Convite aceito! Você entrou na campanha.");
      } else {
        toast.info("Convite recusado.");
      }
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const handleRespond = (inviteId: number, accept: boolean) => {
    respondMutation.mutate({ inviteId, accept });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const typedInvites = (invites || []) as Invite[];
  const pendingInvites = typedInvites.filter((inv) => inv.status === "pending");
  const respondedInvites = typedInvites.filter((inv) => inv.status !== "pending");

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Notificações</h1>
          <p className="text-muted-foreground">
            Convites para campanhas de Cruzada
          </p>
        </div>

        {pendingInvites.length === 0 && respondedInvites.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <Mail className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-xl text-muted-foreground mb-2">
                Nenhuma notificação
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                Você não tem convites pendentes no momento
              </p>
              <Button asChild>
                <Link href="/campaigns">Ver Campanhas</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {pendingInvites.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Mail className="h-6 w-6" />
                  Convites Pendentes
                  <Badge variant="default" className="ml-2">
                    {pendingInvites.length}
                  </Badge>
                </h2>
                <div className="space-y-4">
                  {pendingInvites.map((invite) => (
                    <Card key={invite.id} className="border-2 border-primary/50">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-2xl mb-2">
                              {invite.campaignName || "Campanha sem nome"}
                            </CardTitle>
                            <CardDescription className="text-base">
                              Convidado por <span className="font-semibold">{invite.inviterName || "Desconhecido"}</span>
                            </CardDescription>
                          </div>
                          <Badge variant="outline" className="bg-yellow-500/20 text-yellow-500 border-yellow-500/50">
                            Pendente
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                          <div className="flex items-center gap-2">
                            <Swords className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Facção Horda:</span>
                            <span className="font-semibold">{invite.hordeFaction || "N/A"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Jogadores:</span>
                            <span className="font-semibold">{invite.playerCount}</span>
                          </div>
                        </div>
                        
                        <div className="flex gap-3">
                          <Button
                            onClick={() => handleRespond(invite.id, true)}
                            disabled={respondMutation.isPending}
                            className="flex-1"
                          >
                            <Check className="mr-2 h-4 w-4" />
                            Aceitar Convite
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleRespond(invite.id, false)}
                            disabled={respondMutation.isPending}
                            className="flex-1"
                          >
                            <X className="mr-2 h-4 w-4" />
                            Recusar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {respondedInvites.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4 text-muted-foreground">
                  Histórico
                </h2>
                <div className="space-y-3">
                  {respondedInvites.map((invite) => (
                    <Card key={invite.id} className="opacity-60">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-bold text-lg">{invite.campaignName || "Campanha sem nome"}</h3>
                            <p className="text-sm text-muted-foreground">
                              Convidado por {invite.inviterName || "Desconhecido"}
                            </p>
                          </div>
                          <Badge
                            variant={invite.status === "accepted" ? "default" : "outline"}
                            className={
                              invite.status === "accepted"
                                ? "bg-green-500/20 text-green-500 border-green-500/50"
                                : "bg-red-500/20 text-red-500 border-red-500/50"
                            }
                          >
                            {invite.status === "accepted" ? "Aceito" : "Recusado"}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
