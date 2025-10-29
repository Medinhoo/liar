import { useState } from 'react';
import { useSocket } from '../context/SocketContext';
import GameBoard from '../components/GameBoard';
import PlayerHand from '../components/PlayerHand';
import DeclareCardsModal from '../components/DeclareCardsModal';
import LiarResultModal from '../components/LiarResultModal';
import { motion, AnimatePresence } from 'framer-motion';

const GameRoom = () => {
  const { 
    gameState, 
    socket, 
    startGame, 
    playCards, 
    callLiar,
    error, 
    clearError,
    liarResult,
    clearLiarResult,
    winner,
    clearWinner
  } = useSocket();

  const [showDeclareModal, setShowDeclareModal] = useState(false);
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);

  if (!gameState || !socket) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Chargement...</div>
      </div>
    );
  }

  const currentPlayer = gameState.players.find(p => p.socketId === socket.id);
  const isHost = currentPlayer?.isHost || false;
  const isMyTurn = gameState.players[gameState.currentPlayerIndex]?.socketId === socket.id;

  const handleStartGame = () => {
    startGame();
  };

  const handlePlayCards = (cardIds: string[]) => {
    setSelectedCardIds(cardIds);
    setShowDeclareModal(true);
  };

  const handleDeclareCards = (declaredValue: string) => {
    playCards(selectedCardIds, declaredValue);
    setShowDeclareModal(false);
    setSelectedCardIds([]);
  };

  const handleCancelDeclare = () => {
    setShowDeclareModal(false);
    setSelectedCardIds([]);
  };

  const handleCallLiar = () => {
    callLiar();
  };

  const handleCloseLiarResult = () => {
    clearLiarResult();
  };

  const handleCloseWinner = () => {
    clearWinner();
    // Optionnel: rediriger vers l'accueil ou réinitialiser
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col">
      {/* Messages d'erreur */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div className="bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-4">
            <span>{error}</span>
            <button
              onClick={clearError}
              className="text-white hover:text-gray-200 font-bold"
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}

      {/* Modal de déclaration */}
      <DeclareCardsModal
        isOpen={showDeclareModal}
        cardCount={selectedCardIds.length}
        onConfirm={handleDeclareCards}
        onCancel={handleCancelDeclare}
      />

      {/* Modal de résultat MENTEUR */}
      {liarResult && (
        <LiarResultModal
          isOpen={true}
          wasLiar={liarResult.wasLiar}
          revealedCards={liarResult.revealedCards}
          declaredValue={liarResult.declaredValue}
          loserName={liarResult.loserName}
          winnerName={liarResult.winnerName}
          pileCount={liarResult.pileCount}
          onClose={handleCloseLiarResult}
        />
      )}

      {/* Modal de victoire */}
      <AnimatePresence>
        {winner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl shadow-2xl p-12 max-w-md w-full text-center"
            >
              <div className="text-8xl mb-6">🏆</div>
              <h2 className="text-5xl font-bold text-white mb-4">
                Victoire !
              </h2>
              <p className="text-2xl text-white mb-8">
                <span className="font-bold">{winner}</span> a gagné la partie !
              </p>
              <button
                onClick={handleCloseWinner}
                className="bg-white text-orange-600 font-bold py-4 px-8 rounded-lg text-xl hover:bg-gray-100 transition-colors"
              >
                Fermer
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Salle d'attente */}
      {!gameState.gameStarted && (
        <div className="flex-1 flex items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-2xl w-full"
          >
            <h2 className="text-3xl font-bold text-white text-center mb-6">
              Salle d'attente
            </h2>
            
            <div className="bg-gray-700 rounded-lg p-6 mb-6">
              <p className="text-gray-300 text-center mb-2">Code de la salle:</p>
              <p className="text-4xl font-bold text-yellow-400 text-center tracking-wider">
                {gameState.roomId}
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-white mb-4">
                Joueurs ({gameState.players.length}/4)
              </h3>
              <div className="space-y-2">
                {gameState.players.map((player) => (
                  <div
                    key={player.socketId}
                    className={`
                      bg-gray-700 rounded-lg p-4 flex items-center justify-between
                      ${player.socketId === socket.id ? 'ring-2 ring-blue-400' : ''}
                    `}
                  >
                    <span className="text-white font-semibold">
                      {player.name}
                      {player.socketId === socket.id && ' (Vous)'}
                    </span>
                    {player.isHost && (
                      <span className="bg-yellow-500 text-gray-900 px-3 py-1 rounded-full text-sm font-bold">
                        Hôte
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {isHost && (
              <button
                onClick={handleStartGame}
                disabled={gameState.players.length < 2}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-4 px-6 rounded-lg transition-colors"
              >
                {gameState.players.length < 2
                  ? 'En attente de joueurs... (min. 2)'
                  : 'Démarrer la partie'}
              </button>
            )}

            {!isHost && (
              <div className="text-center text-gray-400">
                En attente que l'hôte démarre la partie...
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Interface de jeu */}
      {gameState.gameStarted && currentPlayer && (
        <>
          {/* Zone de jeu principale */}
          <GameBoard 
            gameState={gameState} 
            currentPlayerId={socket.id || ''} 
            onCallLiar={handleCallLiar}
          />

          {/* Main du joueur */}
          <div className="bg-gray-800 border-t-4 border-gray-700 p-6">
            <PlayerHand
              cards={currentPlayer.hand}
              onPlayCards={handlePlayCards}
              isMyTurn={isMyTurn}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default GameRoom;
