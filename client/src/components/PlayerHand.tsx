import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import Card from './Card';
import type { Card as CardType } from '../types/game';

interface PlayerHandProps {
  cards: CardType[];
  onPlayCards: (cardIds: string[]) => void;
  isMyTurn: boolean;
}

const PlayerHand = ({ cards, onPlayCards, isMyTurn }: PlayerHandProps) => {
  const [selectedCards, setSelectedCards] = useState<string[]>([]);

  // Fonction de tri des cartes
  const sortedCards = useMemo(() => {
    const suitOrder = { 'hearts': 0, 'diamonds': 1, 'clubs': 2, 'spades': 3 };
    const valueOrder: { [key: string]: number } = {
      'A': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7,
      '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13
    };

    return [...cards].sort((a, b) => {
      // Trier d'abord par valeur, puis par couleur
      const valueCompare = valueOrder[a.value] - valueOrder[b.value];
      if (valueCompare !== 0) return valueCompare;
      return suitOrder[a.suit] - suitOrder[b.suit];
    });
  }, [cards]);

  // Détection automatique des familles (4 cartes de même valeur)
  const { displayedCards, removedFamilies } = useMemo(() => {
    // Grouper les cartes par valeur
    const cardsByValue: { [key: string]: CardType[] } = {};
    sortedCards.forEach(card => {
      if (!cardsByValue[card.value]) {
        cardsByValue[card.value] = [];
      }
      cardsByValue[card.value].push(card);
    });

    // Trouver les familles complètes (4 cartes)
    const families = Object.values(cardsByValue).filter(group => group.length === 4);
    
    // Retirer les familles de l'affichage
    const familyCardIds = new Set(families.flat().map(card => card.id));
    const cardsToDisplay = sortedCards.filter(card => !familyCardIds.has(card.id));
    
    return {
      displayedCards: cardsToDisplay,
      removedFamilies: families
    };
  }, [sortedCards]);

  const toggleCardSelection = (cardId: string) => {
    if (!isMyTurn) return;
    
    setSelectedCards(prev => 
      prev.includes(cardId)
        ? prev.filter(id => id !== cardId)
        : [...prev, cardId]
    );
  };

  const handlePlayCards = () => {
    if (selectedCards.length > 0) {
      onPlayCards(selectedCards);
      setSelectedCards([]);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-4 text-center">
        <h3 className="text-xl font-bold text-white">
          Votre main ({cards.length} cartes)
        </h3>
        {isMyTurn && (
          <p className="text-green-400 font-semibold mt-2">
            ✨ C'est votre tour !
          </p>
        )}
        {selectedCards.length > 0 && (
          <p className="text-yellow-400 font-semibold mt-2">
            {selectedCards.length} carte{selectedCards.length > 1 ? 's' : ''} sélectionnée{selectedCards.length > 1 ? 's' : ''}
          </p>
        )}
      </div>
      
      {/* Notification des familles retirées */}
      {removedFamilies.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-4 bg-purple-600 text-white px-4 py-2 rounded-lg text-center font-semibold"
        >
          🎉 Famille de {removedFamilies[0][0].value} retirée automatiquement !
        </motion.div>
      )}

      {/* Affichage des cartes triées (sans les familles) */}
      <div className="flex justify-center items-end gap-2 flex-wrap max-w-6xl mx-auto mb-4">
        {displayedCards.map((card, index) => {
          const isSelected = selectedCards.includes(card.id);
          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ 
                opacity: 1, 
                y: isSelected ? -20 : 0,
                scale: isSelected ? 1.1 : 1
              }}
              transition={{ delay: index * 0.05 }}
              className={`
                ${isSelected ? 'ring-4 ring-yellow-400 rounded-lg' : ''}
              `}
            >
              <Card
                card={card}
                onClick={() => toggleCardSelection(card.id)}
                disabled={!isMyTurn}
              />
            </motion.div>
          );
        })}
      </div>

      {/* Bouton pour jouer les cartes sélectionnées */}
      {isMyTurn && selectedCards.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mt-8"
        >
          <button
            onClick={handlePlayCards}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition-colors text-lg shadow-lg"
          >
            Jouer {selectedCards.length} carte{selectedCards.length > 1 ? 's' : ''}
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default PlayerHand;
