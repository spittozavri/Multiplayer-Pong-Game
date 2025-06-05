import { getSocket } from '../socket';
import { ClientEvents } from '../config/events';
import useGameStore from '../store/gameStore';
import { PlayerRole } from '../types';

function WaitingPage() {
  const { playerRole, roomId, isGameReady } = useGameStore();

  const handleStartGame = () => {
    const socket = getSocket();
    if (socket && roomId) {
      console.log(`Attempting to emit ${ClientEvents.START_GAME} to room ${roomId}`);
      socket.emit(ClientEvents.START_GAME, { roomId });
    }
  };

  return (
    <div className="waiting-page">
      <h2>Waiting for opponent...</h2>
      <p>You are {playerRole === PlayerRole.PLAYER_1 ? 'Player 1' : 'Player 2'}</p>
      <p>Room ID: {roomId}</p>
      {isGameReady && (
        <button onClick={handleStartGame}>Start Game</button>
      )}
    </div>
  );
}

export default WaitingPage; 