import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import type { GameState, LiarResult } from '../types/game';

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
  gameState: GameState | null;
  roomId: string | null;
  error: string | null;
  liarResult: LiarResult | null;
  winner: string | null;
  lastAccuserSocketId: string | null;
  createRoom: (playerName: string) => void;
  joinRoom: (roomId: string, playerName: string) => void;
  startGame: () => void;
  playCard: (cardId: string) => void;
  playCards: (cardIds: string[], declaredValue: string) => void;
  callLiar: () => void;
  clearError: () => void;
  clearLiarResult: () => void;
  clearWinner: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

// En production, utiliser l'URL actuelle (même domaine)
// En développement, utiliser localhost:3001
const SOCKET_URL = import.meta.env.PROD 
  ? window.location.origin 
  : 'http://localhost:3001';

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [liarResult, setLiarResult] = useState<LiarResult | null>(null);
  const [winner, setWinner] = useState<string | null>(null);
  const [lastAccuserSocketId, setLastAccuserSocketId] = useState<string | null>(null);

  useEffect(() => {
    // Créer la connexion Socket.IO
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    // Événements de connexion
    newSocket.on('connect', () => {
      console.log('✅ Connecté au serveur');
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Déconnecté du serveur');
      setConnected(false);
    });

    // Événements de jeu
    newSocket.on('room_created', (data) => {
      console.log('🎮 Salle créée:', data.roomId);
      setRoomId(data.roomId);
      setGameState(data.gameState);
      setError(null);
    });

    newSocket.on('room_joined', (data) => {
      console.log('👥 Salle rejointe:', data.roomId);
      setRoomId(data.roomId);
      setGameState(data.gameState);
      setError(null);
    });

    newSocket.on('player_joined', (data) => {
      console.log('👤 Nouveau joueur:', data.playerName);
      setGameState(data.gameState);
    });

    newSocket.on('game_started', (data) => {
      console.log('🎲 Partie démarrée');
      setGameState(data.gameState);
    });

    newSocket.on('card_played', (data) => {
      console.log('🃏 Carte jouée par', data.playedBy);
      setGameState(data.gameState);
    });

    newSocket.on('turn_changed', (data) => {
      console.log('🔄 Tour de', data.currentPlayer);
    });

    newSocket.on('player_left', (data) => {
      console.log('👋 Un joueur est parti');
      setGameState(data.gameState);
    });

    newSocket.on('cards_played', (data) => {
      console.log('🃏 Cartes jouées');
      setGameState(data.gameState);
    });

    newSocket.on('liar_called', (data) => {
      console.log('🚨 MENTEUR appelé par', data.accuserName);
      // Stocker l'ID du socket de l'accusateur (c'est nous qui avons appelé)
      setLastAccuserSocketId(newSocket.id || null);
    });

    newSocket.on('liar_result', (data) => {
      console.log('📊 Résultat:', data.wasLiar ? 'Menteur!' : 'Pas menteur!');
      setLiarResult(data);
      setGameState(data.gameState);
    });

    newSocket.on('game_won', (data) => {
      console.log('🏆 Victoire de', data.winnerName);
      setWinner(data.winnerName);
    });

    newSocket.on('game_ended', (data) => {
      console.log('🔚 Partie terminée:', data.message);
      setError(data.message);
      setGameState(null);
      setRoomId(null);
    });

    newSocket.on('error', (data) => {
      console.error('❌ Erreur:', data.message);
      setError(data.message);
    });

    // Nettoyage
    return () => {
      newSocket.close();
    };
  }, []);

  const createRoom = (playerName: string) => {
    if (socket && connected) {
      socket.emit('create_room', { playerName });
    }
  };

  const joinRoom = (roomId: string, playerName: string) => {
    if (socket && connected) {
      socket.emit('join_room', { roomId, playerName });
    }
  };

  const startGame = () => {
    if (socket && connected && roomId) {
      socket.emit('start_game', { roomId });
    }
  };

  const playCard = (cardId: string) => {
    if (socket && connected && roomId) {
      socket.emit('play_card', { roomId, cardId });
    }
  };

  const playCards = (cardIds: string[], declaredValue: string) => {
    if (socket && connected && roomId) {
      socket.emit('play_cards', { roomId, cardIds, declaredValue });
    }
  };

  const callLiar = () => {
    if (socket && connected && roomId) {
      socket.emit('call_liar', { roomId });
    }
  };

  const clearError = () => {
    setError(null);
  };

  const clearLiarResult = () => {
    setLiarResult(null);
  };

  const clearWinner = () => {
    setWinner(null);
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        connected,
        gameState,
        roomId,
        error,
        liarResult,
        winner,
        lastAccuserSocketId,
        createRoom,
        joinRoom,
        startGame,
        playCard,
        playCards,
        callLiar,
        clearError,
        clearLiarResult,
        clearWinner,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
