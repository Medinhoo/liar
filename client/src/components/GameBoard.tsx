import { motion } from 'framer-motion';
import CardBack from './CardBack';
import type { GameState } from '../types/game';

interface GameBoardProps {
  gameState: GameState;
  currentPlayerId: string;
  onCallLiar: () => void;
}

const GameBoard = ({ gameState, currentPlayerId, onCallLiar }: GameBoardProps) => {
  // Le bouton MENTEUR est visible pour tous SAUF celui qui vient de jouer
  const canCallLiar = gameState.lastPlay && gameState.lastPlay.playerSocketId !== currentPlayerId;

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      {/* En-tête avec infos de la partie */}
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-white mb-2">
          Salle: {gameState.roomId}
        </h2>
        <p className="text-xl text-gray-300">
          Tour de: <span className="font-bold text-yellow-400">{gameState.currentPlayer}</span>
        </p>
      </div>

      {/* Liste des joueurs */}
      <div className="mb-8 flex gap-4 flex-wrap justify-center">
        {gameState.players.map((player, index) => (
          <div
            key={player.socketId}
            className={`
              px-6 py-3 rounded-lg font-semibold
              ${index === gameState.currentPlayerIndex 
                ? 'bg-yellow-500 text-gray-900' 
                : 'bg-gray-700 text-white'}
              ${player.socketId === currentPlayerId ? 'ring-2 ring-blue-400' : ''}
            `}
          >
            {player.name} {player.socketId === currentPlayerId && '(Vous)'}
            <span className="ml-2 text-sm">
              ({player.cardCount} cartes)
            </span>
          </div>
        ))}
      </div>

      {/* Zone centrale - Pile de cartes */}
      <div className="bg-green-800 rounded-2xl p-8 min-h-[300px] min-w-[400px] flex flex-col items-center justify-center shadow-2xl relative">
        <h3 className="text-xl font-bold text-white mb-4">
          Pile ({gameState.pileCount} cartes)
        </h3>
        
        <div className="relative flex items-center justify-center mb-4">
          {gameState.pileCount > 0 ? (
            <CardBack count={gameState.pileCount} />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-gray-400 text-lg"
            >
              Aucune carte dans la pile
            </motion.div>
          )}
        </div>

        {/* Dernière déclaration */}
        {gameState.lastPlay && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-700 rounded-lg p-4 text-center"
          >
            <p className="text-white text-lg">
              <span className="font-bold text-yellow-400">{gameState.lastPlay.playerName}</span> a joué
            </p>
            <p className="text-2xl font-bold text-yellow-400 mt-2">
              {gameState.lastPlay.cardCount}x la carte "{gameState.lastPlay.declaredValue}"
            </p>
          </motion.div>
        )}

        {/* Bouton MENTEUR */}
        {canCallLiar && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onCallLiar}
            className="absolute -bottom-6 bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-full shadow-2xl text-xl transition-colors"
          >
            🚨 MENTEUR !
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default GameBoard;
