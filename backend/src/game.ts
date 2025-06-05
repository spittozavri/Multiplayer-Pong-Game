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
                role: playerIndex === 0 ? 'player1' : 'player2',
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

    // console.log('Game update tick'); // Log each update tick
    // console.log('Ball initial state:', { x: this.state.ball.x, y: this.state.ball.y, vx: this.state.ball.velocityX, vy: this.state.ball.velocityY }); // Log ball state

    this.state.ball.x += this.state.ball.velocityX;
    this.state.ball.y += this.state.ball.velocityY;

    // Ball wall collision
    if (this.state.ball.y <= 0) {
         this.state.ball.y = 0; // Prevent ball from going outside bounds
      this.state.ball.velocityY *= -1;
       // console.log('Ball hit top wall');
    } else if (this.state.ball.y + BALL_SIZE >= CANVAS_HEIGHT) {
         this.state.ball.y = CANVAS_HEIGHT - BALL_SIZE; // Prevent ball from going outside bounds
      this.state.ball.velocityY *= -1;
       // console.log('Ball hit bottom wall');
    }

    const players = Array.from(this.state.players.values());
    players.forEach(player => {
      const paddleLeft = player.role === 'player1' ? 0 : CANVAS_WIDTH - PADDLE_WIDTH;
      const paddleRight = paddleLeft + PADDLE_WIDTH;
      const paddleTop = player.paddleY;
      const paddleBottom = player.paddleY + PADDLE_HEIGHT;

      // Ball paddle collision
      if (
        this.state.ball.x + BALL_SIZE >= paddleLeft &&
        this.state.ball.x <= paddleRight &&
        this.state.ball.y + BALL_SIZE >= paddleTop &&
        this.state.ball.y <= paddleBottom
      ) {
           // console.log(`Ball hit ${player.role}'s paddle. Ball: (${this.state.ball.x}, ${this.state.ball.y}), Paddle: (${paddleLeft}, ${paddleTop})`); // Log collision

        this.state.ball.velocityX *= -1;
        // Increase ball speed slightly on paddle hit
        this.state.ball.velocityX += this.state.ball.velocityX > 0 ? BALL_SPEED_INCREASE : -BALL_SPEED_INCREASE;
        this.state.ball.velocityY += this.state.ball.velocityY > 0 ? BALL_SPEED_INCREASE : -BALL_SPEED_INCREASE;
         // Add some randomness to vertical velocity - REMOVED
        // this.state.ball.velocityY += (Math.random() - 0.5) * 2;

        // Adjust ball position to prevent sticking to paddle
        if (this.state.ball.velocityX < 0) { // Moving left
            this.state.ball.x = paddleLeft - BALL_SIZE;
        } else { // Moving right
            this.state.ball.x = paddleRight + BALL_SIZE;
        }
         // console.log('Ball state after paddle collision response:', { x: this.state.ball.x, y: this.state.ball.y, vx: this.state.ball.velocityX, vy: this.state.ball.velocityY }); // Log ball state after collision
      }
    });

    // Scoring
    if (this.state.ball.x < 0) { // Ball went off left side
      // Find player by role to increment score
      const rightPlayer = players.find(p => p.role === 'player2'); 
      if (rightPlayer) {
          rightPlayer.score++;
           // console.log(`Score for ${rightPlayer.role}! New score: ${rightPlayer.score}`); // Log score
          this.checkGameOver();
          if (!this.state.isGameOver) {
            this.resetBall(); // Reset ball if game not over
          }
      }
    } else if (this.state.ball.x + BALL_SIZE > CANVAS_WIDTH) { // Ball went off right side
      // Find player by role to increment score
      const leftPlayer = players.find(p => p.role === 'player1');
       if (leftPlayer) {
          leftPlayer.score++;
           // console.log(`Score for ${leftPlayer.role}! New score: ${leftPlayer.score}`); // Log score
          this.checkGameOver();
           if (!this.state.isGameOver) {
            this.resetBall(); // Reset ball if game not over
          }
      }
    }

    // Log ball position after update
    this.logBallPosition(); // Call the new log method
  }

  private checkGameOver(): void {
      const players = Array.from(this.state.players.values());
      players.forEach(player => {
          if (player.score >= WINNING_SCORE) {
              this.state.isPlaying = false;
              this.state.isGameOver = true;
              this.state.winnerId = player.id;
              this.stopGame(); // Stop game loop and reset on game over
          }
      });
  }

  movePaddle(id: string, direction: 'up' | 'down'): void {
    const player = this.state.players.get(id);
    if (!player || !this.state.isPlaying) return;

    // console.log(`movePaddle called for player ${id}, direction: ${direction}. Initial paddleY: ${player.paddleY}`); // Removed debugging log

    if (direction === 'up') {
      const newPaddleY = Math.max(0, player.paddleY - PADDLE_SPEED);
      player.paddleY = newPaddleY;
       // console.log(`Move up logic applied. New paddleY: ${player.paddleY}`); // Removed debugging log
    } else if (direction === 'down') {
      const newPaddleY = Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, player.paddleY + PADDLE_SPEED);
      player.paddleY = newPaddleY;
       // console.log(`Move down logic applied. New paddleY: ${player.paddleY}`); // Removed debugging log
    }
     // console.log(`movePaddle finished for player ${id}. Final paddleY: ${player.paddleY}`); // Removed debugging log
  }

  getState(): GameState {
    return this.state;
  }

  // Add a log to show ball position after update
   logBallPosition(): void {
      // console.log(`Backend Game Update End: Ball pos (${this.state.ball.x.toFixed(2)}, ${this.state.ball.y.toFixed(2)})`);
   }
} 