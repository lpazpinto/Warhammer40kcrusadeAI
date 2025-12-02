import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

interface ObjectivesInputModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (objectivesCount: number) => void;
  playerCount: number;
  isSoloMode: boolean;
}

export default function ObjectivesInputModal({
  open,
  onClose,
  onConfirm,
  playerCount,
  isSoloMode
}: ObjectivesInputModalProps) {
  const [objectivesCount, setObjectivesCount] = useState(0);

  const handleConfirm = () => {
    if (objectivesCount < 0) {
      return;
    }
    onConfirm(objectivesCount);
    onClose();
  };

  const spPerPlayer = isSoloMode ? objectivesCount * 2 : objectivesCount;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Distribuição de Pontos de Suprimento (SP)</DialogTitle>
          <DialogDescription>
            Informe quantos objetivos estão sob controle dos jogadores para calcular os SP ganhos nesta rodada.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="objectives">Objetivos Controlados</Label>
            <Input
              id="objectives"
              type="number"
              min="0"
              value={objectivesCount}
              onChange={(e) => setObjectivesCount(Math.max(0, parseInt(e.target.value) || 0))}
              placeholder="0"
            />
          </div>

          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2 text-sm">
                <p><strong>Regras de SP:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  <li>1 SP por objetivo controlado (todos os jogadores recebem)</li>
                  <li>1 SP por unidade Horda destruída (apenas quem destruiu)</li>
                  <li>SP de Missões Secundárias bem-sucedidas</li>
                  {isSoloMode && <li className="text-yellow-600 font-semibold">Modo Solo: Dobro de SP de objetivos!</li>}
                </ul>
              </div>
            </AlertDescription>
          </Alert>

          <div className="bg-muted p-4 rounded-lg space-y-2">
            <h4 className="font-semibold">Distribuição Calculada:</h4>
            <div className="text-sm space-y-1">
              <p>• Objetivos controlados: <strong>{objectivesCount}</strong></p>
              <p>• SP por jogador: <strong className="text-green-600">+{spPerPlayer} SP</strong></p>
              <p>• Total de jogadores: <strong>{playerCount}</strong></p>
              {isSoloMode && (
                <p className="text-yellow-600 font-semibold">
                  ⚡ Modo Solo: {objectivesCount} × 2 = {spPerPlayer} SP
                </p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm}>
            Distribuir SP
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
