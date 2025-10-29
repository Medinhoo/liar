/**
 * Types pour le jeu Menteur
 */

export interface Card {
  id: string;
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  value: string;
  displayValue: string;
  symbol: string;
}

export interface Player {
  name: string;
  socketId: string;
  isHost: boolean;
  cardCount: number;
  hand: Card[];
}

export interface PlayedCard {
  card: Card;
  playedBy: string;
  playedBySocketId: string;
}

export interface LastPlay {
  playerName: string;
  playerSocketId: string;
  declaredValue: string;
  cardCount: number;
}

export interface GameState {
  roomId: string;
  players: Player[];
  playedCards: PlayedCard[];
  pileCount: number;
  lastPlay: LastPlay | null;
  currentPlayerIndex: number;
  gameStarted: boolean;
  currentPlayer?: string;
}

export interface LiarResult {
  wasLiar: boolean;
  revealedCards: Card[];
  declaredValue: string;
  loserName: string;
  winnerName: string;
  pileCount: number;
  gameState: GameState;
}

export interface SocketEvents {
  // Client -> Server
  create_room: (data: { playerName: string }) => void;
  join_room: (data: { roomId: string; playerName: string }) => void;
  start_game: (data: { roomId: string }) => void;
  play_card: (data: { roomId: string; cardId: string }) => void;
  play_cards: (data: { roomId: string; cardIds: string[]; declaredValue: string }) => void;
  call_liar: (data: { roomId: string }) => void;

  // Server -> Client
  room_created: (data: { roomId: string; gameState: GameState }) => void;
  room_joined: (data: { roomId: string; gameState: GameState }) => void;
  player_joined: (data: { playerName: string; gameState: GameState }) => void;
  game_started: (data: { gameState: GameState }) => void;
  card_played: (data: { playedCard: Card; playedBy: string; gameState: GameState }) => void;
  cards_played: (data: { gameState: GameState }) => void;
  turn_changed: (data: { currentPlayerIndex: number; currentPlayer: string }) => void;
  liar_called: (data: { accuserName: string }) => void;
  liar_result: (data: LiarResult) => void;
  game_won: (data: { winnerName: string }) => void;
  player_left: (data: { gameState: GameState }) => void;
  game_ended: (data: { message: string }) => void;
  error: (data: { message: string }) => void;
}
