import { useEffect } from 'react'; // Removed useState for connection status, now managed by store/socket listeners
import './index.css';
import { initializeSocket } from './socket';
import useGameStore from './store/gameStore'; // Import the game store
import LandingPage from './pages/LandingPage';
import WaitingPage from './pages/WaitingPage';
import GamePage from './pages/GamePage';

function App() {
  const { phase } = useGameStore();

  useEffect(() => {
    // Initialize socket connection when the app starts
    initializeSocket();
  }, []);

  return (
    <div className="app">
      {phase === 'landing' && <LandingPage />}
      {phase === 'waiting' && <WaitingPage />}
      {phase === 'playing' && <GamePage />}
      {phase === 'gameOver' && <GamePage />} {/* Reuse GamePage for game over state */}
    </div>
  );
}

export default App;
