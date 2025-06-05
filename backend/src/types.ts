import { Socket } from 'socket.io';
import { Game } from './game';

export interface Player {
  id: string;
  paddleY: number;
  score: number;
}

export interface GameState {
  players: Map<string, Player>;
  ball: {
    x: number;
    y: number;
    velocityX: number;
    velocityY: number;
  };
  isPlaying: boolean;
  isGameOver: boolean;
  winnerId: string | null;
}

// Define the Room interface
export interface Room {
    id: string;
    players: Map<string, Socket>; // Map socketId to Socket
    game: Game; // Game instance for the room
} 