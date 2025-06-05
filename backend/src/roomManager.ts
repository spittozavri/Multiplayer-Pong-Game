import { Socket } from 'socket.io';
import { Room } from './types'; // Import Room interface
import { ServerEvents } from './events'; // Import ServerEvents
import { Game } from './game'; // Import Game class

// No need for PlayerRole enum in backend room management, use string literals
// import { PlayerRole } from './types'; 

export class RoomManager {
    private rooms: Map<string, Room>;
    private playerRoomMap: Map<string, string>; // Maps socket ID to room ID

    constructor() {
        this.rooms = new Map<string, Room>();
        this.playerRoomMap = new Map<string, string>();
    }

    // Find an available room or create a new one
    findOrCreateRoom(socket: Socket): Room {
        // Try to find an available room (less than 2 players)
        for (const room of this.rooms.values()) {
            if (room.players.size < 2) {
                console.log(`Found available room: ${room.id}`);
                return room;
            }
        }

        // If no available room, create a new one
        const roomId = `room-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        const newRoom: Room = { // Create a new Room object based on interface
          id: roomId,
          players: new Map<string, Socket>(), // Initialize players map
          game: new Game(), // Create a new Game instance for the room
        };
        this.rooms.set(roomId, newRoom);
        console.log(`Created new room: ${roomId}`);
        return newRoom;
    }

    // Add a player to a specific room
    addPlayerToRoom(socket: Socket, room: Room): void {
        if (room.players.size >= 2) {
            console.warn(`Attempted to add player ${socket.id} to full room ${room.id}`);
            // Optionally, handle this case, e.g., send a message to the client
            return;
        }

        room.players.set(socket.id, socket); // Add socket to room's players map
        this.playerRoomMap.set(socket.id, room.id); // Map socket ID to room ID
        socket.join(room.id); // Join Socket.IO room

        // Assign player role (Player 1 or Player 2 based on join order)
        const role = room.players.size === 1 ? 'player1' : 'player2'; // Use string literals for roles
        socket.data.roomId = room.id; // Store roomId on socket (optional but useful)
        socket.data.playerRole = role; // Store player role on socket (optional but useful)

        console.log(`Player ${socket.id} joined room ${room.id}. Total players in room: ${room.players.size}`);

        // Emit PLAYER_ASSIGNED to the newly connected player
        socket.emit(ServerEvents.PLAYER_ASSIGNED, { role, roomId: room.id });

        // Check if the room is now full (2 players) - GAME_READY emission handled in server.ts
        if (room.players.size === 2) {
             console.log(`Room ${room.id} is full. Ready for game start (event emitted in server.ts).`);
        }
    }

    // Remove a player from their room
    removePlayer(socketId: string): void {
        const roomId = this.playerRoomMap.get(socketId);
        if (roomId) {
            const room = this.rooms.get(roomId);
            if (room) {
                room.players.delete(socketId); // Remove player from room's players map
                this.playerRoomMap.delete(socketId); // Remove socket ID to room ID mapping
                // Note: Socket.IO automatically handles leaving the room on disconnect

                console.log(`Player ${socketId} left room ${room.id}. Remaining players: ${room.players.size}`);

                // If the room is empty, delete it and stop game
                if (room.players.size === 0) {
                    // Stop game loop if it exists (handled in server.ts cleanup)
                    // Room is now empty, safe to delete
                    this.rooms.delete(roomId);
                    console.log(`Room ${room.id} is now empty and deleted.`);
                } else if (room.game && room.game.getState().isPlaying) {
                     // If game was playing and now less than 2 players, stop the game
                     room.game.stopGame(); // Stop the game logic
                     console.log(`Game in room ${room.id} stopped due to player leaving.`);
                     // Stop the game loop (handled in server.ts cleanup)
                 }
                 // If one player remains and game was not playing, room stays, no game loop
            }
        } else {
             console.warn(`Attempted to remove player ${socketId} but they were not in a room.`);
        }
    }

    // Get the room a player is in
    getPlayerRoom(socketId: string): Room | undefined {
        const roomId = this.playerRoomMap.get(socketId);
        if (roomId) {
            return this.rooms.get(roomId);
        }
        return undefined;
    }

    // Get all rooms (for debugging or monitoring)
    getRooms(): Map<string, Room> {
        return this.rooms;
    }
} 