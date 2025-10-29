import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { Loader2, ArrowLeft, Star, Skull, Award, Pencil, Swords } from "lucide-react";
import { Link, useParams } from "wouter";
import { useState } from "react";

// XP Progress Bar Component
interface XPProgressBarProps {
  xp: number;
  rank: string;
}

function XPProgressBar({ xp, rank }: XPProgressBarProps) {
  const rankThresholds: Record<string, { current: number; next: number; nextRank: string | null }> = {
    battle_ready: { current: 0, next: 6, nextRank: 'Experiente' },
    blooded: { current: 6, next: 16, nextRank: 'Veterano' },
    battle_hardened: { current: 16, next: 31, nextRank: 'Heroico' },
    heroic: { current: 31, next: 51, nextRank: 'Lendário' },
    legendary: { current: 51, next: 51, nextRank: null },
  };

  const threshold = rankThresholds[rank] || rankThresholds.battle_ready;
  const xpInCurrentRank = xp - threshold.current;
  const xpNeededForNextRank = threshold.next - threshold.current;
  const percentage = threshold.nextRank 
    ? Math.min(100, Math.round((xpInCurrentRank / xpNeededForNextRank) * 100))
    : 100;

  return (
    <div className="w-48">
      <Progress value={percentage} className="h-2" />
      {threshold.nextRank && (
        <div className="text-xs text-muted-foreground mt-1 text-right">
          {xpInCurrentRank}/{xpNeededForNextRank} XP para {threshold.nextRank}
        </div>
      )}
      {!threshold.nextRank && (
        <div className="text-xs text-muted-foreground mt-1 text-right">
          Rank Máximo
        </div>
      )}
    </div>
  );
}

// Manage Battle Honours Dialog Component
interface ManageBattleHonoursDialogProps {
  unitId: number;
  unitName: string;
  onSuccess: () => void;
}

function ManageBattleHonoursDialog({ unitId, unitName, onSuccess }: ManageBattleHonoursDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedHonour, setSelectedHonour] = useState<string>('');

  const { data: honoursData, isLoading } = trpc.crusadeUnit.getAvailableBattleHonours.useQuery(
    { unitId },
    { enabled: isOpen }
  );

  const addHonour = trpc.crusadeUnit.addBattleHonour.useMutation({
    onSuccess: (data) => {
      onSuccess();
      setSelectedHonour('');
      alert(`✨ Battle Honour "${data.honour.name}" adicionado!\n\n${data.honour.effect}`);
    },
  });

  const removeHonour = trpc.crusadeUnit.removeBattleHonour.useMutation({
    onSuccess: () => {
      onSuccess();
    },
  });

  const handleAdd = () => {
    if (!selectedHonour) return;
    addHonour.mutate({ unitId, honourId: selectedHonour });
  };

  const handleRemove = (honourId: string) => {
    if (confirm('Remover esta Battle Honour?')) {
      removeHonour.mutate({ unitId, honourId });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Pencil className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gerenciar Battle Honours</DialogTitle>
          <DialogDescription>
            {unitName} - Máximo: {honoursData?.maxHonours || 0} honours
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Current Honours */}
            {honoursData && honoursData.currentHonours.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Battle Honours Atuais:</h4>
                <div className="space-y-2">
                  {honoursData.currentHonours.map((honourId: string) => {
                    const honour = honoursData.availableHonours.find((h: any) => h.id === honourId);
                    return (
                      <div key={honourId} className="flex items-start justify-between p-3 bg-muted rounded-lg">
                        <div className="flex-1">
                          <div className="font-semibold">{honour?.name || honourId}</div>
                          {honour && (
                            <>
                              <div className="text-sm text-muted-foreground mt-1">{honour.description}</div>
                              <div className="text-sm font-medium text-primary mt-1">
                                ⚔️ {honour.effect}
                              </div>
                            </>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemove(honourId)}
                          disabled={removeHonour.isPending}
                        >
                          ×
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Add New Honour */}
            {honoursData?.canAddMore && (
              <div>
                <h4 className="font-semibold mb-2">Adicionar Battle Honour:</h4>
                <div className="space-y-2">
                  {honoursData.availableHonours
                    .filter((h: any) => !honoursData.currentHonours.includes(h.id))
                    .map((honour: any) => (
                      <div
                        key={honour.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedHonour === honour.id
                            ? 'border-primary bg-primary/10'
                            : 'hover:border-primary/50'
                        }`}
                        onClick={() => setSelectedHonour(honour.id)}
                      >
                        <div className="font-semibold">{honour.name}</div>
                        <div className="text-sm text-muted-foreground mt-1">{honour.description}</div>
                        <div className="text-sm font-medium text-primary mt-1">
                          ⚔️ {honour.effect}
                        </div>
                        {honour.faction && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Facção: {honour.faction}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}
            
            {!honoursData?.canAddMore && (
              <div className="text-center text-muted-foreground py-4">
                Esta unidade já tem o máximo de Battle Honours para seu rank.
              </div>
            )}
          </div>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Fechar
          </Button>
          {honoursData?.canAddMore && selectedHonour && (
            <Button onClick={handleAdd} disabled={addHonour.isPending}>
              {addHonour.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adicionando...
                </>
              ) : (
                'Adicionar Honour'
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Manage Battle Scars Dialog Component
interface ManageBattleScarsDialogProps {
  unitId: number;
  unitName: string;
  onSuccess: () => void;
}

function ManageBattleScarsDialog({ unitId, unitName, onSuccess }: ManageBattleScarsDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedScar, setSelectedScar] = useState<string>('');

  const { data: scarsData, isLoading } = trpc.crusadeUnit.getAvailableBattleScars.useQuery(
    { unitId },
    { enabled: isOpen }
  );

  const addScar = trpc.crusadeUnit.addBattleScar.useMutation({
    onSuccess: (data) => {
      onSuccess();
      setSelectedScar('');
      alert(`☠️ Battle Scar "${data.scar.name}" adicionado!\n\n${data.scar.effect}`);
    },
  });

  const removeScar = trpc.crusadeUnit.removeBattleScar.useMutation({
    onSuccess: () => {
      onSuccess();
    },
  });

  const rollRandom = trpc.crusadeUnit.rollRandomBattleScar.useMutation({
    onSuccess: (data) => {
      onSuccess();
      alert(`🎲 Rolou: "${data.scar.name}"!\n\n${data.scar.description}\n\nEfeito: ${data.scar.effect}`);
    },
  });

  const handleAdd = () => {
    if (!selectedScar) return;
    addScar.mutate({ unitId, scarId: selectedScar });
  };

  const handleRemove = (scarId: string) => {
    if (confirm('Remover esta Battle Scar?')) {
      removeScar.mutate({ unitId, scarId });
    }
  };

  const handleRollRandom = () => {
    if (confirm('Rolar uma Battle Scar aleatória?')) {
      rollRandom.mutate({ unitId });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Pencil className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gerenciar Battle Scars</DialogTitle>
          <DialogDescription>
            {unitName} - Cicatrizes de batalha
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Current Scars */}
            {scarsData && scarsData.currentScars.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Battle Scars Atuais:</h4>
                <div className="space-y-2">
                  {scarsData.currentScars.map((scarId: string) => {
                    const scar = scarsData.availableScars.find((s: any) => s.id === scarId);
                    return (
                      <div key={scarId} className="flex items-start justify-between p-3 bg-red-950/20 border border-red-900/30 rounded-lg">
                        <div className="flex-1">
                          <div className="font-semibold text-red-400">{scar?.name || scarId}</div>
                          {scar && (
                            <>
                              <div className="text-sm text-muted-foreground mt-1">{scar.description}</div>
                              <div className="text-sm font-medium text-red-500 mt-1">
                                ☠️ {scar.effect}
                              </div>
                            </>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemove(scarId)}
                          disabled={removeScar.isPending}
                        >
                          ×
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Roll Random Scar Button */}
            <div className="flex justify-center">
              <Button
                onClick={handleRollRandom}
                disabled={rollRandom.isPending}
                variant="destructive"
              >
                {rollRandom.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Rolando...
                  </>
                ) : (
                  <>🎲 Rolar Battle Scar Aleatória</>
                )}
              </Button>
            </div>
            
            {/* Add Specific Scar */}
            <div>
              <h4 className="font-semibold mb-2">Ou escolha uma Battle Scar específica:</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {scarsData?.availableScars
                  .filter((s: any) => !scarsData.currentScars.includes(s.id))
                  .map((scar: any) => (
                    <div
                      key={scar.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedScar === scar.id
                          ? 'border-red-500 bg-red-950/20'
                          : 'hover:border-red-500/50'
                      }`}
                      onClick={() => setSelectedScar(scar.id)}
                    >
                      <div className="font-semibold text-red-400">{scar.name}</div>
                      <div className="text-sm text-muted-foreground mt-1">{scar.description}</div>
                      <div className="text-sm font-medium text-red-500 mt-1">
                        ☠️ {scar.effect}
                      </div>
                      {scar.faction && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Facção: {scar.faction}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Fechar
          </Button>
          {selectedScar && (
            <Button onClick={handleAdd} disabled={addScar.isPending} variant="destructive">
              {addScar.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adicionando...
                </>
              ) : (
                'Adicionar Scar'
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Manage Battle Traits Dialog Component
interface ManageBattleTraitsDialogProps {
  unitId: number;
  unitName: string;
  onSuccess: () => void;
}

function ManageBattleTraitsDialog({ unitId, unitName, onSuccess }: ManageBattleTraitsDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTrait, setSelectedTrait] = useState<string>('');

  const { data: traitsData, isLoading } = trpc.crusadeUnit.getAvailableBattleTraits.useQuery(
    { unitId },
    { enabled: isOpen }
  );

  const addTrait = trpc.crusadeUnit.addBattleTrait.useMutation({
    onSuccess: (data) => {
      onSuccess();
      setSelectedTrait('');
      alert(`⭐ Battle Trait "${data.trait.name}" adicionado!\n\n${data.trait.effect}`);
    },
  });

  const removeTrait = trpc.crusadeUnit.removeBattleTrait.useMutation({
    onSuccess: () => {
      onSuccess();
    },
  });

  const handleAdd = () => {
    if (!selectedTrait) return;
    addTrait.mutate({ unitId, traitId: selectedTrait });
  };

  const handleRemove = (traitId: string) => {
    if (confirm('Remover este Battle Trait?')) {
      removeTrait.mutate({ unitId, traitId });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Pencil className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gerenciar Battle Traits</DialogTitle>
          <DialogDescription>
            {unitName} - Traços de batalha específicos da facção
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Current Traits */}
            {traitsData && traitsData.currentTraits.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Battle Traits Atuais:</h4>
                <div className="space-y-2">
                  {traitsData.currentTraits.map((traitId: string) => {
                    const trait = traitsData.availableTraits.find((t: any) => t.id === traitId);
                    return (
                      <div key={traitId} className="flex items-start justify-between p-3 bg-blue-950/20 border border-blue-900/30 rounded-lg">
                        <div className="flex-1">
                          <div className="font-semibold text-blue-400">{trait?.name || traitId}</div>
                          {trait && (
                            <>
                              <div className="text-sm text-muted-foreground mt-1">{trait.description}</div>
                              <div className="text-sm font-medium text-blue-500 mt-1">
                                ⭐ {trait.effect}
                              </div>
                            </>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemove(traitId)}
                          disabled={removeTrait.isPending}
                        >
                          ×
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Add New Trait */}
            <div>
              <h4 className="font-semibold mb-2">Adicionar Battle Trait:</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {traitsData?.availableTraits
                  .filter((t: any) => !traitsData.currentTraits.includes(t.id))
                  .map((trait: any) => (
                    <div
                      key={trait.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedTrait === trait.id
                          ? 'border-blue-500 bg-blue-950/20'
                          : 'hover:border-blue-500/50'
                      }`}
                      onClick={() => setSelectedTrait(trait.id)}
                    >
                      <div className="font-semibold text-blue-400">{trait.name}</div>
                      <div className="text-sm text-muted-foreground mt-1">{trait.description}</div>
                      <div className="text-sm font-medium text-blue-500 mt-1">
                        ⭐ {trait.effect}
                      </div>
                    </div>
                  ))}
                {traitsData && traitsData.availableTraits.length === 0 && (
                  <div className="text-center text-muted-foreground py-4">
                    Nenhum Battle Trait disponível para esta facção.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Fechar
          </Button>
          {selectedTrait && (
            <Button onClick={handleAdd} disabled={addTrait.isPending}>
              {addTrait.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adicionando...
                </>
              ) : (
                'Adicionar Trait'
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Record Battle Dialog Component
interface RecordBattleDialogProps {
  unitId: number;
  unitName: string;
  onSuccess: () => void;
}

function RecordBattleDialog({ unitId, unitName, onSuccess }: RecordBattleDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [survived, setSurvived] = useState(true);
  const [kills, setKills] = useState(0);
  const [outOfAction, setOutOfAction] = useState('');

  const recordBattle = trpc.crusadeUnit.recordBattleResult.useMutation({
    onSuccess: (data) => {
      onSuccess();
      setIsOpen(false);
      // Reset form
      setSurvived(true);
      setKills(0);
      setOutOfAction('');
      
      // Show promotion alert if promoted
      if (data.wasPromoted) {
        alert(`🎉 ${unitName} foi promovido para ${data.newRank}! Ganhou ${data.xpEarned} XP.`);
      }
    },
  });

  const handleSubmit = () => {
    recordBattle.mutate({
      unitId,
      survived,
      enemyUnitsDestroyed: kills,
      outOfActionStatus: outOfAction || undefined,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Swords className="mr-2 h-4 w-4" />
          Registrar Batalha
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar Resultado de Batalha</DialogTitle>
          <DialogDescription>
            Atualize as estatísticas de {unitName} após a batalha
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>A unidade sobreviveu?</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={survived ? "default" : "outline"}
                onClick={() => setSurvived(true)}
                className="flex-1"
              >
                Sim
              </Button>
              <Button
                type="button"
                variant={!survived ? "destructive" : "outline"}
                onClick={() => setSurvived(false)}
                className="flex-1"
              >
                Não
              </Button>
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="kills">Unidades inimigas destruídas</Label>
            <Input
              id="kills"
              type="number"
              min="0"
              value={kills}
              onChange={(e) => setKills(parseInt(e.target.value) || 0)}
            />
          </div>
          
          {!survived && (
            <div className="grid gap-2">
              <Label htmlFor="outOfAction">Status Out of Action (opcional)</Label>
              <Input
                id="outOfAction"
                value={outOfAction}
                onChange={(e) => setOutOfAction(e.target.value)}
                placeholder="Ex: Ferimento grave"
              />
            </div>
          )}
          
          <div className="bg-muted p-3 rounded-md text-sm">
            <div className="font-semibold mb-1">XP que será ganho:</div>
            <div className="space-y-1 text-muted-foreground">
              <div>• Jogou batalha: +1 XP</div>
              {survived && <div>• Sobreviveu: +1 XP</div>}
              {kills > 0 && <div>• {kills} kills: +{kills} XP</div>}
              <div className="font-semibold text-foreground mt-2">
                Total: +{1 + (survived ? 1 : 0) + kills} XP
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={recordBattle.isPending}>
            {recordBattle.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              'Registrar'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface EditCrusadeNameDialogProps {
  unitId: number;
  unitName: string;
  currentName: string;
  onNameChange: (name: string) => void;
  onClose: () => void;
  onSuccess: () => void;
}

function EditCrusadeNameDialog({ unitId, unitName, currentName, onNameChange, onClose, onSuccess }: EditCrusadeNameDialogProps) {
  const updateUnit = trpc.crusadeUnit.update.useMutation({
    onSuccess: () => {
      onSuccess();
      onClose();
    },
  });

  const handleSave = () => {
    updateUnit.mutate({
      id: unitId,
      crusadeName: currentName || undefined,
    });
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Editar Nome de Cruzada</DialogTitle>
        <DialogDescription>
          Dê um nome único para {unitName}
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="crusadeName">Nome de Cruzada</Label>
          <Input
            id="crusadeName"
            value={currentName}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Ex: Os Vingadores de Terra"
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button onClick={handleSave} disabled={updateUnit.isPending}>
          {updateUnit.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            'Salvar'
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

export default function PlayerDetail() {
  const { id } = useParams<{ id: string }>();
  const playerId = parseInt(id || '0');
  const [editingUnitId, setEditingUnitId] = useState<number | null>(null);
  const [crusadeName, setCrusadeName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const utils = trpc.useUtils();

  const { data: player, isLoading: playerLoading } = trpc.player.get.useQuery(
    { id: playerId },
    { enabled: !isNaN(playerId) && playerId > 0 }
  );
  const { data: units, isLoading: unitsLoading } = trpc.crusadeUnit.list.useQuery(
    { playerId },
    { enabled: !isNaN(playerId) && playerId > 0 }
  );

  if (playerLoading || unitsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!player) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <p>Jogador não encontrado</p>
            <Button asChild className="mt-4">
              <Link href="/campaigns">Voltar</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'legendary': return 'bg-purple-500/20 text-purple-500 border-purple-500/50';
      case 'heroic': return 'bg-orange-500/20 text-orange-500 border-orange-500/50';
      case 'battle_hardened': return 'bg-blue-500/20 text-blue-500 border-blue-500/50';
      case 'blooded': return 'bg-green-500/20 text-green-500 border-green-500/50';
      default: return 'bg-gray-500/20 text-gray-500 border-gray-500/50';
    }
  };

  const getRankLabel = (rank: string) => {
    switch (rank) {
      case 'legendary': return 'Lendário';
      case 'heroic': return 'Heroico';
      case 'battle_hardened': return 'Veterano';
      case 'blooded': return 'Experiente';
      default: return 'Pronto para Batalha';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link href={`/campaign/${player.campaignId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Campanha
          </Link>
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{player.name}</h1>
          <p className="text-xl text-muted-foreground mb-4">
            {player.faction} {player.detachment && `• ${player.detachment}`}
          </p>
          {player.crusadeForceName && (
            <p className="text-lg text-muted-foreground italic">
              "{player.crusadeForceName}"
            </p>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Pontos de Requisição</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{player.requisitionPoints}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Batalhas Jogadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{player.battleTally}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Vitórias</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{player.victories}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Pontos de Suprimento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{player.supplyPoints}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Order of Battle</CardTitle>
            <CardDescription>
              Unidades de Cruzada desta força • {units?.length || 0} unidades
            </CardDescription>
          </CardHeader>
          <CardContent>
            {units && units.length > 0 ? (
              <div className="space-y-4">
                {units.map((unit) => (
                  <Card key={unit.id} className="border-2">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold">{unit.unitName}</h3>
                            {unit.crusadeName && (
                              <span className="text-muted-foreground italic">
                                "{unit.crusadeName}"
                              </span>
                            )}
                            <Dialog open={isDialogOpen && editingUnitId === unit.id} onOpenChange={(open) => {
                              setIsDialogOpen(open);
                              if (!open) setEditingUnitId(null);
                            }}>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0"
                                  onClick={() => {
                                    setEditingUnitId(unit.id);
                                    setCrusadeName(unit.crusadeName || '');
                                    setIsDialogOpen(true);
                                  }}
                                >
                                  <Pencil className="h-3 w-3" />
                                </Button>
                              </DialogTrigger>
                              <EditCrusadeNameDialog
                                unitId={unit.id}
                                unitName={unit.unitName}
                                currentName={crusadeName}
                                onNameChange={setCrusadeName}
                                onClose={() => {
                                  setIsDialogOpen(false);
                                  setEditingUnitId(null);
                                }}
                                onSuccess={() => {
                                  utils.crusadeUnit.list.invalidate({ playerId });
                                }}
                              />
                            </Dialog>
                          </div>
                          
                          <div className="flex items-center gap-2 mb-3">
                            <Badge className={getRankColor(unit.rank)}>
                              {getRankLabel(unit.rank)}
                            </Badge>
                            {unit.category && (
                              <Badge variant="outline">{unit.category}</Badge>
                            )}
                            {unit.isDestroyed && (
                              <Badge variant="destructive">
                                <Skull className="mr-1 h-3 w-3" />
                                Destruído
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right space-y-2">
                          <div>
                            <div className="text-2xl font-bold">{unit.experiencePoints} XP</div>
                            <div className="text-sm text-muted-foreground">
                              {unit.powerRating} PR • {unit.pointsCost} pts
                            </div>
                          </div>
                          <XPProgressBar xp={unit.experiencePoints} rank={unit.rank} />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Batalhas</div>
                          <div className="font-semibold">{unit.battlesPlayed}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Sobrevivências</div>
                          <div className="font-semibold">{unit.battlesSurvived}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Kills</div>
                          <div className="font-semibold">{unit.enemyUnitsDestroyed}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Modelos</div>
                          <div className="font-semibold">
                            {unit.models.reduce((sum: number, m: any) => sum + m.count, 0)}
                          </div>
                        </div>
                      </div>

                      {/* Record Battle Button */}
                      {!unit.isDestroyed && (
                        <div className="mt-4 pt-4 border-t">
                          <RecordBattleDialog
                            unitId={unit.id}
                            unitName={unit.unitName}
                            onSuccess={() => {
                              utils.crusadeUnit.list.invalidate({ playerId });
                            }}
                          />
                        </div>
                      )}

                      {(unit.battleHonours.length > 0 || unit.battleTraits.length > 0 || unit.battleScars.length > 0) && (
                        <div className="space-y-2 pt-4 border-t">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2 text-sm font-semibold">
                                <Award className="h-4 w-4 text-yellow-500" />
                                Battle Honours ({unit.battleHonours.length})
                              </div>
                              {!unit.isDestroyed && (
                                <ManageBattleHonoursDialog
                                  unitId={unit.id}
                                  unitName={unit.unitName}
                                  onSuccess={() => {
                                    utils.crusadeUnit.list.invalidate({ playerId });
                                  }}
                                />
                              )}
                            </div>
                            {unit.battleHonours.length > 0 ? (
                              <div className="text-sm space-y-1 pl-6">
                                {unit.battleHonours.map((honourId: string) => (
                                  <div key={honourId} className="text-muted-foreground">
                                    • {honourId}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-sm text-muted-foreground pl-6 italic">
                                Nenhuma Battle Honour ainda
                              </div>
                            )}
                          </div>
                          
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2 text-sm font-semibold">
                                <Star className="h-4 w-4 text-blue-500" />
                                Battle Traits ({unit.battleTraits.length})
                              </div>
                              {!unit.isDestroyed && (
                                <ManageBattleTraitsDialog
                                  unitId={unit.id}
                                  unitName={unit.unitName}
                                  onSuccess={() => {
                                    utils.crusadeUnit.list.invalidate({ playerId });
                                  }}
                                />
                              )}
                            </div>
                            {unit.battleTraits.length > 0 ? (
                              <div className="text-sm space-y-1 pl-6">
                                {unit.battleTraits.map((traitId: string) => (
                                  <div key={traitId} className="text-blue-400">
                                    ⭐ {traitId}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-sm text-muted-foreground pl-6 italic">
                                Nenhum Battle Trait
                              </div>
                            )}
                          </div>
                          
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2 text-sm font-semibold">
                                <Skull className="h-4 w-4 text-red-500" />
                                Battle Scars ({unit.battleScars.length})
                              </div>
                              {!unit.isDestroyed && (
                                <ManageBattleScarsDialog
                                  unitId={unit.id}
                                  unitName={unit.unitName}
                                  onSuccess={() => {
                                    utils.crusadeUnit.list.invalidate({ playerId });
                                  }}
                                />
                              )}
                            </div>
                            {unit.battleScars.length > 0 ? (
                              <div className="text-sm space-y-1 pl-6">
                                {unit.battleScars.map((scarId: string) => (
                                  <div key={scarId} className="text-red-400">
                                    ☠️ {scarId}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-sm text-muted-foreground pl-6 italic">
                                Nenhuma Battle Scar
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {unit.notes && (
                        <div className="mt-4 pt-4 border-t">
                          <div className="text-sm text-muted-foreground">{unit.notes}</div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>Nenhuma unidade importada ainda</p>
                <p className="text-sm mt-2">
                  Use o botão "Importar Exército" na página da campanha
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

