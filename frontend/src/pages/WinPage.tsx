import useGameStore from '../store/gameStore';
import { getSocket } from '../socket';
import { ClientEvents } from '../config/events';

interface WinPageProps {
  winnerId: string | null;
}

function WinPage({ winnerId }: WinPageProps) {
  const { clientGameState, roomId } = useGameStore();

  const winnerRole = clientGameState?.players.find(p => p.id === winnerId)?.role;
  const winnerText = winnerRole === 'player1' ? 'Player 1 Wins!' : (winnerRole === 'player2' ? 'Player 2 Wins!' : 'Game Over');

  const handleRestartGame = () => {
    const socket = getSocket();
    if (socket && roomId) {
      // TODO: Define and emit restart game event to server
      console.log('Attempting to restart game in room:', roomId);
      socket.emit(ClientEvents.RESTART_GAME, { roomId }); // Assuming RESTART_GAME event exists
    }
  };

  return (
    <div className="win-page">
      <h2>{winnerText}</h2>
      <button onClick={handleRestartGame}>Restart Game</button>
    </div>
  );
}

export default WinPage; 