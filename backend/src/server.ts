import express from 'express';
import { createServer, Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import { Game } from './game';
import path from 'path';
import { RoomManager } from './roomManager';
import { ClientEvents, ServerEvents } from './events';

const app = express();
const httpServer: HttpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Allow all origins for now, refine later
    methods: ["GET", "POST"]
  }
});

const roomManager = new RoomManager();

// Store game loop intervals per room
const gameLoops = new Map<string, NodeJS.Timeout>();

// Serve static files from the frontend build directory
// Assumes frontend build output is in frontend/dist relative to the workspace root
app.use(express.static(path.join(__dirname, '..', '..', 'frontend', 'dist')));

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

io.on('connection', (socket: Socket) => {
  console.log('Client connected:', socket.id);

  // Find or create a room for the connecting player
  const room = roomManager.findOrCreateRoom(socket);
  // Add the player to the found or created room
  roomManager.addPlayerToRoom(socket, room);

  // After adding the player, check if the room is now full and emit GAME_READY
  if (room.players.size === 2) {
      console.log(`Room ${room.id} is now full. Emitting ${ServerEvents.GAME_READY} to the room.`); // Log emission
      io.to(room.id).emit(ServerEvents.GAME_READY, { roomId: room.id }); // Emit GAME_READY to all in the room
  }

  // --- Handle player events within the room ---

  // Handle paddle movement
  socket.on(ClientEvents.PADDLE_MOVE, (data: { roomId: string; direction: 'up' | 'down' }) => {
    const room = roomManager.getPlayerRoom(socket.id);
    if (room && room.game) {
      // console.log(`Received ${ClientEvents.PADDLE_MOVE} from ${socket.id} in room ${data.roomId} with direction: ${data.direction}`); // Removed debugging log
      room.game.movePaddle(socket.id, data.direction); // Pass socket.id and direction
    }
  });

  // Handle game start request
  socket.on(ClientEvents.START_GAME, () => {
      const room = roomManager.getPlayerRoom(socket.id);
      if (room && room.game) {
          // The startGame logic in Game class already checks if game is playable
          room.game.startGame(room.players);

          // Get and emit the initial game state immediately after starting
          const initialGameState = room.game.getState();
          const initialPlayersArray = Array.from(initialGameState.players.values());
          io.to(room.id).emit(ServerEvents.GAME_STATE_UPDATE, { ...initialGameState, players: initialPlayersArray });
           console.log(`Emitted initial GAME_STATE_UPDATE for room ${room.id} after startGame`);

          // If game starts and game loop is not running for this room, start it
          if (initialGameState.isPlaying && !gameLoops.has(room.id)) {
               const interval = setInterval(() => {
                  if (room.game) {
                      room.game.update();
                       // Convert players Map to an array for sending to client
                      const gameStateToSend = room.game.getState(); // Get the latest state
                      const playersArray = Array.from(gameStateToSend.players.values());
                      // Emit game state update to all clients in the room
                    
                      io.to(room.id).emit(ServerEvents.GAME_STATE_UPDATE, { ...gameStateToSend, players: playersArray });

                      // Stop the interval if the game is over
                      if (gameStateToSend.isGameOver) {
                          clearInterval(interval);
                          gameLoops.delete(room.id);
                           console.log(`Game loop for room ${room.id} stopped.`);
                      }
                  } else {
                      // Should not happen if gameLoop is running
                      clearInterval(gameLoops.get(room.id)!);
                      gameLoops.delete(room.id);
                       console.log(`Game loop for room ${room.id} cleared due to missing game instance.`);
                  }
              }, 1000 / 60);
              gameLoops.set(room.id, interval);
              console.log(`Game loop started for room ${room.id}`);
          }
      }
  });

  // Handle game restart request
  socket.on(ClientEvents.RESTART_GAME, (data: { roomId: string }) => {
    const room = roomManager.getPlayerRoom(socket.id);
    if (room && room.game) {
      console.log(`Received ${ClientEvents.RESTART_GAME} from ${socket.id} in room ${data.roomId}.`);
      // Stop the current game and reset state
      room.game.stopGame();

      // Start a new game with current players
      room.game.startGame(room.players);

      // Get and emit the initial state of the new game
      const initialGameState = room.game.getState();
      const initialPlayersArray = Array.from(initialGameState.players.values());
      io.to(room.id).emit(ServerEvents.GAME_STATE_UPDATE, { ...initialGameState, players: initialPlayersArray });
      console.log(`Emitted initial GAME_STATE_UPDATE for room ${room.id} after restart.`);

      // Ensure game loop is running if game started successfully
       if (initialGameState.isPlaying && !gameLoops.has(room.id)) {
               const interval = setInterval(() => {
                  if (room.game) {
                      room.game.update();
                       // Convert players Map to an array for sending to client
                      const gameStateToSend = room.game.getState(); // Get the latest state
                      const playersArray = Array.from(gameStateToSend.players.values());
                      // Emit game state update to all clients in the room
                    
                      io.to(room.id).emit(ServerEvents.GAME_STATE_UPDATE, { ...gameStateToSend, players: playersArray });

                      // Stop the interval if the game is over
                      if (gameStateToSend.isGameOver) {
                          clearInterval(interval);
                          gameLoops.delete(room.id);
                           console.log(`Game loop for room ${room.id} stopped.`);
                      }
                  } else {
                      // Should not happen if gameLoop is running
                      clearInterval(gameLoops.get(room.id)!);
                      gameLoops.delete(room.id);
                       console.log(`Game loop for room ${room.id} cleared due to missing game instance.`);
                  }
              }, 1000 / 60);
              gameLoops.set(room.id, interval);
              console.log(`Game loop started for room ${room.id} after restart.`);
          }
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);

    const room = roomManager.getPlayerRoom(socket.id);
    const roomId = room ? room.id : null;

    roomManager.removePlayer(socket.id); // Remove player from room

    // Clear game loop interval if the room becomes empty or has less than 2 players
    if (roomId && gameLoops.has(roomId)) {
        const updatedRoom = roomManager.getRooms().get(roomId); // Get updated room state
        // Check if the room now has less than 2 players OR if the game in that room is not playing/is over
        // (The game.stopGame() in roomManager on player leave sets isPlaying to false)
        if (!updatedRoom || updatedRoom.players.size < 2 || (updatedRoom.game && !updatedRoom.game.getState().isPlaying)) { 
             clearInterval(gameLoops.get(roomId)!);
             gameLoops.delete(roomId);
             console.log(`Game loop for room ${roomId} cleared on disconnect or game stop.`);
        }
    }
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 