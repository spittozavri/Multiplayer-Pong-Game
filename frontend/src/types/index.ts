export enum GamePhase {
    LANDING = 'landing',
    WAITING = 'waiting',
    PLAYING = 'playing',
    GAME_OVER = 'gameOver',
}

export enum PlayerRole {
    PLAYER_1 = 'player1',
    PLAYER_2 = 'player2',
    SPECTATOR = 'spectator', // Although not explicitly in the todo, good to consider
    NONE = 'none', // For when a player hasn't been assigned a role yet
}

export type RoomId = string; // Assuming Room ID will be a string 

// Frontend specific game state types
export interface PaddleState {
    id: string; // Socket ID of the player controlling this paddle
    paddleY: number; // Y position of the paddle (top edge)
    score: number; // Player's score
}

// Match backend Player interface structure sent over the wire
export interface Player {
    id: string;
    paddleY: number;
    score: number;
    role: 'player1' | 'player2'; // Add role property to match backend
}

export interface BallState {
    x: number; // X position of the ball (center)
    y: number; // Y position of the ball (center)
}

// Client's representation of the overall game state received from the server
export interface ClientGameState {
    players: Player[]; // Array of Player objects (now includes role)
    ball: BallState;
    isPlaying: boolean;
    isGameOver: boolean;
    winnerId: string | null;
    // May include other relevant state like game time, etc. later
} 