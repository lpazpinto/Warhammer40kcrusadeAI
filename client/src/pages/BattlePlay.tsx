import { CommandHero, DossierPanel } from "@/components/CommandPanels";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Swords } from "lucide-react";
import { Link, useParams } from "wouter";

export default function BattlePlay() {
  const { battleId } = useParams<{ battleId: string }>();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 space-y-6">
        <div className="flex items-center gap-2 text-xs command-title text-muted-foreground">
          <Link href="/campaigns" className="hover:text-foreground transition-colors">
            Campanhas
          </Link>
          <span>/</span>
          <span>Batalha em Andamento</span>
        </div>

        <CommandHero
          eyebrow="Operação de Campo"
          title="Batalha em Andamento"
          description={`Batalha #${battleId} — interface de combate em desenvolvimento`}
          actions={
            <Button variant="outline" asChild>
              <Link href="/campaigns">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para Campanhas
              </Link>
            </Button>
          }
        />

        <DossierPanel
          title="Interface de Batalha"
          subtitle="Funcionalidades planejadas para esta tela"
          icon={<Swords className="h-5 w-5" />}
        >
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Esta interface está em desenvolvimento. Em breve você poderá:
            </p>
            <ul className="space-y-2">
              {[
                "Ver o estado atual da batalha turno-a-turno",
                "Executar spawn rolls da Horda",
                "Receber orientações da IA para movimento, tiro e carga",
                "Registrar resultados e finalizar a batalha",
                "Ver resultados pós-batalha (XP, ranks, Out of Action)",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <span className="mt-0.5 h-4 w-4 shrink-0 rounded-sm border border-border/60 bg-background/50 flex items-center justify-center text-[12px] text-primary">
                    ▸
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </DossierPanel>
      </div>
    </div>
  );
}

