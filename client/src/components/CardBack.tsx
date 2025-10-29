import { motion } from 'framer-motion';

interface CardBackProps {
  count?: number;
  small?: boolean;
}

const CardBack = ({ count = 1, small = false }: CardBackProps) => {
  const cardSize = small ? 'w-16 h-24' : 'w-20 h-28';

  return (
    <div className="relative">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`
          ${cardSize} bg-gradient-to-br from-blue-600 to-blue-800 
          rounded-lg shadow-lg border-2 border-blue-900
          flex items-center justify-center
          relative overflow-hidden
        `}
      >
        {/* Pattern de fond */}
        <div className="absolute inset-0 opacity-20">
          <div className="grid grid-cols-3 grid-rows-4 h-full w-full gap-1 p-2">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="bg-white rounded-sm" />
            ))}
          </div>
        </div>
        
        {/* Symbole central */}
        <div className="text-white text-4xl font-bold z-10">
          🃏
        </div>
      </motion.div>
      
      {/* Compteur si plusieurs cartes */}
      {count > 1 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 bg-yellow-500 text-gray-900 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm shadow-lg z-20"
        >
          {count}
        </motion.div>
      )}
    </div>
  );
};

export default CardBack;
