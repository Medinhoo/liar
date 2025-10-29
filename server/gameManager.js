const { generateDeck, shuffleDeck, distributeCards } = require('./utils/deck');

/**
 * Gestionnaire de jeu en mémoire
 * Stocke toutes les parties actives
 */
class GameManager {
  constructor() {
    this.games = new Map(); // roomId -> gameState
  }

  /**
   * Génère un ID de salle unique (6 caractères)
   */
  generateRoomId() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  /**
   * Crée une nouvelle partie
   */
  createGame(hostSocketId, hostName) {
    const roomId = this.generateRoomId();
    
    const gameState = {
      roomId,
      players: [
        {
          socketId: hostSocketId,
          name: hostName,
          hand: [],
          isHost: true
        }
      ],
      deck: [],
      playedCards: [],
      pile: [],
      lastPlay: null,
      currentPlayerIndex: 0,
      gameStarted: false,
      maxPlayers: 4
    };

    this.games.set(roomId, gameState);
    return gameState;
  }

  /**
   * Ajoute un joueur à une partie existante
   */
  joinGame(roomId, socketId, playerName) {
    const game = this.games.get(roomId);
    
    if (!game) {
      return { success: false, error: 'Salle introuvable' };
    }

    if (game.gameStarted) {
      return { success: false, error: 'La partie a déjà commencé' };
    }

    if (game.players.length >= game.maxPlayers) {
      return { success: false, error: 'La salle est pleine' };
    }

    // Vérifier si le joueur n'est pas déjà dans la partie
    if (game.players.some(p => p.socketId === socketId)) {
      return { success: false, error: 'Vous êtes déjà dans cette partie' };
    }

    game.players.push({
      socketId,
      name: playerName,
      hand: [],
      isHost: false
    });

    return { success: true, game };
  }

  /**
   * Démarre la partie et distribue les cartes
   */
  startGame(roomId) {
    const game = this.games.get(roomId);
    
    if (!game) {
      return { success: false, error: 'Salle introuvable' };
    }

    if (game.players.length < 2) {
      return { success: false, error: 'Il faut au moins 2 joueurs pour commencer' };
    }

    // Générer et mélanger le deck
    const deck = shuffleDeck(generateDeck());
    
    // Distribuer les cartes
    const hands = distributeCards(deck, game.players.length);
    
    // Assigner les mains aux joueurs
    game.players.forEach((player, index) => {
      player.hand = hands[index];
    });

    game.deck = deck;
    game.gameStarted = true;
    game.currentPlayerIndex = 0;

    return { success: true, game };
  }

  /**
   * Joue plusieurs cartes avec déclaration
   */
  playCards(roomId, socketId, cardIds, declaredValue) {
    const game = this.games.get(roomId);
    
    if (!game) {
      return { success: false, error: 'Salle introuvable' };
    }

    if (!game.gameStarted) {
      return { success: false, error: 'La partie n\'a pas encore commencé' };
    }

    // Trouver le joueur
    const playerIndex = game.players.findIndex(p => p.socketId === socketId);
    
    if (playerIndex === -1) {
      return { success: false, error: 'Joueur introuvable' };
    }

    // Vérifier que c'est bien le tour du joueur
    if (playerIndex !== game.currentPlayerIndex) {
      return { success: false, error: 'Ce n\'est pas votre tour' };
    }

    const player = game.players[playerIndex];
    
    // Vérifier que le joueur a toutes les cartes
    const cards = [];
    for (const cardId of cardIds) {
      const cardIndex = player.hand.findIndex(card => card.id === cardId);
      if (cardIndex === -1) {
        return { success: false, error: 'Carte introuvable dans votre main' };
      }
      cards.push(player.hand[cardIndex]);
    }

    // Retirer les cartes de la main
    for (const cardId of cardIds) {
      const cardIndex = player.hand.findIndex(card => card.id === cardId);
      player.hand.splice(cardIndex, 1);
    }

    // Ajouter les cartes à la pile
    game.pile.push(...cards);

    // Stocker le dernier coup
    game.lastPlay = {
      playerName: player.name,
      playerSocketId: socketId,
      declaredValue,
      cards: cards,
      timestamp: new Date()
    };

    // Passer au joueur suivant
    game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.players.length;

    return { success: true, game };
  }

  /**
   * Accuser le joueur précédent de mentir
   */
  callLiar(roomId, accuserSocketId) {
    const game = this.games.get(roomId);
    
    if (!game) {
      return { success: false, error: 'Salle introuvable' };
    }

    if (!game.lastPlay) {
      return { success: false, error: 'Aucun coup à contester' };
    }

    // Vérifier que l'accusateur n'est pas le joueur qui vient de jouer
    if (accuserSocketId === game.lastPlay.playerSocketId) {
      return { success: false, error: 'Vous ne pouvez pas contester votre propre coup' };
    }

    const accuser = game.players.find(p => p.socketId === accuserSocketId);
    if (!accuser) {
      return { success: false, error: 'Accusateur introuvable' };
    }

    // Vérifier si le joueur a menti
    const wasLiar = game.lastPlay.cards.some(card => card.value !== game.lastPlay.declaredValue);

    let loser, winner;
    
    if (wasLiar) {
      // Le joueur a menti, il récupère la pile
      loser = game.players.find(p => p.socketId === game.lastPlay.playerSocketId);
      winner = accuser;
      loser.hand.push(...game.pile);
      
      // C'est le tour de l'accusateur
      game.currentPlayerIndex = game.players.findIndex(p => p.socketId === accuserSocketId);
    } else {
      // Le joueur n'a pas menti, l'accusateur récupère la pile
      loser = accuser;
      winner = game.players.find(p => p.socketId === game.lastPlay.playerSocketId);
      accuser.hand.push(...game.pile);
      
      // Le tour continue normalement (déjà passé au suivant)
    }

    const result = {
      wasLiar,
      revealedCards: game.lastPlay.cards,
      declaredValue: game.lastPlay.declaredValue,
      loserName: loser.name,
      winnerName: winner.name,
      pileCount: game.pile.length
    };

    // Vider la pile et lastPlay
    game.pile = [];
    game.lastPlay = null;

    return { success: true, game, result };
  }

  /**
   * Vérifie si un joueur a gagné
   */
  checkVictory(roomId) {
    const game = this.games.get(roomId);
    
    if (!game) {
      return null;
    }

    const winner = game.players.find(player => player.hand.length === 0);
    
    if (winner) {
      return {
        hasWinner: true,
        winnerName: winner.name,
        winnerSocketId: winner.socketId
      };
    }

    return { hasWinner: false };
  }

  /**
   * Joue une carte (ancienne méthode, gardée pour compatibilité)
   */
  playCard(roomId, socketId, cardId) {
    const game = this.games.get(roomId);
    
    if (!game) {
      return { success: false, error: 'Salle introuvable' };
    }

    if (!game.gameStarted) {
      return { success: false, error: 'La partie n\'a pas encore commencé' };
    }

    // Trouver le joueur
    const playerIndex = game.players.findIndex(p => p.socketId === socketId);
    
    if (playerIndex === -1) {
      return { success: false, error: 'Joueur introuvable' };
    }

    // Vérifier que c'est bien le tour du joueur
    if (playerIndex !== game.currentPlayerIndex) {
      return { success: false, error: 'Ce n\'est pas votre tour' };
    }

    const player = game.players[playerIndex];
    
    // Trouver la carte dans la main du joueur
    const cardIndex = player.hand.findIndex(card => card.id === cardId);
    
    if (cardIndex === -1) {
      return { success: false, error: 'Carte introuvable dans votre main' };
    }

    // Retirer la carte de la main et l'ajouter à la pile
    const [playedCard] = player.hand.splice(cardIndex, 1);
    game.playedCards.push({
      card: playedCard,
      playedBy: player.name,
      playedBySocketId: socketId
    });

    // Passer au joueur suivant
    game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.players.length;

    return { success: true, game, playedCard };
  }

  /**
   * Retire un joueur d'une partie
   */
  removePlayer(socketId) {
    // Trouver la partie contenant ce joueur
    for (const [roomId, game] of this.games.entries()) {
      const playerIndex = game.players.findIndex(p => p.socketId === socketId);
      
      if (playerIndex !== -1) {
        // Si la partie a commencé ou si c'était l'hôte, détruire la partie
        if (game.gameStarted || game.players[playerIndex].isHost) {
          this.games.delete(roomId);
          return { roomDestroyed: true, roomId };
        }
        
        // Sinon, juste retirer le joueur
        game.players.splice(playerIndex, 1);
        return { roomDestroyed: false, roomId, game };
      }
    }

    return null;
  }

  /**
   * Récupère l'état d'une partie
   */
  getGame(roomId) {
    return this.games.get(roomId);
  }

  /**
   * Récupère l'état d'une partie pour un joueur spécifique
   * (masque les mains des autres joueurs)
   */
  getGameStateForPlayer(roomId, socketId) {
    const game = this.games.get(roomId);
    
    if (!game) {
      return null;
    }

    // Créer une copie de l'état du jeu
    const gameState = {
      roomId: game.roomId,
      players: game.players.map(player => ({
        name: player.name,
        socketId: player.socketId,
        isHost: player.isHost,
        cardCount: player.hand.length,
        // Montrer la main seulement pour le joueur actuel
        hand: player.socketId === socketId ? player.hand : []
      })),
      playedCards: game.playedCards,
      pileCount: game.pile.length,
      lastPlay: game.lastPlay ? {
        playerName: game.lastPlay.playerName,
        playerSocketId: game.lastPlay.playerSocketId,
        declaredValue: game.lastPlay.declaredValue,
        cardCount: game.lastPlay.cards.length
      } : null,
      currentPlayerIndex: game.currentPlayerIndex,
      gameStarted: game.gameStarted,
      currentPlayer: game.players[game.currentPlayerIndex]?.name
    };

    return gameState;
  }
}

module.exports = new GameManager();
