// Events emitted from the server to the client
export enum ServerEvents {
  PLAYER_ASSIGNED = 'playerAssigned',
  GAME_READY = 'gameReady',
  GAME_STATE_UPDATE = 'gameStateUpdate',
}

// Events emitted from the client to the server
export enum ClientEvents {
  PADDLE_MOVE = 'movePaddle',
  START_GAME = 'startGame',
  RESTART_GAME = 'restartGame',
} 