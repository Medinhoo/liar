/**
 * Génère un deck de 52 cartes (sans jokers)
 * Format: { id, suit, value, displayValue }
 */
function generateDeck() {
  const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
  const suitSymbols = {
    hearts: '♥',
    diamonds: '♦',
    clubs: '♣',
    spades: '♠'
  };
  const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const displayValues = {
    'A': 'As',
    'J': 'Valet',
    'Q': 'Dame',
    'K': 'Roi'
  };

  const deck = [];
  
  for (const suit of suits) {
    for (const value of values) {
      deck.push({
        id: `${suit}-${value}`,
        suit,
        value,
        displayValue: displayValues[value] || value,
        symbol: suitSymbols[suit]
      });
    }
  }

  return deck;
}

/**
 * Mélange un tableau (algorithme Fisher-Yates)
 */
function shuffleDeck(deck) {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Distribue les cartes équitablement entre les joueurs
 * Les cartes restantes sont mises de côté
 */
function distributeCards(deck, numberOfPlayers) {
  const cardsPerPlayer = Math.floor(deck.length / numberOfPlayers);
  const hands = [];

  for (let i = 0; i < numberOfPlayers; i++) {
    hands.push(deck.slice(i * cardsPerPlayer, (i + 1) * cardsPerPlayer));
  }

  return hands;
}

module.exports = {
  generateDeck,
  shuffleDeck,
  distributeCards
};
