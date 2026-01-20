/**
 * MiseryCardsPanel - Displays active Misery Cards during battle
 * Misery Cards are negative effects that impact players during the battle round
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skull, AlertTriangle, Eye, Shuffle, X } from "lucide-react";
import { MISERY_CARDS, MiseryCard, drawMiseryCards } from "@shared/miseryCards";

interface MiseryCardsPanelProps {
  /** IDs of currently active Misery Cards */
  activeCardIds: number[];
  /** Callback when cards are drawn */
  onDrawCards?: (cards: MiseryCard[]) => void;
  /** Callback when a card is dismissed */
  onDismissCard?: (cardId: number) => void;
  /** Current battle round */
  battleRound: number;
  /** Whether to show draw button */
  showDrawButton?: boolean;
  /** Number of cards to draw by default */
  defaultDrawCount?: number;
}

export default function MiseryCardsPanel({
  activeCardIds,
  onDrawCards,
  onDismissCard,
  battleRound,
  showDrawButton = true,
  defaultDrawCount = 1,
}: MiseryCardsPanelProps) {
  const [selectedCard, setSelectedCard] = useState<MiseryCard | null>(null);
  const [showAllCards, setShowAllCards] = useState(false);

  // Get active cards from IDs
  const activeCards = activeCardIds
    .map(id => MISERY_CARDS.find(c => c.id === id))
    .filter((c): c is MiseryCard => c !== undefined);

  // Handle drawing new cards
  const handleDrawCards = () => {
    const newCards = drawMiseryCards(defaultDrawCount, activeCardIds);
    onDrawCards?.(newCards);
  };

  // Get tag color
  const getTagColor = (tag: MiseryCard['tags'][number]): string => {
    switch (tag) {
      case 'horde_buff':
        return 'bg-red-500/20 text-red-700 border-red-500/30';
      case 'player_debuff':
        return 'bg-orange-500/20 text-orange-700 border-orange-500/30';
      case 'spawn':
        return 'bg-purple-500/20 text-purple-700 border-purple-500/30';
      case 'objective':
        return 'bg-blue-500/20 text-blue-700 border-blue-500/30';
      case 'sp':
        return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30';
      case 'restriction':
        return 'bg-gray-500/20 text-gray-700 border-gray-500/30';
      case 'cascade':
        return 'bg-pink-500/20 text-pink-700 border-pink-500/30';
      default:
        return 'bg-gray-500/20 text-gray-700 border-gray-500/30';
    }
  };

  // Get tag label in Portuguese
  const getTagLabel = (tag: MiseryCard['tags'][number]): string => {
    switch (tag) {
      case 'horde_buff':
        return 'Buff Horda';
      case 'player_debuff':
        return 'Debuff Jogador';
      case 'spawn':
        return 'Geração';
      case 'objective':
        return 'Objetivo';
      case 'sp':
        return 'SP';
      case 'restriction':
        return 'Restrição';
      case 'cascade':
        return 'Cascata';
      default:
        return tag;
    }
  };

  return (
    <>
      <Card className="border-red-200 bg-red-50/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-red-800">
              <Skull className="h-5 w-5" />
              Cartas de Miséria
              {activeCards.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {activeCards.length} Ativa{activeCards.length > 1 ? 's' : ''}
                </Badge>
              )}
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllCards(true)}
                className="text-red-700 hover:text-red-800 hover:bg-red-100"
              >
                <Eye className="h-4 w-4 mr-1" />
                Ver Todas
              </Button>
              {showDrawButton && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDrawCards}
                  className="border-red-300 text-red-700 hover:bg-red-100"
                >
                  <Shuffle className="h-4 w-4 mr-1" />
                  Comprar
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {activeCards.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhuma Carta de Miséria ativa neste round.
            </p>
          ) : (
            <div className="space-y-3">
              {activeCards.map(card => (
                <div
                  key={card.id}
                  className="bg-white rounded-lg border border-red-200 p-3 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedCard(card)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-red-800">
                          #{card.id} - {card.namePt}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {card.effectPt}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {card.tags.map(tag => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className={`text-xs ${getTagColor(tag)}`}
                          >
                            {getTagLabel(tag)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    {onDismissCard && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDismissCard(card.id);
                        }}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Card Detail Dialog */}
      <Dialog open={!!selectedCard} onOpenChange={() => setSelectedCard(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              #{selectedCard?.id} - {selectedCard?.namePt}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              {selectedCard?.nameEn}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-sm text-gray-700 mb-2">Efeito:</h4>
              <p className="text-sm text-gray-600 bg-red-50 p-3 rounded-lg border border-red-100">
                {selectedCard?.effectPt}
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-gray-500 mb-2">Effect (EN):</h4>
              <p className="text-sm text-gray-400 bg-gray-50 p-3 rounded-lg">
                {selectedCard?.effectEn}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedCard?.tags.map(tag => (
                <Badge
                  key={tag}
                  variant="outline"
                  className={getTagColor(tag)}
                >
                  {getTagLabel(tag)}
                </Badge>
              ))}
            </div>
            {selectedCard?.cascadeCount && (
              <div className="bg-pink-50 border border-pink-200 rounded-lg p-3">
                <p className="text-sm text-pink-800">
                  <strong>⚠️ Efeito Cascata:</strong> Esta carta revela +{selectedCard.cascadeCount} Cartas de Miséria adicionais!
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* All Cards Reference Dialog */}
      <Dialog open={showAllCards} onOpenChange={setShowAllCards}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Skull className="h-5 w-5 text-red-600" />
              Todas as Cartas de Miséria (32)
            </DialogTitle>
            <DialogDescription>
              Referência completa de todas as Cartas de Miséria do Horde Mode
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            {MISERY_CARDS.map(card => (
              <div
                key={card.id}
                className={`p-3 rounded-lg border ${
                  activeCardIds.includes(card.id)
                    ? 'bg-red-100 border-red-300'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <span className="font-semibold text-sm">
                    #{card.id} - {card.namePt}
                  </span>
                  {activeCardIds.includes(card.id) && (
                    <Badge variant="destructive" className="text-xs">Ativa</Badge>
                  )}
                </div>
                <p className="text-xs text-gray-600 line-clamp-3">
                  {card.effectPt}
                </p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
