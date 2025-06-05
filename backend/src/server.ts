import express from 'express';
import { createServer, Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { Game } from './game';
import path from 'path';

const app = express();
const httpServer: HttpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173", // Vite's default port
    methods: ["GET", "POST"]
  }
});

const game = new Game();

// Serve static files from the frontend directory (workspace root)
app.use(express.static(path.join(__dirname, '..', '..', 'frontend')));

// Broadcast game state to all clients
setInterval(() => {
  const gameState = game.getState();
  // Convert players Map to an array for sending to client
  const playersArray = Array.from(gameState.players.values());
  io.emit('gameState', { ...gameState, players: playersArray });
}, 1000 / 60); // 60 FPS

app.use(cors());
app.use(express.json());

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  game.addPlayer(socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    game.removePlayer(socket.id);
  });

  socket.on('movePaddle', (direction: 'up' | 'down') => {
    game.movePaddle(socket.id, direction);
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 