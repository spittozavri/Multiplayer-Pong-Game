import { Player, GameState } from './types';
import {
  PADDLE_HEIGHT,
  PADDLE_WIDTH,
  PADDLE_SPEED,
  BALL_SPEED,
  BALL_SIZE,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  WINNING_SCORE,
  BALL_SPEED_INCREASE,
} from './constants';

export class Game {
  private state: GameState;
  private gameLoop: NodeJS.Timeout | null = null;

  constructor() {
    this.state = {
      players: new Map<string, Player>(),
      ball: {
        x: CANVAS_WIDTH / 2,
        y: CANVAS_HEIGHT / 2,
        velocityX: BALL_SPEED,
        velocityY: BALL_SPEED
      },
      isPlaying: false,
      isGameOver: false,
      winnerId: null
    };
  }

  public startGame(roomPlayers: Map<string, any>): void {
    if (roomPlayers.size === 2 && !this.state.isPlaying) {
        this.state.players.clear();
        let playerIndex = 0;
        roomPlayers.forEach((socket, id) => {
             this.state.players.set(id, {
                id: id,
                paddleY: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
                score: 0,
            });
            playerIndex++;
        });

        this.state.isPlaying = true;
        this.state.isGameOver = false;
        this.state.winnerId = null;
        this.resetBall();
    }
  }

  public stopGame(): void {
    this.state.isPlaying = false;
    this.state.isGameOver = false;
    this.state.winnerId = null;
    this.resetBall();
    this.state.players.forEach(player => player.score = 0);
  }

  private resetBall(): void {
    this.state.ball = {
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT / 2,
      velocityX: BALL_SPEED * (Math.random() > 0.5 ? 1 : -1),
      velocityY: BALL_SPEED * (Math.random() > 0.5 ? 1 : -1)
    };
  }

  public update(): void {
    if (!this.state.isPlaying || this.state.isGameOver) return;

    this.state.ball.x += this.state.ball.velocityX;
    this.state.ball.y += this.state.ball.velocityY;

    if (this.state.ball.y <= 0 || this.state.ball.y + BALL_SIZE >= CANVAS_HEIGHT) {
      this.state.ball.velocityY *= -1;
    }

    const players = Array.from(this.state.players.values());
    players.forEach(player => {
      const paddleLeft = player.id === players[0].id ? 0 : CANVAS_WIDTH - PADDLE_WIDTH;
      const paddleRight = paddleLeft + PADDLE_WIDTH;
      const paddleTop = player.paddleY;
      const paddleBottom = player.paddleY + PADDLE_HEIGHT;

      if (
        this.state.ball.x + BALL_SIZE >= paddleLeft &&
        this.state.ball.x <= paddleRight &&
        this.state.ball.y + BALL_SIZE >= paddleTop &&
        this.state.ball.y <= paddleBottom
      ) {
        this.state.ball.velocityX *= -1;
        this.state.ball.velocityX += this.state.ball.velocityX > 0 ? BALL_SPEED_INCREASE : -BALL_SPEED_INCREASE;
        this.state.ball.velocityY += this.state.ball.velocityY > 0 ? BALL_SPEED_INCREASE : -BALL_SPEED_INCREASE;
        this.state.ball.velocityY += (Math.random() - 0.5) * 2;
        if (this.state.ball.velocityX < 0) {
            this.state.ball.x = paddleLeft - BALL_SIZE;
        } else {
            this.state.ball.x = paddleRight + BALL_SIZE;
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
    } else if (this.state.ball.x + BALL_SIZE >= CANVAS_WIDTH) {
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
          if (player.score >= WINNING_SCORE) {
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
      player.paddleY = Math.max(0, player.paddleY - PADDLE_SPEED);
    } else {
      player.paddleY = Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, player.paddleY + PADDLE_SPEED);
    }
  }

  getState(): GameState {
    return this.state;
  }
} 