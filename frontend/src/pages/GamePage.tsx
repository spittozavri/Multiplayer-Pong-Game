import GameCanvas from '../components/GameCanvas';
import useGameStore from '../store/gameStore';
import { useKeyboardInput } from '../hooks/useKeyboardInput';

function GamePage() {
  const { clientGameState, localPlayerId, phase } = useGameStore();

  useKeyboardInput();

  const isGameOver = phase === 'gameOver';
  const winner = isGameOver && clientGameState?.winnerId ? 
    (clientGameState.winnerId === localPlayerId ? 'You Win!' : 'Opponent Wins!')
    : null;

  // Get the player's role
  const playerRole = clientGameState?.players.find(p => p.id === localPlayerId)?.role;
  const playerNumber = playerRole === 'player1' ? 'Player 1' : 'Player 2';

  return (
    <div className="game-page">
      <h2>{playerNumber}</h2>
      {isGameOver && winner && (
        <div className="game-over-message">
          <h3>{winner}</h3>
        </div>
      )}
      {clientGameState && !isGameOver && <GameCanvas />}
      {!isGameOver && clientGameState && (
        <div className="scores">
          {/* Scores are now drawn on the canvas, but could be here */}
        </div>
      )}
    </div>
  );
}

export default GamePage; 