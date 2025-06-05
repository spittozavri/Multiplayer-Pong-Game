const socket = io('http://localhost:3000');
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDiv = document.getElementById('score');
const lobbyScreen = document.getElementById('lobby-screen');
const startButton = document.getElementById('startButton'); // Get reference to the start button

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PADDLE_WIDTH = 20;
const PADDLE_HEIGHT = 100;
const BALL_SIZE = 10;
const PADDLE_SPEED = 5; // Add paddle speed constant

let localPlayerId = null;

// Set canvas size
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

// Add event listener to the start button
startButton.addEventListener('click', () => {
    // Emit a message to the server to start the game
    socket.emit('startGame');
});

// Handle keyboard input
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') {
        socket.emit('movePaddle', 'up');
    } else if (e.key === 'ArrowDown') {
        socket.emit('movePaddle', 'down');
    }
});

// Handle game state updates
socket.on('gameState', (state) => {
    const players = state.players;

    // Toggle lobby screen and button visibility
    if (players.length < 2) {
        lobbyScreen.style.display = 'flex';
        canvas.style.display = 'none';
        startButton.style.display = 'none'; // Hide start button
        scoreDiv.textContent = `Waiting for opponent... (${players.length}/2 players)`;
    } else {
        lobbyScreen.style.display = 'none';
        canvas.style.display = 'block';
        startButton.style.display = state.isPlaying ? 'none' : 'block'; // Show button if game not playing
        startButton.textContent = state.isPlaying ? '' : 'Start Game'; // Set button text

        // Clear canvas
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Draw paddles and labels
        players.forEach((player, index) => {
            ctx.fillStyle = player.id === localPlayerId ? '#007bff' : '#fff'; // Highlight local player's paddle
            // Determine paddle position based on player index (0 for left, 1 for right)
            const x = index === 0 ? 0 : CANVAS_WIDTH - PADDLE_WIDTH;
            const y = player.paddleY;
            ctx.fillRect(x, y, PADDLE_WIDTH, PADDLE_HEIGHT);

            // Draw player label
            ctx.fillStyle = '#fff';
            ctx.font = '16px sans-serif';
            ctx.textAlign = index === 0 ? 'left' : 'right';
            const labelX = index === 0 ? PADDLE_WIDTH + 5 : CANVAS_WIDTH - PADDLE_WIDTH - 5;
            const labelY = y + PADDLE_HEIGHT / 2 + 8; // Position near the middle of the paddle
            ctx.fillText(`Player ${index + 1}`, labelX, labelY);
        });

        // Draw ball
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(state.ball.x, state.ball.y, BALL_SIZE / 2, 0, Math.PI * 2);
        ctx.fill();

        // Update score
        // Assuming player order is consistent (player 1 on left, player 2 on right)
        scoreDiv.textContent = `Score: ${players[0].score} - ${players[1].score}`;
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