import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Link, useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import UnitSelection from "@/components/UnitSelection";

type BattleConfig = {
  gameSize: number;
  deployment: string;
  mission: string;
  selectedPlayers: number[];
  spawnZones: number;
  playerUnits: Record<number, number[]>; // playerId -> array of unitIds
};



const DEPLOYMENTS = [
  "Alvorecer da Guerra",
  "Martelo e Bigorna",
  "Buscar e Destruir",
  "Engajamento Amplo"
];

const MISSIONS = [
  "Tomar e Segurar",
  "Alvos Prioritários",
  "Terra Arrasada",
  "Purgar o Inimigo",
  "Suprimentos"
];

export default function BattleSetup() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState<BattleConfig>({
    gameSize: 1000,
    deployment: "",
    mission: "",
    selectedPlayers: [],
    spawnZones: 2,
    playerUnits: {}
  });

  const campaignIdNum = campaignId ? parseInt(campaignId) : NaN;
  const isValidCampaignId = Boolean(campaignId && !isNaN(campaignIdNum));
  
  const { data: campaign } = trpc.campaign.get.useQuery(
    { id: campaignIdNum },
    { enabled: isValidCampaignId }
  );
  const { data: players } = trpc.player.list.useQuery(
    { campaignId: campaignIdNum },
    { enabled: isValidCampaignId }
  );
  const createBattle = trpc.battle.create.useMutation();

  const handleNext = () => {
    if (step < 5) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handlePlayerToggle = (playerId: number) => {
    setConfig(prev => ({
      ...prev,
      selectedPlayers: prev.selectedPlayers.includes(playerId)
        ? prev.selectedPlayers.filter(id => id !== playerId)
        : [...prev.selectedPlayers, playerId]
    }));
  };

  const handleStartBattle = async () => {
    if (!campaign) return;

    try {
      const result = await createBattle.mutateAsync({
        campaignId: campaign.id,
        deployment: config.deployment,
        missionPack: config.mission,
      });

      // Navigate to battle play page
      setLocation(`/battle/${result.id}/play`);
    } catch (error) {
      console.error("Failed to create battle:", error);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return config.gameSize > 0;
      case 2:
        return config.selectedPlayers.length > 0;
      case 3:
        // Check that all selected players have chosen at least one unit
        return config.selectedPlayers.every(playerId => 
          config.playerUnits[playerId]?.length > 0
        );
      case 4:
        return config.deployment !== "" && config.mission !== "";
      case 5:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 max-w-4xl">
        <Button variant="ghost" asChild className="mb-6">
          <Link href={`/campaign/${campaignId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Campanha
          </Link>
        </Button>

        <h1 className="text-4xl font-bold mb-2">Configuração de Batalha</h1>
        <p className="text-muted-foreground mb-8">
          Configure sua batalha contra a Horda passo a passo
        </p>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  s < step
                    ? "bg-primary text-primary-foreground"
                    : s === step
                    ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {s < step ? <Check className="h-5 w-5" /> : s}
              </div>
              {s < 5 && (
                <div
                  className={`h-1 flex-1 mx-2 ${
                    s < step ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {step === 1 && "Passo 1: Tamanho do Jogo"}
              {step === 2 && "Passo 2: Selecionar Jogadores"}
              {step === 3 && "Passo 3: Selecionar Unidades"}
              {step === 4 && "Passo 4: Deployment e Missão"}
              {step === 5 && "Passo 5: Revisar e Iniciar"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Game Size */}
            {step === 1 && (
              <>
                <div className="space-y-3">
                  <Label>Tamanho do Jogo</Label>
                  <RadioGroup
                    value={config.gameSize.toString()}
                    onValueChange={(value) => {
                      const size = parseInt(value);
                      setConfig(prev => ({
                        ...prev,
                        gameSize: size,
                        spawnZones: size === 1000 ? 2 : 4
                      }));
                    }}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="1000" id="1000pts" />
                      <Label htmlFor="1000pts" className="font-normal cursor-pointer">
                        1.000 pontos (2 zonas de spawn)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="2000" id="2000pts" />
                      <Label htmlFor="2000pts" className="font-normal cursor-pointer">
                        2.000 pontos (4 zonas de spawn)
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <Label className="text-muted-foreground">Facção da Horda</Label>
                  <p className="text-lg font-medium mt-1">{campaign?.hordeFaction || "Carregando..."}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Definida na criação da campanha
                  </p>
                </div>
              </>
            )}

            {/* Step 2: Select Players */}
            {step === 2 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Selecione os Lord Commanders que participarão desta batalha
                </p>
                {players?.map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent/50 cursor-pointer"
                    onClick={() => handlePlayerToggle(player.id)}
                  >
                    <Checkbox
                      checked={config.selectedPlayers.includes(player.id)}
                      onCheckedChange={() => handlePlayerToggle(player.id)}
                    />
                    <div className="flex-1">
                      <p className="font-medium">{player.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {player.faction} • {player.requisitionPoints} RP
                      </p>
                    </div>
                  </div>
                ))}
                {players?.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum jogador encontrado. Adicione jogadores à campanha primeiro.
                  </p>
                )}
              </div>
            )}

            {/* Step 3: Unit Selection */}
            {step === 3 && players && (
              <UnitSelection
                players={players}
                selectedPlayerIds={config.selectedPlayers}
                gameSize={config.gameSize}
                playerUnits={config.playerUnits}
                onUnitsChange={(playerId, unitIds) => {
                  setConfig(prev => ({
                    ...prev,
                    playerUnits: {
                      ...prev.playerUnits,
                      [playerId]: unitIds
                    }
                  }));
                }}
                onComplete={() => handleNext()}
              />
            )}

            {/* Step 4: Deployment and Mission */}
            {step === 4 && (
              <>
                <div className="space-y-3">
                  <Label htmlFor="deployment">Deployment</Label>
                  <Select
                    value={config.deployment}
                    onValueChange={(value) =>
                      setConfig(prev => ({ ...prev, deployment: value }))
                    }
                  >
                    <SelectTrigger id="deployment">
                      <SelectValue placeholder="Escolha o deployment" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPLOYMENTS.map((dep) => (
                        <SelectItem key={dep} value={dep}>
                          {dep}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="mission">Missão</Label>
                  <Select
                    value={config.mission}
                    onValueChange={(value) =>
                      setConfig(prev => ({ ...prev, mission: value }))
                    }
                  >
                    <SelectTrigger id="mission">
                      <SelectValue placeholder="Escolha a missão" />
                    </SelectTrigger>
                    <SelectContent>
                      {MISSIONS.map((mission) => (
                        <SelectItem key={mission} value={mission}>
                          {mission}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* Step 5: Review */}
            {step === 5 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Tamanho do Jogo</Label>
                    <p className="text-lg font-medium">{config.gameSize} pontos</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Zonas de Spawn</Label>
                    <p className="text-lg font-medium">{config.spawnZones} zonas</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Facção da Horda</Label>
                    <p className="text-lg font-medium">{campaign?.hordeFaction}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Deployment</Label>
                    <p className="text-lg font-medium">{config.deployment}</p>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-muted-foreground">Missão</Label>
                    <p className="text-lg font-medium">{config.mission}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-muted-foreground">Jogadores e Unidades</Label>
                  <div className="mt-2 space-y-3">
                    {config.selectedPlayers.map((playerId) => {
                      const player = players?.find(p => p.id === playerId);
                      const selectedUnitIds = config.playerUnits[playerId] || [];
                      const pointsPerPlayer = Math.floor(config.gameSize / config.selectedPlayers.length);
                      
                      return player ? (
                        <div key={player.id} className="p-4 border rounded-lg space-y-2">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">{player.name}</p>
                              <p className="text-sm text-muted-foreground">{player.faction}</p>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Limite: {pointsPerPlayer} pts
                            </p>
                          </div>
                          <div className="text-sm">
                            <p className="text-muted-foreground mb-1">Unidades selecionadas: {selectedUnitIds.length}</p>
                          </div>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={step === 1}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>

              {step < 5 ? (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                >
                  Próximo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleStartBattle}
                  disabled={!canProceed() || createBattle.isPending}
                >
                  {createBattle.isPending ? "Iniciando..." : "Iniciar Batalha"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

