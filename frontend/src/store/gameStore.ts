import { create } from 'zustand';
import { GamePhase, PlayerRole } from '../types';
import type { ClientGameState } from '../types';

interface GameStoreState {
  phase: GamePhase;
  playerRole: PlayerRole;
  roomId: string | null;
  clientGameState: ClientGameState | null;
  localPlayerId: string | null;
  isGameReady: boolean;
  // We will add more state related to the game itself later (e.g., ball position, paddle positions, scores)
}

interface GameStoreActions {
  setPhase: (phase: GamePhase) => void;
  setPlayerRole: (role: PlayerRole) => void;
  setRoomId: (roomId: string | null) => void;
  setClientGameState: (gameState: ClientGameState | null) => void;
  setLocalPlayerId: (playerId: string | null) => void;
  setIsGameReady: (isReady: boolean) => void;
  reset: () => void;
}

const useGameStore = create<GameStoreState & GameStoreActions>((set) => ({
  // Initial state
  phase: GamePhase.LANDING,
  playerRole: PlayerRole.NONE,
  roomId: null,
  clientGameState: null,
  localPlayerId: null,
  isGameReady: false,

  // Actions
  setPhase: (phase) => set({ phase }),
  setPlayerRole: (playerRole) => set({ playerRole }),
  setRoomId: (roomId) => set({ roomId }),
  setClientGameState: (clientGameState) => set({ clientGameState }),
  setLocalPlayerId: (localPlayerId) => set({ localPlayerId }),
  setIsGameReady: (isGameReady) => set({ isGameReady }),
  reset: () => set({
    phase: GamePhase.LANDING,
    playerRole: PlayerRole.NONE,
    roomId: null,
    clientGameState: null,
    localPlayerId: null,
    isGameReady: false,
    // Reset other game state here later
  }),
}));

export default useGameStore; 