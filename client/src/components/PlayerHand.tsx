import { useState } from 'react';
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
      
      <div className="flex justify-center items-end gap-2 flex-wrap max-w-6xl mx-auto mb-4">
        {cards.map((card, index) => {
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
          className="flex justify-center"
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
