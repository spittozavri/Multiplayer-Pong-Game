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
  console.log('Attempting to initialize socket connection...');
  // Get store actions outside of the event listeners to avoid stale closures
  const { setPlayerRole, setRoomId, setPhase, reset, setClientGameState, setLocalPlayerId, setIsGameReady } = useGameStore.getState(); // Get setIsGameReady action

  if (!socket) {
    socket = io(SOCKET_SERVER_URL);

    socket.on('connect', () => {
      console.log('Connected to server', socket?.id);
      setLocalPlayerId(socket?.id || null); // Set the local player ID on connect
      // Initial phase might transition based on player assignment
      // setPhase(GamePhase.WAITING); // Or similar initial phase
    });

    socket.on('disconnect', (reason) => {
      console.log('Disconnected from server:', reason);
      // Reset game state on disconnect
      reset();
       // Potentially handle reconnection attempts here
    });

    socket.on('connect_error', (err) => {
        console.error('Socket connection error:', err.message);
         // Handle error, maybe show a message to the user
        reset(); // Reset state on connection error
    });

    // Listen for backend events and update the store
    socket.on(ServerEvents.PLAYER_ASSIGNED, ({ role, roomId }: { role: PlayerRole, roomId: string }) => {
        // console.log(`Event: ${ServerEvents.PLAYER_ASSIGNED}, Role: ${role}, Room ID: ${roomId}`);
        setPlayerRole(role);
        setRoomId(roomId);
        setPhase(GamePhase.WAITING); // Transition to waiting phase after role assignment
        setIsGameReady(false); // Ensure game is not marked ready yet
    });

    socket.on(ServerEvents.GAME_READY, ({ roomId }: { roomId: string }) => {
         console.log(`Event: ${ServerEvents.GAME_READY} received for Room ID: ${roomId}`);
        // When game is ready (2 players in room), set isGameReady to true
        setIsGameReady(true);
        // The phase might remain WAITING until the game actually starts via button click and first state update.
    });

    // Listen for game state updates
    socket.on(ServerEvents.GAME_STATE_UPDATE, (gameState: ClientGameState) => {
        // console.log('Event: GAME_STATE_UPDATE received', gameState); // Temporarily commented out to reduce console spam
        setClientGameState(gameState);
        // If the game is ongoing, ensure the phase is PLAYING and set isGameReady to false
        if (gameState.isPlaying) {
             // console.log('GAME_STATE_UPDATE indicates game is playing, setting phase to PLAYING'); // Temporarily commented out
             setPhase(GamePhase.PLAYING);
             setIsGameReady(false); // Game is playing, hide start button
        } else if (gameState.isGameOver) {
             // console.log('GAME_STATE_UPDATE indicates game is over, setting phase to GAME_OVER'); // Temporarily commented out
            setPhase(GamePhase.GAME_OVER);
             setIsGameReady(false); // Game is over, start/play again button will be handled by GAME_OVER phase/component
        } else {
            // Game is not playing and not over (e.g., after game ready but before start click)
            // The phase should likely be WAITING, and isGameReady should be true if gameReady was received.
            // No explicit phase change needed here unless logic dictates otherwise.
             // console.log('GAME_STATE_UPDATE indicates game is not playing and not over'); // Temporarily commented out
        }
    });

  }
  return socket;
};

export const getSocket = (): Socket | null => {
    return socket;
};

export const disconnectSocket = (): void => {
    if (socket) {
        socket.disconnect();
        socket = null;
        // State reset will happen on the 'disconnect' event listener
    }
}; 