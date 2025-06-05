interface Player {
  id: string;
  paddleY: number;
  score: number;
}

interface GameState {
  players: Map<string, Player>;
  ball: {
    x: number;
    y: number;
    velocityX: number;
    velocityY: number;
  };
  isPlaying: boolean;
}

export class Game {
  private state: GameState;
  private readonly PADDLE_HEIGHT = 100;
  private readonly PADDLE_WIDTH = 20;
  private readonly PADDLE_SPEED = 5;
  private readonly BALL_SPEED = 5;
  private readonly BALL_SIZE = 10;
  private readonly CANVAS_WIDTH = 800;
  private readonly CANVAS_HEIGHT = 600;
  private gameLoop: NodeJS.Timeout | null = null;

  constructor() {
    this.state = {
      players: new Map(),
      ball: {
        x: this.CANVAS_WIDTH / 2,
        y: this.CANVAS_HEIGHT / 2,
        velocityX: this.BALL_SPEED,
        velocityY: this.BALL_SPEED
      },
      isPlaying: false
    };
  }

  addPlayer(id: string): void {
    this.state.players.set(id, {
      id,
      paddleY: this.CANVAS_HEIGHT / 2 - this.PADDLE_HEIGHT / 2,
      score: 0
    });

    // Start game if we have 2 players
    if (this.state.players.size === 2 && !this.state.isPlaying) {
      this.startGame();
    }
  }

  removePlayer(id: string): void {
    this.state.players.delete(id);
    if (this.state.players.size < 2) {
      this.stopGame();
    }
  }

  public startGame(): void {
    this.state.isPlaying = true;
    this.resetBall();
    this.gameLoop = setInterval(() => this.update(), 1000 / 60); // 60 FPS
  }

  private stopGame(): void {
    this.state.isPlaying = false;
    if (this.gameLoop) {
      clearInterval(this.gameLoop);
      this.gameLoop = null;
    }
  }

  private resetBall(): void {
    this.state.ball = {
      x: this.CANVAS_WIDTH / 2,
      y: this.CANVAS_HEIGHT / 2,
      velocityX: this.BALL_SPEED * (Math.random() > 0.5 ? 1 : -1),
      velocityY: this.BALL_SPEED * (Math.random() > 0.5 ? 1 : -1)
    };
  }

  private update(): void {
    if (!this.state.isPlaying) return;

    // Move ball
    this.state.ball.x += this.state.ball.velocityX;
    this.state.ball.y += this.state.ball.velocityY;

    // Wall collision (top and bottom)
    if (this.state.ball.y <= 0 || this.state.ball.y >= this.CANVAS_HEIGHT) {
      this.state.ball.velocityY *= -1;
    }

    // Paddle collision
    const players = Array.from(this.state.players.values());
    players.forEach(player => {
      const paddleLeft = player.id === players[0].id ? 0 : this.CANVAS_WIDTH - this.PADDLE_WIDTH;
      const paddleRight = paddleLeft + this.PADDLE_WIDTH;

      if (
        this.state.ball.x + this.BALL_SIZE >= paddleLeft &&
        this.state.ball.x <= paddleRight &&
        this.state.ball.y + this.BALL_SIZE >= player.paddleY &&
        this.state.ball.y <= player.paddleY + this.PADDLE_HEIGHT
      ) {
        this.state.ball.velocityX *= -1;
        // Add some randomness to the bounce
        this.state.ball.velocityY += (Math.random() - 0.5) * 2;
      }
    });

    // Score points
    if (this.state.ball.x <= 0) {
      players[1].score++;
      this.resetBall();
    } else if (this.state.ball.x >= this.CANVAS_WIDTH) {
      players[0].score++;
      this.resetBall();
    }
  }

  movePaddle(id: string, direction: 'up' | 'down'): void {
    const player = this.state.players.get(id);
    if (!player) return;

    if (direction === 'up') {
      player.paddleY = Math.max(0, player.paddleY - this.PADDLE_SPEED);
    } else {
      player.paddleY = Math.min(this.CANVAS_HEIGHT - this.PADDLE_HEIGHT, player.paddleY + this.PADDLE_SPEED);
    }
  }

  getState(): GameState {
    return this.state;
  }
} 