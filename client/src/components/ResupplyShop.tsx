import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Coins, ShoppingCart, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ResupplyShopProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  battleId: number;
  participantId: number;
  playerName: string;
  currentSP: number;
  battleRound: number;
  onPurchase?: (cardName: string, cardCost: number, playerName: string) => void;
}

export default function ResupplyShop({
  open,
  onOpenChange,
  battleId,
  participantId,
  playerName,
  currentSP,
  battleRound,
  onPurchase,
}: ResupplyShopProps) {
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const utils = trpc.useUtils();

  // Fetch all available resupply cards
  const { data: cards, isLoading: cardsLoading } = trpc.battle.getResupplyCards.useQuery();

  // Fetch cards already purchased in this battle
  const { data: purchasedCards } = trpc.battle.getPurchasedCards.useQuery({ battleId });

  // Purchase card mutation
  const purchaseMutation = trpc.battle.purchaseCard.useMutation({
    onSuccess: (data) => {
      toast.success(`Carta comprada! SP restante: ${data.remainingSP}`);
      // Log the purchase event
      if (onPurchase && selectedCard) {
        const card = cards?.find(c => c.id === selectedCard);
        if (card) {
          onPurchase(card.namePt || card.nameEn, card.cost, playerName);
        }
      }
      utils.battle.getPurchasedCards.invalidate({ battleId });
      utils.battleParticipant.list.invalidate({ battleId });
      setSelectedCard(null);
    },
    onError: (error) => {
      toast.error(`Erro ao comprar carta: ${error.message}`);
    },
  });

  // Group cards by cost
  const cardsByCost = useMemo(() => {
    if (!cards) return {};
    
    const grouped: Record<string, typeof cards> = {};
    cards.forEach(card => {
      const costKey = card.cost === 0 ? "Variável" : `${card.cost} SP`;
      if (!grouped[costKey]) grouped[costKey] = [];
      grouped[costKey].push(card);
    });
    
    return grouped;
  }, [cards]);

  // Check if player can purchase a specific card
  const canPurchase = (card: any) => {
    // Check if player has enough SP
    if (card.cost > currentSP) return { can: false, reason: "SP insuficiente" };

    // Check if card has "one per player" restriction
    if (card.maxPerPlayer && card.maxPerPlayer === 1) {
      const alreadyPurchased = purchasedCards?.some(
        pc => pc.cardId === card.id && pc.participantId === participantId
      );
      if (alreadyPurchased) return { can: false, reason: "Já comprado (máx 1 por jogador)" };
    }

    // Check if card has "one per turn" restriction
    if (card.maxPerTurn && card.maxPerTurn === 1) {
      const alreadyPurchasedThisTurn = purchasedCards?.some(
        pc => pc.cardId === card.id && pc.participantId === participantId
      );
      if (alreadyPurchasedThisTurn) return { can: false, reason: "Já comprado neste turno" };
    }

    return { can: true, reason: "" };
  };

  const handlePurchase = (cardId: number, cost: number) => {
    purchaseMutation.mutate({
      battleId,
      participantId,
      cardId,
      battleRound,
      cost,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Loja de Reabastecimento - {playerName}</span>
            <Badge variant="default" className="text-lg px-4 py-2 gap-2">
              <Coins className="h-5 w-5" />
              {currentSP} SP
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Compre cartas de reabastecimento para apoiar suas tropas no campo de batalha.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-6">
            {cardsLoading ? (
              <p className="text-center text-muted-foreground">Carregando cartas...</p>
            ) : (
              Object.entries(cardsByCost).map(([costLabel, cardsInGroup]) => (
                <div key={costLabel} className="space-y-3">
                  <h3 className="text-lg font-semibold border-b pb-2">{costLabel}</h3>
                  <div className="grid gap-3">
                    {cardsInGroup.map((card) => {
                      const purchaseCheck = canPurchase(card);
                      const isSelected = selectedCard === card.id;

                      return (
                        <Card
                          key={card.id}
                          className={`cursor-pointer transition-all ${
                            isSelected
                              ? "border-blue-500 border-2 shadow-lg"
                              : purchaseCheck.can
                              ? "hover:border-blue-300"
                              : "opacity-60"
                          }`}
                          onClick={() => purchaseCheck.can && setSelectedCard(card.id)}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <CardTitle className="text-base">{card.namePt}</CardTitle>
                                <CardDescription className="text-sm mt-1">
                                  {card.descriptionPt}
                                </CardDescription>
                              </div>
                              <Badge variant={purchaseCheck.can ? "default" : "secondary"}>
                                {card.cost === 0 ? "X SP" : `${card.cost} SP`}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="space-y-2">
                              {card.tags && (
                                <div className="flex gap-1 flex-wrap">
                                  {card.tags.split(',').map(tag => (
                                    <Badge key={tag} variant="outline" className="text-xs">
                                      {tag.trim()}
                                    </Badge>
                                  ))}
                                </div>
                              )}

                              {!purchaseCheck.can && (
                                <Alert variant="destructive" className="mt-2">
                                  <AlertCircle className="h-4 w-4" />
                                  <AlertDescription className="text-xs">
                                    {purchaseCheck.reason}
                                  </AlertDescription>
                                </Alert>
                              )}

                              {isSelected && purchaseCheck.can && (
                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePurchase(card.id, card.cost);
                                  }}
                                  disabled={purchaseMutation.isPending}
                                  className="w-full mt-2 gap-2"
                                >
                                  <ShoppingCart className="h-4 w-4" />
                                  {purchaseMutation.isPending ? "Comprando..." : "Comprar Carta"}
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar Loja
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
