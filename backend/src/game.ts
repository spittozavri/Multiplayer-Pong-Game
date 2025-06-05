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
  isGameOver: boolean;
  winnerId: string | null;
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
  private readonly WINNING_SCORE = 5;
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
      isPlaying: false,
      isGameOver: false,
      winnerId: null
    };
  }

  addPlayer(id: string): void {
    if (this.state.players.size >= 2) return;

    this.state.players.set(id, {
      id,
      paddleY: this.CANVAS_HEIGHT / 2 - this.PADDLE_HEIGHT / 2,
      score: 0
    });

    if (this.state.players.size === 2 && !this.state.isPlaying && !this.state.isGameOver) {
    }
  }

  removePlayer(id: string): void {
    this.state.players.delete(id);
    if (this.state.players.size < 2) {
      this.stopGame();
      this.state.isGameOver = false;
      this.state.winnerId = null;
      this.resetBall();
      this.state.players.forEach(player => player.score = 0);
    }
  }

  public startGame(): void {
    if (this.state.players.size === 2 && !this.state.isPlaying) {
        this.state.isPlaying = true;
        this.state.isGameOver = false;
        this.state.winnerId = null;
        this.state.players.forEach(player => player.score = 0);
        this.resetBall();
        if (this.gameLoop === null) {
            this.gameLoop = setInterval(() => this.update(), 1000 / 60);
        }
    }
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
    if (!this.state.isPlaying || this.state.isGameOver) return;

    this.state.ball.x += this.state.ball.velocityX;
    this.state.ball.y += this.state.ball.velocityY;

    if (this.state.ball.y <= 0 || this.state.ball.y + this.BALL_SIZE >= this.CANVAS_HEIGHT) {
      this.state.ball.velocityY *= -1;
    }

    const players = Array.from(this.state.players.values());
    players.forEach(player => {
      const paddleLeft = player.id === players[0].id ? 0 : this.CANVAS_WIDTH - this.PADDLE_WIDTH;
      const paddleRight = paddleLeft + this.PADDLE_WIDTH;
      const paddleTop = player.paddleY;
      const paddleBottom = player.paddleY + this.PADDLE_HEIGHT;

      if (
        this.state.ball.x + this.BALL_SIZE >= paddleLeft &&
        this.state.ball.x <= paddleRight &&
        this.state.ball.y + this.BALL_SIZE >= paddleTop &&
        this.state.ball.y <= paddleBottom
      ) {
        this.state.ball.velocityX *= -1;
        this.state.ball.velocityY += (Math.random() - 0.5) * 2;
        if (this.state.ball.velocityX < 0) {
            this.state.ball.x = paddleLeft - this.BALL_SIZE;
        } else {
            this.state.ball.x = paddleRight + this.BALL_SIZE;
        }
      }
    });

    if (this.state.ball.x <= 0) {
      const rightPlayer = players.find((p, index) => index === 1);
      if (rightPlayer) {
          rightPlayer.score++;
          this.checkGameOver();
          if (!this.state.isGameOver) {
            this.resetBall();
          }
      }
    } else if (this.state.ball.x + this.BALL_SIZE >= this.CANVAS_WIDTH) {
      const leftPlayer = players.find((p, index) => index === 0);
      if (leftPlayer) {
          leftPlayer.score++;
          this.checkGameOver();
           if (!this.state.isGameOver) {
            this.resetBall();
          }
      }
    }
  }

  private checkGameOver(): void {
      const players = Array.from(this.state.players.values());
      players.forEach(player => {
          if (player.score >= this.WINNING_SCORE) {
              this.state.isPlaying = false;
              this.state.isGameOver = true;
              this.state.winnerId = player.id;
              this.stopGame();
          }
      });
  }

  movePaddle(id: string, direction: 'up' | 'down'): void {
    const player = this.state.players.get(id);
    if (!player || !this.state.isPlaying) return;

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