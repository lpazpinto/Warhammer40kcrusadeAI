import { CommandHero, DossierPanel } from "@/components/CommandPanels";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { trpc } from "@/lib/trpc";
import { Loader2, ArrowLeft, ArrowRight, Dice3, Check, Map, Coins, ShoppingCart, Users, ClipboardCheck } from "lucide-react";
import { useState } from "react";
import { Link, useParams, useLocation } from "wouter";
import { toast } from "sonner";
import { MISSION_TABLE_A, MISSION_TABLE_B, getRandomMission, type Mission } from "@shared/missions";
import { REQUISITIONS, type Requisition } from "@shared/requisitions";

interface BattleConfig {
  missionTable: 'A' | 'B' | null;
  missionSelection: 'manual' | 'random' | null;
  selectedMission: Mission | null;
  totalPoints: number;
  playerRequisitions: Record<number, string[]>; // playerId -> requisitionIds[]
  playerUnits: Record<number, number[]>; // playerId -> unitIds[]
}

/**
 * Interface para configurar e iniciar uma batalha de campanha.
 *
 * Renderiza um assistente em cinco passos para selecionar missão, definir pontos,
 * gastar requisições, selecionar unidades e confirmar, além de criar a batalha
 * e os participantes no backend quando confirmado. Se nenhuma unidade for selecionada
 * por um jogador, inclui automaticamente todas as unidades do Order of Battle desse jogador.
 *
 * @returns Elemento React que renderiza a tela de configuração de batalha.
 */
export default function BattleSetup() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const id = parseInt(campaignId || '0');
  const [, setLocation] = useLocation();
  
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState<BattleConfig>({
    missionTable: null,
    missionSelection: null,
    selectedMission: null,
    totalPoints: 1000,
    playerRequisitions: {},
    playerUnits: {},
  });
  
  const [unitDialogOpen, setUnitDialogOpen] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);
  const [tempSelectedUnits, setTempSelectedUnits] = useState<number[]>([]);
  
  // Requisition modal state
  const [requisitionDialogOpen, setRequisitionDialogOpen] = useState(false);
  const [selectedRequisition, setSelectedRequisition] = useState<Requisition | null>(null);
  const [requisitionPlayerId, setRequisitionPlayerId] = useState<number | null>(null);
  const [selectedUnitForRequisition, setSelectedUnitForRequisition] = useState<number | null>(null);
  
  const increaseSupplyLimitMutation = trpc.player.applyIncreaseSupplyLimit.useMutation();
  const createBattle = trpc.battle.create.useMutation();
  const createParticipant = trpc.battleParticipant.create.useMutation();
  const utils = trpc.useUtils();

  const { data: campaign, isLoading: campaignLoading } = trpc.campaign.get.useQuery(
    { id },
    { enabled: !isNaN(id) && id > 0 }
  );
  
  const { data: players, isLoading: playersLoading } = trpc.player.list.useQuery(
    { campaignId: id },
    { enabled: !isNaN(id) && id > 0 }
  );
  
  // Fetch units for the selected player
  const { data: playerUnits, isLoading: unitsLoading } = trpc.crusadeUnit.list.useQuery(
    { playerId: selectedPlayerId || 0 },
    { enabled: selectedPlayerId !== null && selectedPlayerId > 0 }
  );

  if (campaignLoading || playersLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="command-surface rounded-lg p-6 text-center space-y-4">
          <p>Campanha não encontrada</p>
          <Button asChild>
            <Link href="/campaigns">Voltar para Campanhas</Link>
          </Button>
        </div>
      </div>
    );
  }

  const handleNext = () => {
    // Validation for each step
    if (step === 1) {
      if (!config.missionTable) {
        toast.error('Selecione uma tabela de missões');
        return;
      }
      if (!config.missionSelection) {
        toast.error('Selecione o modo de seleção de missão');
        return;
      }
      
      // If random, roll now
      if (config.missionSelection === 'random') {
        const randomMission = getRandomMission(config.missionTable);
        setConfig({ ...config, selectedMission: randomMission });
        toast.success(`Missão aleatória: ${randomMission.name}`);
      }
      
      // If manual but no mission selected
      if (config.missionSelection === 'manual' && !config.selectedMission) {
        toast.error('Selecione uma missão');
        return;
      }
    }
    
    if (step === 2) {
      if (config.totalPoints < 500 || config.totalPoints > 3000) {
        toast.error('Pontos devem estar entre 500 e 3000');
        return;
      }
    }
    
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  // Query all units for all players to enable auto-selection
  const allPlayersUnitsQueries = trpc.useQueries((t) => 
    (players || []).map(player => 
      t.crusadeUnit.list({ playerId: player.id })
    )
  );

  const handleStartBattle = async () => {
    try {
      // Create battle with selected configuration
      const battle = await createBattle.mutateAsync({
        campaignId: id,
        deployment: 'Standard',
        missionPack: config.selectedMission?.name || 'Ponte Descarada',
      });

      console.log('Battle created:', battle);

      // Validate battle ID
      if (!battle || !battle.id || isNaN(battle.id)) {
        throw new Error('Failed to create battle: invalid ID returned');
      }

      // Create battle participants for each player with selected units
      // If no units were manually selected, auto-include all units from Order of Battle
      for (let i = 0; i < (players || []).length; i++) {
        const player = players![i];
        let selectedUnits = config.playerUnits[player.id] || [];
        
        // If no units selected, auto-include all units from Order of Battle
        if (selectedUnits.length === 0) {
          const playerUnitsData = allPlayersUnitsQueries[i]?.data || [];
          selectedUnits = playerUnitsData.map(unit => unit.id);
          console.log(`Auto-selecting all ${selectedUnits.length} units for player ${player.name}`);
        }
        
        // Always create participant, even with empty units array
        await createParticipant.mutateAsync({
          battleId: battle.id,
          playerId: player.id,
          unitsDeployed: selectedUnits,
        });
      }

      toast.success('Batalha criada com sucesso!');
      console.log('Redirecting to:', `/battle/tracker/${battle.id}`);
      setLocation(`/battle/tracker/${battle.id}`);
    } catch (error) {
      console.error('Error creating battle:', error);
      toast.error(`Erro ao criar batalha: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };
  
  const handleOpenUnitDialog = (playerId: number) => {
    setSelectedPlayerId(playerId);
    setTempSelectedUnits(config.playerUnits[playerId] || []);
    setUnitDialogOpen(true);
  };
  
  const handleSaveUnits = () => {
    if (selectedPlayerId !== null) {
      setConfig({
        ...config,
        playerUnits: {
          ...config.playerUnits,
          [selectedPlayerId]: tempSelectedUnits
        }
      });
      toast.success('Unidades selecionadas!');
    }
    setUnitDialogOpen(false);
    setSelectedPlayerId(null);
  };
  
  const toggleUnit = (unitId: number, unitPoints: number) => {
    const pointsPerPlayer = Math.floor(config.totalPoints / (players?.length || 1));
    const currentPoints = tempSelectedUnits.reduce((sum, id) => {
      const unit = playerUnits?.find(u => u.id === id);
      return sum + (unit?.pointsCost || 0);
    }, 0);
    
    if (tempSelectedUnits.includes(unitId)) {
      setTempSelectedUnits(tempSelectedUnits.filter(id => id !== unitId));
    } else {
      // Check if adding this unit would exceed limit
      if (currentPoints + unitPoints > pointsPerPlayer) {
        toast.error(`Limite de pontos excedido! Máximo: ${pointsPerPlayer}`);
        return;
      }
      setTempSelectedUnits([...tempSelectedUnits, unitId]);
    }
  };

  const STEPS = [
    { label: "Missão", icon: <Map className="h-4 w-4" /> },
    { label: "Pontos", icon: <Coins className="h-4 w-4" /> },
    { label: "Requisições", icon: <ShoppingCart className="h-4 w-4" /> },
    { label: "Unidades", icon: <Users className="h-4 w-4" /> },
    { label: "Confirmação", icon: <ClipboardCheck className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 space-y-6">
        <div className="flex items-center gap-2 text-xs command-title text-muted-foreground">
          <Link href="/campaigns" className="hover:text-foreground transition-colors">
            Campanhas
          </Link>
          <span>/</span>
          <Link href={`/campaign/${id}`} className="hover:text-foreground transition-colors">
            {campaign.name}
          </Link>
          <span>/</span>
          <span>Configurar Batalha</span>
        </div>

        <CommandHero
          eyebrow="Briefing Tático"
          title="Configurar Batalha"
          description={`Prepare o teatro de operações para a campanha ${campaign.name}`}
          actions={
            <Button variant="outline" asChild>
              <Link href={`/campaign/${id}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para Campanha
              </Link>
            </Button>
          }
          intel={
            <>
              <div className="border border-border/60 bg-background/50 p-4 rounded">
                <div className="text-xs command-title text-muted-foreground mb-1">Facção Inimiga</div>
                <div className="font-bold">{campaign.hordeFaction || "—"}</div>
              </div>
              <div className="border border-border/60 bg-background/50 p-4 rounded">
                <div className="text-xs command-title text-muted-foreground mb-1">Jogadores</div>
                <div className="font-bold">{players?.length ?? "—"}</div>
              </div>
              <div className="border border-border/60 bg-background/50 p-4 rounded">
                <div className="text-xs command-title text-muted-foreground mb-1">Passo</div>
                <div className="font-bold">{step} / 5</div>
              </div>
            </>
          }
        />

        {/* Tactical progress indicator */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {STEPS.map((s, idx) => {
            const stepNum = idx + 1;
            const isActive = stepNum === step;
            const isDone = stepNum < step;
            return (
              <div key={stepNum} className="flex items-center gap-1 flex-shrink-0">
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded border text-xs command-title transition-colors ${
                    isActive
                      ? "border-primary bg-primary/10 text-primary"
                      : isDone
                      ? "border-primary/40 bg-primary/5 text-primary/70"
                      : "border-border/50 bg-background/30 text-muted-foreground"
                  }`}
                >
                  <span className={isDone ? "text-primary/70" : isActive ? "text-primary" : ""}>{s.icon}</span>
                  <span>{s.label}</span>
                  {isDone && <Check className="h-3 w-3 text-primary/70 ml-0.5" />}
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={`h-px w-4 flex-shrink-0 ${isDone ? "bg-primary/40" : "bg-border/40"}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Step 1: Mission Selection */}
        {step === 1 && (
          <DossierPanel
            title="Passo 1: Selecionar Missão"
            subtitle="Escolha a tabela de missões e o modo de seleção"
            icon={<Map className="h-5 w-5" />}
          >
            <div className="space-y-6">
              {/* Mission Table Selection */}
              <div className="space-y-3">
                <Label>Tabela de Missões</Label>
                <RadioGroup
                  value={config.missionTable || ''}
                  onValueChange={(value) => setConfig({ ...config, missionTable: value as 'A' | 'B', selectedMission: null })}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="A" id="table-a" />
                    <Label htmlFor="table-a" className="cursor-pointer">
                      Tabela A (Fases 1-3)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="B" id="table-b" />
                    <Label htmlFor="table-b" className="cursor-pointer">
                      Tabela B (Fases 4-6)
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Mission Selection Mode */}
              {config.missionTable && (
                <div className="space-y-3">
                  <Label>Modo de Seleção</Label>
                  <RadioGroup
                    value={config.missionSelection || ''}
                    onValueChange={(value) => setConfig({ ...config, missionSelection: value as 'manual' | 'random', selectedMission: null })}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="manual" id="manual" />
                      <Label htmlFor="manual" className="cursor-pointer">
                        Escolher Manualmente
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="random" id="random" />
                      <Label htmlFor="random" className="cursor-pointer flex items-center gap-2">
                        <Dice3 className="h-4 w-4" />
                        Aleatória (2D3)
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              )}

              {/* Manual Mission Selection */}
              {config.missionSelection === 'manual' && config.missionTable && (
                <div className="space-y-3">
                  <Label>Escolher Missão</Label>
                  <div className="grid gap-2">
                    {(config.missionTable === 'A' ? MISSION_TABLE_A : MISSION_TABLE_B).map((mission) => (
                      <div
                        key={mission.id}
                        className={`cursor-pointer rounded-lg border p-4 flex items-center justify-between transition-colors ${
                          config.selectedMission?.id === mission.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border/60 bg-background/30 hover:border-primary/50'
                        }`}
                        onClick={() => setConfig({ ...config, selectedMission: mission })}
                      >
                        <div>
                          <div className="font-semibold">{mission.name}</div>
                          <div className="text-sm text-muted-foreground">{mission.pageReference}</div>
                        </div>
                        {config.selectedMission?.id === mission.id && (
                          <Check className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DossierPanel>
        )}

        {/* Step 2: Points Allocation */}
        {step === 2 && (
          <DossierPanel
            title="Passo 2: Definir Pontos"
            subtitle="Quantos pontos totais para esta batalha?"
            icon={<Coins className="h-5 w-5" />}
          >
            <div className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="points">Pontos Totais</Label>
                <Input
                  id="points"
                  type="number"
                  min={500}
                  max={3000}
                  step={100}
                  value={config.totalPoints}
                  onChange={(e) => setConfig({ ...config, totalPoints: parseInt(e.target.value) || 1000 })}
                />
                <p className="text-sm text-muted-foreground">
                  Cada jogador poderá usar até {Math.floor(config.totalPoints / (players?.length || 1))} pontos
                </p>
              </div>

              {/* Quick presets */}
              <div className="space-y-2">
                <Label>Presets Comuns</Label>
                <div className="flex gap-2 flex-wrap">
                  {[1000, 1500, 2000, 2500, 3000].map((points) => (
                    <Button
                      key={points}
                      variant={config.totalPoints === points ? 'default' : 'outline'}
                      onClick={() => setConfig({ ...config, totalPoints: points })}
                    >
                      {points}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </DossierPanel>
        )}

        {/* Step 3: Requisitions */}
        {step === 3 && (
          <DossierPanel
            title="Passo 3: Gastar Requisições"
            subtitle="Jogadores podem gastar Pontos de Requisição para comprar upgrades"
            icon={<ShoppingCart className="h-5 w-5" />}
          >
            <div className="space-y-6">
              {players && players.map((player) => {
                const playerRP = player.requisitionPoints || 0;
                const purchasedRequisitions = config.playerRequisitions[player.id] || [];
                const spentRP = purchasedRequisitions.length; // Simplified: each requisition costs 1RP for now
                const remainingRP = playerRP - spentRP;

                return (
                  <div key={player.id} className="rounded-lg border border-border/70 bg-background/35 p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold text-lg">{player.name}</h3>
                        <p className="text-sm text-muted-foreground">{player.faction}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{remainingRP} RP</div>
                        <div className="text-xs text-muted-foreground">
                          {spentRP} gastos / {playerRP} total
                        </div>
                      </div>
                    </div>

                    {purchasedRequisitions.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium command-title">Requisições Compradas:</p>
                        <div className="flex flex-wrap gap-2">
                          {purchasedRequisitions.map((reqId, idx) => {
                            const req = REQUISITIONS.find(r => r.id === reqId);
                            return (
                              <Badge key={idx} variant="secondary">
                                {req?.name}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <p className="text-sm font-medium command-title">Requisições Disponíveis:</p>
                      <div className="grid gap-2">
                        {REQUISITIONS.map((requisition) => {
                          const canAfford = typeof requisition.cost === 'number' 
                            ? remainingRP >= requisition.cost 
                            : remainingRP >= 1;
                          
                          return (
                            <div
                              key={requisition.id}
                              className="flex items-start gap-3 p-3 border border-border/60 rounded-lg hover:bg-muted/30 transition-colors"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold">{requisition.name}</span>
                                  <Badge variant="outline">{requisition.cost} RP</Badge>
                                  <Badge variant="secondary" className="text-xs">
                                    {requisition.timing === 'before_battle' ? 'Antes da Batalha' : 
                                     requisition.timing === 'after_battle' ? 'Depois da Batalha' : 
                                     'A Qualquer Momento'}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {requisition.description}
                                </p>
                                {requisition.restrictions && (
                                  <p className="text-xs text-amber-400 mt-1">
                                    Restrição: {requisition.restrictions}
                                  </p>
                                )}
                              </div>
                              <Button
                                size="sm"
                                variant={canAfford ? "default" : "outline"}
                                disabled={!canAfford || requisition.timing === 'after_battle'}
                                onClick={async () => {
                                  if (canAfford) {
                                    // Handle requisition purchase with automatic effects
                                    if (requisition.id === 'increase_supply_limit') {
                                      try {
                                        const result = await increaseSupplyLimitMutation.mutateAsync({
                                          playerId: player.id,
                                          rpCost: typeof requisition.cost === 'number' ? requisition.cost : 1,
                                        });
                                        toast.success(`${requisition.name} comprada! Novo limite: ${result.newSupplyLimit} pontos`);
                                        // Invalidate player query to refresh RP balance
                                        await utils.player.list.invalidate({ campaignId: id });
                                      } catch (error) {
                                        toast.error(`Erro ao comprar requisição: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
                                        return;
                                      }
                                      
                                      // Track purchase in wizard state
                                      setConfig({
                                        ...config,
                                        playerRequisitions: {
                                          ...config.playerRequisitions,
                                          [player.id]: [...purchasedRequisitions, requisition.id]
                                        }
                                      });
                                    } else {
                                      // Requisitions that need user input - open modal
                                      setSelectedRequisition(requisition);
                                      setRequisitionPlayerId(player.id);
                                      setRequisitionDialogOpen(true);
                                    }
                                  }
                                }}
                              >
                                Comprar
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground italic">
                      Requisições "Depois da Batalha" não podem ser compradas durante o setup.
                    </p>
                  </div>
                );
              })}
            </div>
          </DossierPanel>
        )}

        {/* Step 4: Unit Selection */}
        {step === 4 && (
          <DossierPanel
            title="Passo 4: Selecionar Unidades"
            subtitle="Cada jogador seleciona suas unidades para a batalha"
            icon={<Users className="h-5 w-5" />}
          >
            <div className="space-y-6">
              {players && players.map((player) => {
                const pointsPerPlayer = Math.floor(config.totalPoints / players.length);
                const selectedUnits = config.playerUnits[player.id] || [];
                
                return (
                  <div key={player.id} className="space-y-3 p-4 rounded-lg border border-border/70 bg-background/35">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{player.name}</h3>
                        <p className="text-sm text-muted-foreground">{player.faction}</p>
                      </div>
                      <Badge variant="outline">
                        {selectedUnits.length} unidades selecionadas
                      </Badge>
                    </div>
                    
                    <div className="text-sm">
                      <span className="text-muted-foreground">Limite: </span>
                      <span className="font-semibold">{pointsPerPlayer} pontos</span>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenUnitDialog(player.id)}
                    >
                      Selecionar Unidades
                    </Button>
                  </div>
                );
              })}
              
              <p className="text-sm text-muted-foreground mt-4">
                Por enquanto, todas as unidades do Order of Battle serão incluídas automaticamente.
              </p>
            </div>
          </DossierPanel>
        )}

        {/* Step 5: Confirmation */}
        {step === 5 && (
          <DossierPanel
            title="Passo 5: Confirmação"
            subtitle="Revise as configurações da batalha antes de iniciar"
            icon={<ClipboardCheck className="h-5 w-5" />}
          >
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-md border border-border/60 bg-background/40 p-3">
                  <div className="text-xs text-muted-foreground command-title mb-1">Missão</div>
                  <div className="font-semibold">
                    {config.selectedMission?.name}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {config.selectedMission?.pageReference}
                    </Badge>
                    {config.missionSelection === 'random' && (
                      <Badge variant="secondary" className="text-xs">Aleatória</Badge>
                    )}
                  </div>
                </div>

                <div className="rounded-md border border-border/60 bg-background/40 p-3">
                  <div className="text-xs text-muted-foreground command-title mb-1">Pontos Totais</div>
                  <div className="font-semibold">{config.totalPoints} pts</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {Math.floor(config.totalPoints / (players?.length || 1))} pts por jogador
                  </div>
                </div>

                <div className="rounded-md border border-border/60 bg-background/40 p-3">
                  <div className="text-xs text-muted-foreground command-title mb-1">Jogadores</div>
                  <div className="font-semibold">{players?.length || 0} jogador(es)</div>
                  {players && players.length > 0 && (
                    <ul className="mt-1 space-y-0.5">
                      {players.map((player) => (
                        <li key={player.id} className="text-xs text-muted-foreground">
                          {player.name} — {player.faction}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </DossierPanel>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 1}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>

          {step < 5 ? (
            <Button onClick={handleNext}>
              Próximo
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleStartBattle} size="lg">
              <Check className="mr-2 h-5 w-5" />
              Iniciar Batalha
            </Button>
          )}
        </div>
      </div>
      
      {/* Unit Selection Dialog */}
      <Dialog open={unitDialogOpen} onOpenChange={setUnitDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Selecionar Unidades</DialogTitle>
            <DialogDescription>
              Escolha as unidades que participarão desta batalha
            </DialogDescription>
          </DialogHeader>
          
          {unitsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : playerUnits && playerUnits.length > 0 ? (
            <div className="space-y-4">
              {/* Points summary */}
              <div className="p-4 rounded-md border border-border/60 bg-background/40">
                <div className="flex justify-between items-center">
                  <span className="text-sm command-title text-muted-foreground">Pontos Selecionados</span>
                  <span className="text-lg font-bold">
                    {tempSelectedUnits.reduce((sum, id) => {
                      const unit = playerUnits.find(u => u.id === id);
                      return sum + (unit?.pointsCost || 0);
                    }, 0)} / {Math.floor(config.totalPoints / (players?.length || 1))}
                  </span>
                </div>
              </div>
              
              {/* Unit list */}
              <div className="space-y-2">
                {playerUnits.map((unit) => (
                  <div
                    key={unit.id}
                    className="flex items-center space-x-3 p-3 border border-border/60 rounded-lg hover:bg-muted/30 cursor-pointer"
                    onClick={() => toggleUnit(unit.id, unit.pointsCost)}
                  >
                    <Checkbox
                      checked={tempSelectedUnits.includes(unit.id)}
                      onCheckedChange={() => toggleUnit(unit.id, unit.pointsCost)}
                    />
                    <div className="flex-1">
                      <div className="font-semibold">{unit.unitName}</div>
                      {unit.crusadeName && (
                        <div className="text-sm text-muted-foreground italic">
                          "{unit.crusadeName}"
                        </div>
                      )}
                    </div>
                    <Badge variant="outline">{unit.pointsCost} pts</Badge>
                    <Badge variant="secondary">{unit.powerRating} PR</Badge>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma unidade encontrada no Order of Battle
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setUnitDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveUnits}>
              Salvar Seleção
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Requisition Dialog */}
      <Dialog open={requisitionDialogOpen} onOpenChange={setRequisitionDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedRequisition?.name}</DialogTitle>
            <DialogDescription>
              {selectedRequisition?.description}
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequisition && requisitionPlayerId && (
            <div className="space-y-4">
              {/* Fetch player's units for selection */}
              {(() => {
                const { data: playerUnits } = trpc.crusadeUnit.list.useQuery(
                  { playerId: requisitionPlayerId },
                  { enabled: requisitionPlayerId !== null }
                );

                if (!playerUnits) {
                  return (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  );
                }

                return (
                  <div className="space-y-3">
                    <Label>Selecione a Unidade</Label>
                    <RadioGroup
                      value={selectedUnitForRequisition?.toString() || ''}
                      onValueChange={(value) => setSelectedUnitForRequisition(parseInt(value))}
                    >
                      {playerUnits.map((unit) => (
                        <div key={unit.id} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
                          <RadioGroupItem value={unit.id.toString()} id={`unit-${unit.id}`} />
                          <Label htmlFor={`unit-${unit.id}`} className="flex-1 cursor-pointer">
                            <div className="font-semibold">{unit.crusadeName || unit.unitName}</div>
                            <div className="text-sm text-muted-foreground">
                              {unit.category} • {unit.pointsCost} pts • {unit.experiencePoints} XP
                            </div>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                );
              })()}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setRequisitionDialogOpen(false);
              setSelectedRequisition(null);
              setRequisitionPlayerId(null);
              setSelectedUnitForRequisition(null);
            }}>
              Cancelar
            </Button>
            <Button 
              onClick={() => {
                if (!selectedUnitForRequisition || !selectedRequisition || !requisitionPlayerId) {
                  toast.error('Selecione uma unidade');
                  return;
                }
                
                // TODO: Apply requisition effect based on type
                toast.info('Efeito da requisição será implementado em breve');
                
                // Track purchase
                const purchasedRequisitions = config.playerRequisitions[requisitionPlayerId] || [];
                setConfig({
                  ...config,
                  playerRequisitions: {
                    ...config.playerRequisitions,
                    [requisitionPlayerId]: [...purchasedRequisitions, selectedRequisition.id]
                  }
                });
                
                // Close dialog
                setRequisitionDialogOpen(false);
                setSelectedRequisition(null);
                setRequisitionPlayerId(null);
                setSelectedUnitForRequisition(null);
              }}
              disabled={!selectedUnitForRequisition}
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}