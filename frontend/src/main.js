const socket = io('http://localhost:3000');
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDiv = document.getElementById('score');
const lobbyScreen = document.getElementById('lobby-screen');
const startButton = document.getElementById('startButton');

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PADDLE_WIDTH = 20;
const PADDLE_HEIGHT = 100;
const BALL_SIZE = 10;
const PADDLE_SPEED = 5;

let localPlayerId = null;

// Set canvas size
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

// Add event listener to the start button
startButton.addEventListener('click', () => {
    // Emit a message to the server to start or restart the game
    socket.emit('startGame');
});

// Handle keyboard input
document.addEventListener('keydown', (e) => {
    // Only allow paddle movement if the game is playing
    if (e.key === 'ArrowUp') {
        socket.emit('movePaddle', 'up');
    } else if (e.key === 'ArrowDown') {
        socket.emit('movePaddle', 'down');
    }
});

// Handle game state updates
socket.on('gameState', (state) => {
    const players = state.players;

    // Toggle lobby screen visibility
    if (players.length < 2) {
        lobbyScreen.style.display = 'flex';
        canvas.style.display = 'none';
        startButton.style.display = 'none'; // Hide start button when waiting for opponent
        scoreDiv.textContent = `Waiting for opponent... (${players.length}/2 players)`;
    } else {
        // Two or more players are connected
        lobbyScreen.style.display = 'none';
        canvas.style.display = 'block';

        // Manage start button visibility and text
        if (!state.isPlaying) {
             startButton.style.display = 'block'; // Show button if game is not playing
             startButton.textContent = state.isGameOver ? 'Play Again' : 'Start Game';
        } else {
             startButton.style.display = 'none'; // Hide button if game is playing
        }

        if (state.isGameOver) {
            // Game is over

            // Clear canvas
             ctx.fillStyle = '#000';
             ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

            // Display winner message
            ctx.fillStyle = '#fff';
            ctx.font = '40px sans-serif';
            ctx.textAlign = 'center';
            const winner = players.find(p => p.id === state.winnerId);
            if (winner) {
                // Find the winner's player number based on their position in the players array
                 const winnerPlayerNumber = players.indexOf(winner) + 1;
                ctx.fillText(`Player ${winnerPlayerNumber} Wins!`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
            } else {
                 ctx.fillText('Game Over', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
            }

             // Update score display (still show final score)
            scoreDiv.textContent = `Score: ${players[0].score} - ${players[1].score}`;

        } else {
            // Game is ongoing

            // Clear canvas
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

            // Draw center line
            ctx.beginPath();
            ctx.setLineDash([10, 10]);
            ctx.moveTo(CANVAS_WIDTH / 2, 0);
            ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
            ctx.strokeStyle = '#fff';
            ctx.stroke();
            ctx.setLineDash([]); // Reset line dash

            // Draw paddles and labels
            players.forEach((player, index) => {
                ctx.fillStyle = player.id === localPlayerId ? '#007bff' : '#fff';
                const x = index === 0 ? 0 : CANVAS_WIDTH - PADDLE_WIDTH;
                const y = player.paddleY;
                ctx.fillRect(x, y, PADDLE_WIDTH, PADDLE_HEIGHT);

                // Draw player label
                ctx.fillStyle = '#fff';
                ctx.font = '16px sans-serif';
                ctx.textAlign = index === 0 ? 'left' : 'right';
                const labelX = index === 0 ? PADDLE_WIDTH + 5 : CANVAS_WIDTH - PADDLE_WIDTH - 5;
                const labelY = y + PADDLE_HEIGHT / 2 + 8;
                ctx.fillText(`Player ${index + 1}`, labelX, labelY);
            });

            // Draw ball
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(state.ball.x, state.ball.y, BALL_SIZE / 2, 0, Math.PI * 2);
            ctx.fill();

            // Update score
            scoreDiv.textContent = `Score: ${players[0].score} - ${players[1].score}`;
        }
    }
});

// Get local player ID on connection
socket.on('connect', () => {
    localPlayerId = socket.id;
    console.log('Connected to server with ID:', localPlayerId);
});

socket.on('disconnect', () => {
    console.log('Disconnected from server');
    localPlayerId = null;
});

socket.on('connect_error', (error) => {
    console.error('Connection error:', error);
});