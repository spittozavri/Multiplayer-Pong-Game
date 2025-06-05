import { useRef, useEffect } from 'react';
import useGameStore from '../store/gameStore';
import {
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
    PADDLE_WIDTH,
    PADDLE_HEIGHT,
    BALL_SIZE,
    PLAYER_1_COLOR,
    PLAYER_2_COLOR,
    BALL_COLOR,
    CENTER_LINE_COLOR,
    SCORE_COLOR,
} from '../config/constants';

function GameCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { clientGameState, localPlayerId } = useGameStore();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Draw center line
        ctx.setLineDash([10, 10]);
        ctx.beginPath();
        ctx.moveTo(CANVAS_WIDTH / 2, 0);
        ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
        ctx.strokeStyle = CENTER_LINE_COLOR;
        ctx.stroke();
        ctx.setLineDash([]);

        if (!clientGameState) return;

        // Draw paddles
        clientGameState.players.forEach((player) => {
            ctx.fillStyle = player.role === 'player1' ? PLAYER_1_COLOR : PLAYER_2_COLOR;
            const paddleX = player.role === 'player1' ? 0 : CANVAS_WIDTH - PADDLE_WIDTH;
            ctx.fillRect(
                paddleX,
                player.paddleY,
                PADDLE_WIDTH,
                PADDLE_HEIGHT
            );
        });

        // Draw ball
        ctx.beginPath();
        ctx.arc(
            clientGameState.ball.x,
            clientGameState.ball.y,
            BALL_SIZE / 2,
            0,
            Math.PI * 2
        );
        ctx.fillStyle = BALL_COLOR;
        ctx.fill();

        // Draw scores
        ctx.font = '32px Arial';
        ctx.fillStyle = SCORE_COLOR;
        ctx.textAlign = 'center';

        // Find players by role to display scores
        const player1 = clientGameState.players.find(p => p.role === 'player1');
        const player2 = clientGameState.players.find(p => p.role === 'player2');

        const scoreText = `${player1?.score || 0} - ${player2?.score || 0}`;

        ctx.fillText(
            scoreText,
            CANVAS_WIDTH / 2,
            50
        );
    }, [clientGameState, localPlayerId]);

    return (
        <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="game-canvas"
        />
    );
}

export default GameCanvas; 