import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "wouter";

export default function BattleSetup() {
  const { campaignId } = useParams<{ campaignId: string }>();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link href={`/campaign/${campaignId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Campanha
          </Link>
        </Button>

        <h1 className="text-4xl font-bold mb-8">Configuração de Batalha</h1>

        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">
              Esta página está em desenvolvimento. Aqui você poderá:
            </p>
            <ul className="list-disc list-inside mt-4 space-y-2 text-muted-foreground">
              <li>Selecionar jogadores participantes</li>
              <li>Escolher deployment e missão</li>
              <li>Configurar objetivos e zonas de spawn</li>
              <li>Iniciar a batalha com IA da Horda</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

