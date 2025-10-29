import { motion, AnimatePresence } from 'framer-motion';
import Card from './Card';
import type { Card as CardType } from '../types/game';

interface LiarResultModalProps {
  isOpen: boolean;
  wasLiar: boolean;
  revealedCards: CardType[];
  declaredValue: string;
  loserName: string;
  winnerName: string;
  pileCount: number;
  onClose: () => void;
}

const LiarResultModal = ({
  isOpen,
  wasLiar,
  revealedCards,
  declaredValue,
  loserName,
  winnerName,
  pileCount,
  onClose
}: LiarResultModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4"
          >
            {/* Modal */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              className="bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-2xl w-full"
            >
              {/* Titre avec résultat */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="text-center mb-6"
              >
                {wasLiar ? (
                  <>
                    <div className="text-6xl mb-4">🤥</div>
                    <h2 className="text-4xl font-bold text-red-500 mb-2">
                      Bien sûr qu'c'est un couilleux ! Ce sale vicieux..
                    </h2>
                  </>
                ) : (
                  <>
                    <div className="text-6xl mb-4">✅</div>
                    <h2 className="text-4xl font-bold text-green-500 mb-2">
                      Eh non, c'était pas un mensonge ! Tout le monde n'est pas aussi vicieux que toi 🙂
                    </h2>
                  </>
                )}
              </motion.div>

              {/* Cartes révélées */}
              <div className="mb-6">
                <p className="text-gray-300 text-center mb-4">
                  Déclaration : <span className="font-bold text-yellow-400">{revealedCards.length} {declaredValue}</span>
                </p>
                <div className="flex justify-center gap-3 flex-wrap">
                  {revealedCards.map((card, index) => (
                    <motion.div
                      key={card.id}
                      initial={{ rotateY: 180, opacity: 0 }}
                      animate={{ rotateY: 0, opacity: 1 }}
                      transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                    >
                      <Card card={card} disabled small />
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Résultat */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className={`
                  rounded-lg p-6 mb-6 text-center
                  ${wasLiar ? 'bg-red-900 bg-opacity-50' : 'bg-green-900 bg-opacity-50'}
                `}
              >
                <p className="text-white text-xl mb-2">
                  <span className="font-bold text-yellow-400">{loserName}</span> récupère{' '}
                  <span className="font-bold">{pileCount}</span> carte{pileCount > 1 ? 's' : ''}
                </p>
                <p className="text-gray-300">
                  C'est au tour de <span className="font-bold text-yellow-400">{winnerName}</span>
                </p>
              </motion.div>

              {/* Bouton continuer */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                onClick={onClose}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg transition-colors text-lg"
              >
                Continuer
              </motion.button>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default LiarResultModal;
