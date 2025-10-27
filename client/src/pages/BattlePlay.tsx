import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "wouter";

export default function BattlePlay() {
  const { battleId } = useParams<{ battleId: string }>();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/campaigns">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>

        <h1 className="text-4xl font-bold mb-8">Batalha em Andamento</h1>

        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">
              Esta página está em desenvolvimento. Aqui você poderá:
            </p>
            <ul className="list-disc list-inside mt-4 space-y-2 text-muted-foreground">
              <li>Ver o estado atual da batalha turno-a-turno</li>
              <li>Executar spawn rolls da Horda</li>
              <li>Receber orientações da IA para movimento, tiro e carga</li>
              <li>Registrar resultados e finalizar a batalha</li>
              <li>Ver resultados pós-batalha (XP, ranks, Out of Action)</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

