// Main application code

// p5.js setup
function setup() {
    // Create canvas and append to container
    const canvas = createCanvas(BOARD_WIDTH + 2 * BEAR_OFF_WIDTH, BOARD_HEIGHT);
    canvas.parent('canvas-container');
    
    // Initialize game
    initializeBoard();
    
    // Check URL for game ID (for joining a game)
    const urlParams = new URLSearchParams(window.location.search);
    const urlGameId = urlParams.get('game');
    
    if (urlGameId) {
        // Join existing game flow
        gameId = urlGameId;
        document.getElementById('game-url').value = window.location.href;
        document.getElementById('create-game-ui').style.display = 'none';
        document.getElementById('join-game-ui').style.display = 'block';
        
        // In a real implementation, we would fetch the game state from Firebase here
        // For now, just initialize a new game
        playerRole = "spectator";
        gameStatus = "Join this game to play";
    }
    
    // Setup UI controls and event listeners
    setupUIControls();
    
    // Update initial UI state
    updatePlayerInfo();
    updateDiceDisplay();
    updateGameStatus();
}

function draw() {
    background(240);
    
    if (gameId) {
        // Game in progress - draw game elements
        drawBoard();
        drawCheckers();
        drawBar();
        drawBearOffAreas();
        
        // Only show valid moves if it's the current player's turn
        if (selectedChecker && canPlayerMove()) {
            drawValidMoves();
        }
        
        // Draw selected checker being dragged
        if (selectedChecker) {
            let checker;
            
            if (selectedChecker.pointIndex === -1) {
                checker = { color: currentPlayer === 'player1' ? 'white' : 'black' };
            } else {
                checker = board[selectedChecker.pointIndex][selectedChecker.checkerIndex];
            }
            
            if (checker) {
                drawChecker(mouseX, mouseY, checker.color);
            }
        }
    } else {
        // Welcome screen
        background(101, 67, 33); // Brown background
        
        // Draw title
        fill(245, 245, 220);
        textSize(36);
        textAlign(CENTER, CENTER);
        text("Shareable Backgammon", width/2, height/4);
        
        textSize(18);
        text("Create a game to get started", width/2, height/4 + 50);
    }
}

// Event handling for browser window
window.onload = function() {
    // Additional initialization if needed
    console.log("Backgammon game loaded");
    
    // Handle window resize
    window.addEventListener('resize', function() {
        // In a more complex implementation, we might want to adjust canvas size here
        // For now, we keep it static
    });
};

// For demonstration purposes, log some debug info
console.log("Backgammon game initialized");
