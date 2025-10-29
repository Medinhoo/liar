import { useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { motion } from 'framer-motion';

const Home = () => {
  const { connected, createRoom, joinRoom, error, clearError } = useSocket();
  const [playerName, setPlayerName] = useState('');
  const [roomIdInput, setRoomIdInput] = useState('');
  const [mode, setMode] = useState<'menu' | 'create' | 'join'>('menu');

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim()) {
      createRoom(playerName.trim());
    }
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim() && roomIdInput.trim()) {
      joinRoom(roomIdInput.trim().toUpperCase(), playerName.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full"
      >
        {/* Logo et titre */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2">🃏 Menteur</h1>
          <p className="text-gray-400">Jeu de cartes multijoueur</p>
          <div className="mt-4">
            {connected ? (
              <span className="text-green-400 text-sm">● Connecté</span>
            ) : (
              <span className="text-red-400 text-sm">● Déconnecté</span>
            )}
          </div>
        </div>

        {/* Messages d'erreur */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500 text-white px-4 py-3 rounded-lg mb-4 flex items-center justify-between"
          >
            <span>{error}</span>
            <button
              onClick={clearError}
              className="ml-2 text-white hover:text-gray-200"
            >
              ✕
            </button>
          </motion.div>
        )}

        {/* Menu principal */}
        {mode === 'menu' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <button
              onClick={() => setMode('create')}
              disabled={!connected}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-4 px-6 rounded-lg transition-colors"
            >
              Créer une partie
            </button>
            <button
              onClick={() => setMode('join')}
              disabled={!connected}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-4 px-6 rounded-lg transition-colors"
            >
              Rejoindre une partie
            </button>
          </motion.div>
        )}

        {/* Formulaire de création */}
        {mode === 'create' && (
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={handleCreateRoom}
            className="space-y-4"
          >
            <div>
              <label className="block text-gray-300 mb-2 font-semibold">
                Votre nom
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Entrez votre nom"
                className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={20}
                required
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMode('menu')}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Retour
              </button>
              <button
                type="submit"
                disabled={!playerName.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Créer
              </button>
            </div>
          </motion.form>
        )}

        {/* Formulaire de jonction */}
        {mode === 'join' && (
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={handleJoinRoom}
            className="space-y-4"
          >
            <div>
              <label className="block text-gray-300 mb-2 font-semibold">
                Votre nom
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Entrez votre nom"
                className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                maxLength={20}
                required
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2 font-semibold">
                Code de la salle
              </label>
              <input
                type="text"
                value={roomIdInput}
                onChange={(e) => setRoomIdInput(e.target.value.toUpperCase())}
                placeholder="Ex: ABC123"
                className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 uppercase"
                maxLength={6}
                required
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMode('menu')}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Retour
              </button>
              <button
                type="submit"
                disabled={!playerName.trim() || !roomIdInput.trim()}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Rejoindre
              </button>
            </div>
          </motion.form>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>MVP - Version 1.0</p>
          <p className="mt-1">Maximum 4 joueurs par partie</p>
        </div>
      </motion.div>
    </div>
  );
};

export default Home;
