import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DeclareCardsModalProps {
  isOpen: boolean;
  cardCount: number;
  onConfirm: (declaredValue: string) => void;
  onCancel: () => void;
}

const DeclareCardsModal = ({ isOpen, cardCount, onConfirm, onCancel }: DeclareCardsModalProps) => {
  const [selectedValue, setSelectedValue] = useState<string>('A');

  const cardValues = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

  const handleConfirm = () => {
    onConfirm(selectedValue);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4"
            onClick={onCancel}
          >
            {/* Modal */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full"
            >
              <h2 className="text-3xl font-bold text-white mb-6 text-center">
                Déclarez vos cartes
              </h2>

              <div className="mb-6 text-center">
                <p className="text-gray-300 text-lg mb-2">
                  Vous jouez <span className="font-bold text-yellow-400">{cardCount}</span> carte{cardCount > 1 ? 's' : ''}
                </p>
                <p className="text-gray-400 text-sm">
                  Choisissez la valeur que vous déclarez
                </p>
              </div>

              {/* Sélecteur de valeur */}
              <div className="mb-8">
                <label className="block text-gray-300 mb-3 font-semibold">
                  Valeur déclarée :
                </label>
                <div className="grid grid-cols-7 gap-2">
                  {cardValues.map((value) => (
                    <button
                      key={value}
                      onClick={() => setSelectedValue(value)}
                      className={`
                        py-3 px-2 rounded-lg font-bold text-lg transition-all
                        ${selectedValue === value
                          ? 'bg-yellow-500 text-gray-900 scale-110 shadow-lg'
                          : 'bg-gray-700 text-white hover:bg-gray-600'
                        }
                      `}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>

              {/* Résumé */}
              <div className="bg-gray-700 rounded-lg p-4 mb-6">
                <p className="text-center text-white text-xl">
                  Je déclare jouer <span className="font-bold text-yellow-400">{cardCount}</span>{' '}
                  <span className="font-bold text-yellow-400">{selectedValue}</span>
                  {cardCount > 1 ? 's' : ''}
                </p>
              </div>

              {/* Boutons */}
              <div className="flex gap-3">
                <button
                  onClick={onCancel}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  Confirmer
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default DeclareCardsModal;
