import { useEffect } from 'react'; // Keep useEffect for socket initialization
import './index.css';
import { initializeSocket } from './socket'; // Import socket initialization
import useGameStore from './store/gameStore'; // Import the game store
import LandingPage from './pages/LandingPage';
import WaitingPage from './pages/WaitingPage';
import GamePage from './pages/GamePage';
import WinPage from './pages/WinPage'; // Import the new WinPage component

function App() {
  const { phase, clientGameState } = useGameStore();

  useEffect(() => {
    // Initialize socket connection when the app mounts
    console.log('App.tsx: Initializing socket via useEffect'); // Add log for confirmation
    initializeSocket();

    // Optional: Disconnect socket on component unmount
    // return () => {
    //   disconnectSocket();
    // };
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <div className="app">
      {phase === 'landing' && <LandingPage />}
      {phase === 'waiting' && <WaitingPage />}
      {phase === 'playing' && <GamePage />}
      {phase === 'gameOver' && <WinPage winnerId={clientGameState?.winnerId ?? null} />} {/* Render WinPage when phase is 'gameOver' and pass winnerId */}
    </div>
  );
}

export default App;
