# 🕹️ Multiplayer Pong Game — Technical Specification

## 📄 Overview
This is a real-time multiplayer Pong game with a full-stack implementation using **Node.js (TypeScript)** for the backend and **React (TypeScript)** for the frontend. Two players are automatically matched, and gameplay is synchronized via **Socket.IO** over WebSockets. All game logic is controlled by the server. The goal is a complete, responsive, and accurate real-time experience.

## 🎮 Gameplay Rules

- **Two players only per room** (no spectators or queueing).
- **First to 5 points wins.**
- When a player wins:
  - Display **“Player X wins!”** with the final score.
  - Show a **“Restart Game”** button for each player.
  - Game **restarts only if both players click restart**.
- If a player disconnects (including browser refresh):
  - Game ends immediately.
  - Remaining player sees: **"Other player disconnected. Game ended."**
- **No sound, no power-ups, no extras.**
- **All controls are keyboard-based, desktop only.**

## 🧠 Client-Server Model

- The **server is authoritative** for all game logic:
  - Ball movement
  - Collision detection
  - Scoring
- Clients send paddle movement inputs only.
- Server sends game state updates **every 16ms (60 FPS)**.

## 🕹️ Controls

- Player 1: `W` (up), `S` (down)  
- Player 2: `↑` (up), `↓` (down)  
- Paddle moves **step-by-step per press**; holding key triggers repeat events.
- Paddles are **constrained to the canvas area**.

## 🖼️ UI & Rendering

- Canvas size: `800x600`
- Paddle size: `10x100`
- Ball size: `10x10`
- Ball starts at 5px/tick and can accelerate slightly with paddle hits.
- All game objects are **white**; background is dark.
- Game is rendered via an **HTML `<canvas>`**, updated with `requestAnimationFrame()` and interpolated state.
- No text labels during gameplay; only scores shown at **top center**.
- Game over screen includes:
  - Winner message
  - Final score
  - Restart Game button

## 🧱 Backend Architecture

- **Node.js + TypeScript**
- **Express** HTTP server
- **Socket.IO** for real-time WebSocket communication
- Modular file structure:
  ```
  backend/
  ├── server.ts
  ├── roomManager.ts
  ├── gameLoop.ts
  ├── types.ts
  └── events.ts
  ```
- No persistence, no logging (unless error occurs)

## 💻 Frontend Architecture

- **React + TypeScript**
- **Functional components + hooks**
- **Zustand** for state management
- Modular file structure:
  ```
  frontend/
  ├── components/
  ├── hooks/
  ├── pages/
  ├── store/
  └── types/
  ```
- Separate local types (no shared types across client/server)
- Local-only development (not deployed yet)
- Manual connection via **landing screen with “Join Game” button**
- Waiting screen: **"Waiting for another player to join..."** + spinner

## 🔄 Communication Structure

### Game State sent by Server (every 16ms):
```ts
{
  ball: { x: number, y: number },
  paddles: {
    player1: { y: number },
    player2: { y: number }
  },
  score: { player1: number, player2: number },
  gameOver: boolean,
  winner?: 'player1' | 'player2'
}
```

## 🔌 Local Dev Environment

- **Frontend** served at `localhost:3000`
- **Backend** served at `localhost:3001`
- Use **CORS** or a proxy during development
- No deployment or persistent storage required