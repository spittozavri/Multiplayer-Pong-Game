# Multiplayer Pong Game - Implementation TODO

## Phase 1: Setup & Basic Connection

### Backend (Prompt 1)
- [ ] Initialize Node.js/TypeScript project (`backend/`)
- [ ] Setup `package.json` with scripts (`build`, `start`, `dev`)
- [ ] Install dependencies (`express`, `socket.io`, `cors`, dev-deps)
- [ ] Configure `tsconfig.json`
- [ ] Implement `backend/src/server.ts`:
    - [ ] Express app setup
    - [ ] CORS configuration
    - [ ] HTTP server creation
    - [ ] Socket.IO server initialization
    - [ ] Basic `connection` and `disconnect` console logs
    - [ ] Server listens on `localhost:3001`

### Frontend (Prompt 2)
- [ ] Initialize React/TypeScript project (`frontend/` using Vite)
- [ ] Install dependencies (`socket.io-client`, `zustand`)
- [ ] Clean up Vite default files
- [ ] Create `frontend/src/socket.ts`:
    - [ ] Initialize Socket.IO client (manual connection)
    - [ ] Basic `connect` and `disconnect` console logs
- [ ] Modify `frontend/src/App.tsx`:
    - [ ] "Join Game" button
    - [ ] Button connects socket
    - [ ] Display connection status
- [ ] Basic `frontend/src/App.css`

## Phase 2: Room Management & Player Matching

### Backend (Prompt 3)
- [ ] Create `backend/src/types.ts` (`PlayerRole`, `Player`, `Room`)
- [ ] Create `backend/src/events.ts` (`ServerEvents.PLAYER_ASSIGNED`, `ServerEvents.GAME_READY`)
- [ ] Create `backend/src/roomManager.ts`:
    - [ ] `RoomManager` class/object
    - [ ] `rooms: Map<string, Room>`
    - [ ] `findOrCreateRoom()` logic
    - [ ] `addPlayerToRoom(socketId, room)` logic (assigns role)
    - [ ] `getPlayerRoom(socketId)` logic
    - [ ] `removePlayer(socketId)` logic (cleans up room if empty)
- [ ] Update `backend/src/server.ts`:
    - [ ] On `connection`:
        - [ ] Find/create room using `roomManager`
        - [ ] Add player to room, assign role
        - [ ] `socket.join(room.id)`
        - [ ] Store `roomId` and `playerRole` on `socket.data`
        - [ ] Emit `ServerEvents.PLAYER_ASSIGNED` to client
        - [ ] If room full, emit `ServerEvents.GAME_READY` to room
    - [ ] On `disconnect`:
        - [ ] Remove player using `roomManager`

### Frontend (Prompt 4)
- [ ] Create `frontend/src/types/index.ts` (`GamePhase`, `PlayerRole`)
- [ ] Create `frontend/src/store/gameStore.ts` (Zustand):
    - [ ] State: `phase`, `playerRole`, `roomId`
    - [ ] Actions: `setPhase`, `setPlayerRole`, `setRoomId`, `reset`
- [ ] Update `frontend/src/socket.ts` (`initializeSocketEventListeners`):
    - [ ] Listen for `player_assigned`: update store (`playerRole`, `roomId`), set `phase` to 'waiting'
    - [ ] Listen for `game_ready`: update store, set `phase` to 'playing' (placeholder)
    - [ ] On `disconnect`: call `store.reset()`
- [ ] Create `frontend/src/pages/LandingPage.tsx` (or use App.tsx)
- [ ] Create `frontend/src/pages/WaitingPage.tsx`
    - [ ] Display "Waiting..." message and player role
    - [ ] Basic spinner
- [ ] Create `frontend/src/pages/GamePage.tsx` (placeholder)
- [ ] Update `frontend/src/App.tsx`:
    - [ ] Initialize socket event listeners (`useEffect`)
    - [ ] Conditional rendering based on `gameStore.phase` (Landing, Waiting, Game)

## Phase 3: Core Game Rendering & State Sync

### Backend (Prompt 5)
- [ ] Update `backend/src/types.ts`:
    - [ ] `Ball`, `Paddle`, `GameState` interfaces
    - [ ] Add `game?: Game` to `Room` interface
- [ ] Create `backend/src/gameLogic/constants.ts` (CANVAS_*, PADDLE_*, BALL_*, INITIAL_BALL_SPEED, PADDLE_X positions)
- [ ] Create `backend/src/gameLogic/gameLoop.ts`:
    - [ ] `Game` class
    - [ ] `state: GameState`
    - [ ] `constructor()` calls `resetGame()`
    - [ ] `resetGame()`: initializes ball, paddles, score, gameOver status
    - [ ] `getState()`: returns current game state
    - [ ] `update()`: basic ball movement, top/bottom wall bounce (temporary L/R reset)
- [ ] Update `backend/src/roomManager.ts`:
    - [ ] When room is full (`game_ready`): create `new Game()` instance for the room
    - [ ] Handle `room.game` cleanup when player leaves/room deleted
- [ ] Update `backend/src/server.ts`:
    - [ ] Add `ServerEvents.GAME_STATE_UPDATE` to `events.ts`
    - [ ] `gameLoops: Map<string, NodeJS.Timeout>`
    - [ ] When `GAME_READY` and game instance exists:
        - [ ] Start `setInterval` for the room (16ms)
        - [ ] In interval: call `room.game.update()`, emit `GAME_STATE_UPDATE` with `room.game.getState()` to room
    - [ ] On `disconnect`: clear interval for the room if player was last or game ends

### Frontend (Prompt 6)
- [ ] Create `frontend/src/config/constants.ts` (mirroring relevant backend constants)
- [ ] Update `frontend/src/types/index.ts`:
    - [ ] `BallState`, `PaddleState`, `ClientGameState` (subset of backend's `GameState`)
- [ ] Update `frontend/src/store/gameStore.ts`:
    - [ ] Add `clientGameState: ClientGameState | null`
    - [ ] Add `setClientGameState` action
    - [ ] `reset()` clears `clientGameState`
- [ ] Update `frontend/src/socket.ts` (`initializeSocketEventListeners`):
    - [ ] Listen for `game_state_update`: call `setClientGameState`
- [ ] Create `frontend/src/components/GameCanvas.tsx`:
    - [ ] `canvasRef`
    - [ ] Get `clientGameState` from store
    - [ ] `useEffect` with `requestAnimationFrame` loop for drawing:
        - [ ] `drawGame(ctx, state)` function:
            - [ ] Clear canvas (dark background)
            - [ ] Draw paddles (white)
            - [ ] Draw ball (white)
            - [ ] Draw scores (top center)
    - [ ] Render `<canvas>` element
- [ ] Update `frontend/src/pages/GamePage.tsx`:
    - [ ] Render `<GameCanvas />`

## Phase 4: Player Controls & Movement

### Frontend (Prompt 7)
- [ ] Create `frontend/src/config/clientEvents.ts` (`ClientSocketEvents.PADDLE_MOVE`)
- [ ] Create `frontend/src/hooks/useKeyboardInput.ts`:
    - [ ] Get `playerRole`, `gamePhase` from store
    - [ ] `useEffect` for `keydown` event listener on `window`
    - [ ] Handler checks `gamePhase`, `playerRole`, `event.key`
    - [ ] Emits `ClientSocketEvents.PADDLE_MOVE` with `{ direction: 'up' | 'down' }`
- [ ] Integrate `useKeyboardInput()` in `frontend/src/pages/GamePage.tsx`

### Backend (Prompt 7)
- [ ] Add `ClientEvents.PADDLE_MOVE` to `backend/src/events.ts`
- [ ] Update `backend/src/gameLogic/gameLoop.ts` (`Game` class):
    - [ ] Add `movePaddle(role: PlayerRole, direction: 'up' | 'down')` method:
        - [ ] Updates correct paddle `y` position
        - [ ] Constrains paddle within canvas bounds (using `PADDLE_SPEED` from constants)
- [ ] Update `backend/src/server.ts`:
    - [ ] Listen for `ClientEvents.PADDLE_MOVE`:
        - [ ] Get `room`, `game`, `playerRole`
        - [ ] If valid, call `room.game.movePaddle()`

## Phase 5: Ball Physics & Scoring

### Backend (Prompt 8)
- [ ] Update `backend/src/gameLogic/constants.ts`:
    - [ ] Add `MAX_BALL_SPEED_X`
- [ ] Update `backend/src/gameLogic/gameLoop.ts` (`Game` class `update()`):
    - [ ] Refine initial ball velocity in `resetGame()` (if needed, ensure non-zero, varied)
    - [ ] Ball movement (`x += vx`, `y += vy`)
    - [ ] Top/bottom wall collision (reflect `vy`, correct position)
    - [ ] Player 1 (left) paddle collision:
        - [ ] Check bounds, ball moving towards paddle
        - [ ] Reflect `vx`, slightly increase speed (up to `MAX_BALL_SPEED_X`)
        - [ ] Correct ball position to avoid sticking
    - [ ] Player 2 (right) paddle collision (similar logic)

### Backend (Prompt 9)
- [ ] Update `backend/src/gameLogic/constants.ts`:
    - [ ] Add `WIN_SCORE = 5`
- [ ] Update `backend/src/gameLogic/gameLoop.ts` (`Game` class):
    - [ ] In `update()`:
        - [ ] If `gameOver`, return
        - [ ] Check if ball passes left wall (P2 scores)
        - [ ] Check if ball passes right wall (P1 scores)
        - [ ] On score, call `checkWinAndReset()`
    - [ ] Add `checkWinAndReset(scoredByPlayer1: boolean)` method:
        - [ ] Check if `score.player1` or `score.player2` >= `WIN_SCORE`
        - [ ] If win, set `gameOver = true`, `winner`
        - [ ] Else (if not game over), call `resetBall()`
    - [ ] Add `resetBall(scoredByPlayer1: boolean)` method:
        - [ ] Reset ball position to center
        - [ ] Reset ball speed to `INITIAL_BALL_SPEED`
        - [ ] Set `vx` to serve towards player who conceded
        - [ ] Randomize `vy`
    - [ ] Update `resetGame()`:
        - [ ] Reset scores, `gameOver`, `winner`
        - [ ] Call `resetBall()` with random initial server
        - [ ] Reset paddle positions

## Phase 6: Game Over & Restart

### Frontend (Prompt 10)
- [ ] Update `frontend/src/store/gameStore.ts`:
    - [ ] Add `localPlayerRequestedRestart: boolean`, `setLocalPlayerRequestedRestart`
    - [ ] In `setClientGameState` (or derived logic):
        - [ ] If `clientGameState.gameOver` is true, set `phase` to `'gameOver'`
        - [ ] If `clientGameState.gameOver` becomes false (game restarted), set `phase` to `'playing'`, `localPlayerRequestedRestart` to `false`
- [ ] Add `REQUEST_RESTART` to `frontend/src/config/clientEvents.ts`
- [ ] Create `frontend/src/components/GameOverScreen.tsx`:
    - [ ] Get `clientGameState`, `localPlayerRequestedRestart` from store
    - [ ] Display winner message, final score
    - [ ] "Restart Game" button:
        - [ ] `onClick`: emit `REQUEST_RESTART`, `setLocalPlayerRequestedRestart(true)`
        - [ ] `disabled` and text changes if `localPlayerRequestedRestart`
- [ ] Update `frontend/src/pages/GamePage.tsx`:
    - [ ] Conditionally render `<GameOverScreen />` if `clientGameState?.gameOver`

### Backend (Prompt 11)
- [ ] Update `backend/src/types.ts` (`Room` interface):
    - [ ] Add `player1RestartRequested?: boolean`, `player2RestartRequested?: boolean`
- [ ] Update `backend/src/roomManager.ts`:
    - [ ] Initialize/reset restart flags for rooms
- [ ] Update `backend/src/events.ts`: Ensure `ClientEvents.REQUEST_RESTART` exists
- [ ] Update `backend/src/server.ts` (Socket Connection Handler):
    - [ ] Listen for `ClientEvents.REQUEST_RESTART`:
        - [ ] Get `room`, `playerRole`
        - [ ] If game is over, set appropriate `room.playerXRestartRequested = true`
        - [ ] If both `player1RestartRequested` and `player2RestartRequested`:
            - [ ] Call `room.game.resetGame()`
            - [ ] Reset `room.playerXRestartRequested` flags to `false`

## Phase 7: Disconnection Handling

### Backend (Prompt 12)
- [ ] Add `PLAYER_DISCONNECTED` to `backend/src/events.ts` (`ServerEvents`)
- [ ] Update `backend/src/server.ts` (Disconnect Handler):
    - [ ] Get `roomId`, `disconnectedPlayerRole`
    - [ ] Call `roomManager.removePlayer()`
    - [ ] If `roomId`:
        - [ ] Clear game loop interval for the room, remove from `gameLoops` map
        - [ ] Get `room` from `roomManager` (if it still exists)
        - [ ] Emit `ServerEvents.PLAYER_DISCONNECTED` to remaining players in the room (pass `disconnectedPlayerRole`)
        - [ ] Ensure `room.game` instance is cleaned up (either here or in `roomManager`)
- [ ] Modify `backend/src/roomManager.ts` (`removePlayer`):
    - [ ] Ensure `room.game` is cleared/deleted if the room becomes empty or game should end due to disconnect

### Frontend (Prompt 12)
- [ ] Update `frontend/src/store/gameStore.ts`:
    - [ ] Add `disconnectMessage: string | null`, `setDisconnectMessage`
    - [ ] `reset()` clears `disconnectMessage`
    - [ ] In `setClientGameState` or effect: if `disconnectMessage` is set, ensure `phase` is `'gameOver'`
- [ ] Update `frontend/src/socket.ts` (`initializeSocketEventListeners`):
    - [ ] Listen for `PLAYER_DISCONNECTED`:
        - [ ] Call `setDisconnectMessage("Other player disconnected. Game ended.")`
        - [ ] Set `phase` to `'gameOver'`
- [ ] Update `frontend/src/components/GameOverScreen.tsx`:
    - [ ] Get `disconnectMessage` from store
    - [ ] If `disconnectMessage` present, display it (instead of/prioritizing over winner/score)
    - [ ] Adjust "Restart" button visibility/text if game ended by disconnect

## Phase 8: Final Review (Prompt 13 - Conceptual)
- [ ] Review all implemented parts for adherence to spec
- [ ] Check file structures
- [ ] Verify client-server model (server authority)
- [ ] Confirm all gameplay rules are met
- [ ] Check UI & Rendering details
- [ ] Ensure state management is correct
- [ ] Confirm no shared types violation
- [ ] Perform end-to-end testing of all features