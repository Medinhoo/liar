const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const gameManager = require('./gameManager');

const app = express();
const httpServer = createServer(app);

const isProduction = process.env.NODE_ENV === 'production';

// Configuration CORS
if (isProduction) {
  // En production, accepter toutes les origines (Render)
  app.use(cors());
} else {
  // En développement, limiter aux URLs locales
  app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174"]
  }));
}

app.use(express.json());

// Servir les fichiers statiques du client en production
if (isProduction) {
  app.use(express.static(path.join(__dirname, 'public')));
}

// Configuration Socket.IO avec CORS
const io = new Server(httpServer, {
  cors: {
    origin: isProduction ? "*" : ["http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST"]
  }
});

// Route de test
app.get('/health', (req, res) => {
  res.json({ status: 'ok', games: gameManager.games.size });
});

// En production, servir index.html pour toutes les autres routes (SPA)
if (isProduction) {
  app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
}

// Gestion des connexions Socket.IO
io.on('connection', (socket) => {
  console.log(`✅ Nouveau client connecté: ${socket.id}`);

  /**
   * Créer une nouvelle salle
   */
  socket.on('create_room', (data) => {
    const { playerName } = data;
    
    if (!playerName || playerName.trim() === '') {
      socket.emit('error', { message: 'Le nom du joueur est requis' });
      return;
    }

    try {
      const game = gameManager.createGame(socket.id, playerName);
      
      // Rejoindre la room Socket.IO
      socket.join(game.roomId);
      
      // Envoyer la confirmation au créateur
      socket.emit('room_created', {
        roomId: game.roomId,
        gameState: gameManager.getGameStateForPlayer(game.roomId, socket.id)
      });

      console.log(`🎮 Salle créée: ${game.roomId} par ${playerName}`);
    } catch (error) {
      console.error('Erreur lors de la création de la salle:', error);
      socket.emit('error', { message: 'Erreur lors de la création de la salle' });
    }
  });

  /**
   * Rejoindre une salle existante
   */
  socket.on('join_room', (data) => {
    const { roomId, playerName } = data;
    
    if (!roomId || !playerName || playerName.trim() === '') {
      socket.emit('error', { message: 'ID de salle et nom du joueur requis' });
      return;
    }

    try {
      const result = gameManager.joinGame(roomId, socket.id, playerName);
      
      if (!result.success) {
        socket.emit('error', { message: result.error });
        return;
      }

      // Rejoindre la room Socket.IO
      socket.join(roomId);
      
      // Notifier le joueur qui rejoint
      socket.emit('room_joined', {
        roomId,
        gameState: gameManager.getGameStateForPlayer(roomId, socket.id)
      });

      // Notifier tous les joueurs de la salle
      io.to(roomId).emit('player_joined', {
        playerName,
        gameState: gameManager.getGameStateForPlayer(roomId, socket.id)
      });

      console.log(`👥 ${playerName} a rejoint la salle ${roomId}`);
    } catch (error) {
      console.error('Erreur lors de la jonction à la salle:', error);
      socket.emit('error', { message: 'Erreur lors de la jonction à la salle' });
    }
  });

  /**
   * Démarrer la partie
   */
  socket.on('start_game', (data) => {
    const { roomId } = data;
    
    if (!roomId) {
      socket.emit('error', { message: 'ID de salle requis' });
      return;
    }

    try {
      const result = gameManager.startGame(roomId);
      
      if (!result.success) {
        socket.emit('error', { message: result.error });
        return;
      }

      // Notifier tous les joueurs que la partie commence
      const game = result.game;
      game.players.forEach(player => {
        io.to(player.socketId).emit('game_started', {
          gameState: gameManager.getGameStateForPlayer(roomId, player.socketId)
        });
      });

      console.log(`🎲 Partie démarrée dans la salle ${roomId}`);
    } catch (error) {
      console.error('Erreur lors du démarrage de la partie:', error);
      socket.emit('error', { message: 'Erreur lors du démarrage de la partie' });
    }
  });

  /**
   * Jouer plusieurs cartes avec déclaration
   */
  socket.on('play_cards', (data) => {
    const { roomId, cardIds, declaredValue } = data;
    
    if (!roomId || !cardIds || !declaredValue) {
      socket.emit('error', { message: 'Données manquantes' });
      return;
    }

    try {
      const result = gameManager.playCards(roomId, socket.id, cardIds, declaredValue);
      
      if (!result.success) {
        socket.emit('error', { message: result.error });
        return;
      }

      const game = result.game;
      
      // Notifier tous les joueurs des cartes jouées
      game.players.forEach(player => {
        io.to(player.socketId).emit('cards_played', {
          gameState: gameManager.getGameStateForPlayer(roomId, player.socketId)
        });
      });

      // Vérifier la victoire
      const victoryCheck = gameManager.checkVictory(roomId);
      if (victoryCheck && victoryCheck.hasWinner) {
        io.to(roomId).emit('game_won', {
          winnerName: victoryCheck.winnerName
        });
        console.log(`🏆 ${victoryCheck.winnerName} a gagné dans la salle ${roomId}`);
      }

      console.log(`🃏 ${cardIds.length} carte(s) jouée(s) dans la salle ${roomId}`);
    } catch (error) {
      console.error('Erreur lors du jeu des cartes:', error);
      socket.emit('error', { message: 'Erreur lors du jeu des cartes' });
    }
  });

  /**
   * Accuser de mentir
   */
  socket.on('call_liar', (data) => {
    const { roomId } = data;
    
    if (!roomId) {
      socket.emit('error', { message: 'ID de salle requis' });
      return;
    }

    try {
      const result = gameManager.callLiar(roomId, socket.id);
      
      if (!result.success) {
        socket.emit('error', { message: result.error });
        return;
      }

      const game = result.game;
      const accuserName = game.players.find(p => p.socketId === socket.id)?.name;

      // Notifier tous les joueurs de l'accusation
      io.to(roomId).emit('liar_called', {
        accuserName
      });

      // Attendre un peu pour l'effet dramatique, puis envoyer le résultat
      setTimeout(() => {
        game.players.forEach(player => {
          io.to(player.socketId).emit('liar_result', {
            wasLiar: result.result.wasLiar,
            revealedCards: result.result.revealedCards,
            declaredValue: result.result.declaredValue,
            loserName: result.result.loserName,
            winnerName: result.result.winnerName,
            pileCount: result.result.pileCount,
            gameState: gameManager.getGameStateForPlayer(roomId, player.socketId)
          });
        });

        // Vérifier la victoire
        const victoryCheck = gameManager.checkVictory(roomId);
        if (victoryCheck && victoryCheck.hasWinner) {
          io.to(roomId).emit('game_won', {
            winnerName: victoryCheck.winnerName
          });
          console.log(`🏆 ${victoryCheck.winnerName} a gagné dans la salle ${roomId}`);
        }
      }, 1000);

      console.log(`🚨 ${accuserName} a dit MENTEUR dans la salle ${roomId}`);
    } catch (error) {
      console.error('Erreur lors de l\'accusation:', error);
      socket.emit('error', { message: 'Erreur lors de l\'accusation' });
    }
  });

  /**
   * Jouer une carte (ancienne méthode, gardée pour compatibilité)
   */
  socket.on('play_card', (data) => {
    const { roomId, cardId } = data;
    
    if (!roomId || !cardId) {
      socket.emit('error', { message: 'ID de salle et ID de carte requis' });
      return;
    }

    try {
      const result = gameManager.playCard(roomId, socket.id, cardId);
      
      if (!result.success) {
        socket.emit('error', { message: result.error });
        return;
      }

      const game = result.game;
      
      // Notifier tous les joueurs de la carte jouée
      game.players.forEach(player => {
        io.to(player.socketId).emit('card_played', {
          playedCard: result.playedCard,
          playedBy: game.players.find(p => p.socketId === socket.id)?.name,
          gameState: gameManager.getGameStateForPlayer(roomId, player.socketId)
        });
      });

      // Notifier le changement de tour
      io.to(roomId).emit('turn_changed', {
        currentPlayerIndex: game.currentPlayerIndex,
        currentPlayer: game.players[game.currentPlayerIndex]?.name
      });

      console.log(`🃏 Carte jouée dans la salle ${roomId}`);
    } catch (error) {
      console.error('Erreur lors du jeu de la carte:', error);
      socket.emit('error', { message: 'Erreur lors du jeu de la carte' });
    }
  });

  /**
   * Déconnexion d'un joueur
   */
  socket.on('disconnect', () => {
    console.log(`❌ Client déconnecté: ${socket.id}`);
    
    const result = gameManager.removePlayer(socket.id);
    
    if (result) {
      if (result.roomDestroyed) {
        // Notifier tous les joueurs que la partie est terminée
        io.to(result.roomId).emit('game_ended', {
          message: 'Un joueur s\'est déconnecté. La partie est terminée.'
        });
        console.log(`🔚 Salle ${result.roomId} détruite`);
      } else {
        // Notifier les joueurs restants
        io.to(result.roomId).emit('player_left', {
          gameState: gameManager.getGameStateForPlayer(result.roomId, socket.id)
        });
      }
    }
  });
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📡 Socket.IO prêt à accepter des connexions`);
});
