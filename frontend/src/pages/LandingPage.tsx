import { initializeSocket } from '../socket';

function LandingPage() {
  const handleJoinGame = () => {
    initializeSocket();
  };

  return (
    <div className="landing-page">
      <h1>Multiplayer Pong</h1>
      <button onClick={handleJoinGame}>Join Game</button>
    </div>
  );
}

export default LandingPage; 