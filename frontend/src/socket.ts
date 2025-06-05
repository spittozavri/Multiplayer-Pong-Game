import { io, Socket } from 'socket.io-client';
import useGameStore from './store/gameStore'; // Import the Zustand store
import { ServerEvents } from './config/events'; // Import from frontend events file
import { GamePhase } from './types'; // Import GamePhase as value
import type { PlayerRole, ClientGameState } from './types'; // Use type-only imports for types

// Replace with your backend server URL
const SOCKET_SERVER_URL = 'http://localhost:3000';

// Use a singleton pattern for the socket connection
let socket: Socket | null = null;

export const initializeSocket = (): Socket => {
  console.log('Initializing socket connection...');
  
  if (socket) {
    console.log('Socket already exists, disconnecting old connection...');
    socket.disconnect();
    socket = null;
  }

  const { setPlayerRole, setRoomId, setPhase, reset, setClientGameState, setLocalPlayerId, setIsGameReady } = useGameStore.getState();

  socket = io(SOCKET_SERVER_URL, {
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000
  });

  // Log that event listeners are being set up
  console.log('Setting up socket event listeners...');

  socket.on('connect', () => {
    console.log('Socket connected successfully. Socket ID:', socket?.id);
    setLocalPlayerId(socket?.id || null);
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected. Reason:', reason);
    reset();
  });

  socket.on('connect_error', (err) => {
    console.error('Socket connection error:', err.message);
    reset();
  });

  socket.on(ServerEvents.PLAYER_ASSIGNED, ({ role, roomId }: { role: PlayerRole, roomId: string }) => {
    console.log(`Player assigned - Role: ${role}, Room: ${roomId}`);
    setPlayerRole(role);
    setRoomId(roomId);
    setPhase(GamePhase.WAITING);
    setIsGameReady(false);
  });

  socket.on(ServerEvents.GAME_READY, ({ roomId }: { roomId: string }) => {
    console.log(`Game ready in room: ${roomId}`);
    setIsGameReady(true);
  });

  socket.on(ServerEvents.GAME_STATE_UPDATE, (gameState: ClientGameState) => {
    console.log('Game state update received:', {
      ball: { x: gameState.ball.x.toFixed(2), y: gameState.ball.y.toFixed(2) },
      isPlaying: gameState.isPlaying,
      isGameOver: gameState.isGameOver,
      players: gameState.players.map(p => ({ id: p.id, role: p.role, score: p.score }))
    });
    
    setClientGameState(gameState);
    
    if (gameState.isPlaying) {
      setPhase(GamePhase.PLAYING);
      setIsGameReady(false);
    } else if (gameState.isGameOver) {
      setPhase(GamePhase.GAME_OVER);
      setIsGameReady(false);
    }
  });

  return socket;
};

export const getSocket = (): Socket | null => {
    return socket;
};

export const disconnectSocket = (): void => {
    if (socket) {
        console.log('Disconnecting socket...');
        socket.disconnect();
        socket = null;
    }
}; 