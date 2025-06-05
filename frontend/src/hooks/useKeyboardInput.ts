import { useEffect } from 'react';
import { getSocket } from '../socket';
import useGameStore from '../store/gameStore';
import { ClientEvents } from '../config/events'; // Import ClientEvents
import { PlayerRole } from '../types';

export const useKeyboardInput = () => {
    const { roomId, playerRole, phase } = useGameStore();

    useEffect(() => {
        const socket = getSocket();

        // Only add listeners if socket exists, game is playing, and not a spectator
        if (!socket || phase !== 'playing' || playerRole === PlayerRole.SPECTATOR) {
            // console.log('Keyboard input hook active, but conditions not met for listening.', { socket: !!socket, phase, playerRole }); // Log hook activation state
            return;
        }
        // console.log('Keyboard input hook active and listening for input.'); // Log when hook is actively listening

        const handleKeyDown = (event: KeyboardEvent) => {
            let direction: 'up' | 'down' | null = null;

            if (playerRole === PlayerRole.PLAYER_1) {
                // Player 1 (left paddle) uses W/S
                if (event.key === 'w' || event.key === 'W') {
                    direction = 'up';
                } else if (event.key === 's' || event.key === 'S') {
                    direction = 'down';
                }
            } else if (playerRole === PlayerRole.PLAYER_2) {
                // Player 2 (right paddle) uses Up/Down arrows
                if (event.key === 'ArrowUp') {
                    direction = 'up';
                    event.preventDefault(); // Prevent default page scroll
                } else if (event.key === 'ArrowDown') {
                    direction = 'down';
                    event.preventDefault(); // Prevent default page scroll
                }
            }

            if (direction && roomId) {
                // console.log(`Key pressed: ${event.key}, Detected direction: ${direction}`); // Log key press and direction
                // Emit paddle move event to the server
                socket.emit(ClientEvents.PADDLE_MOVE, { roomId, direction });
                // console.log(`Emitting ${ClientEvents.PADDLE_MOVE} event`, { roomId, direction }); // Log event emission
            }
        };

        // Add event listener to the window
        window.addEventListener('keydown', handleKeyDown);

        // Cleanup: Remove event listener when component unmounts or dependencies change
        return () => {
            // console.log('Removing keydown event listener.'); // Log cleanup
            window.removeEventListener('keydown', handleKeyDown);
        };

    }, [roomId, playerRole, phase]); // Re-run effect if roomId, playerRole, or phase changes
}; 