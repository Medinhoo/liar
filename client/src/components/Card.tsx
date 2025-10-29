import { motion } from 'framer-motion';
import type { Card as CardType } from '../types/game';

interface CardProps {
  card: CardType;
  onClick?: () => void;
  disabled?: boolean;
  small?: boolean;
}

const Card = ({ card, onClick, disabled = false, small = false }: CardProps) => {
  const suitColors = {
    hearts: 'text-red-600',
    diamonds: 'text-red-600',
    clubs: 'text-gray-800',
    spades: 'text-gray-800',
  };

  const cardSize = small ? 'w-16 h-24' : 'w-20 h-28';
  const fontSize = small ? 'text-lg' : 'text-2xl';

  return (
    <motion.div
      whileHover={!disabled ? { scale: 1.05, y: -10 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      onClick={!disabled ? onClick : undefined}
      className={`
        ${cardSize} bg-white rounded-lg shadow-lg border-2 border-gray-300
        flex flex-col items-center justify-between p-2
        ${!disabled ? 'cursor-pointer hover:shadow-xl' : 'cursor-not-allowed opacity-60'}
        transition-shadow
      `}
    >
      <div className={`${fontSize} font-bold ${suitColors[card.suit]}`}>
        {card.value}
      </div>
      <div className={`text-4xl ${suitColors[card.suit]}`}>
        {card.symbol}
      </div>
      <div className={`${fontSize} font-bold ${suitColors[card.suit]}`}>
        {card.value}
      </div>
    </motion.div>
  );
};

export default Card;
