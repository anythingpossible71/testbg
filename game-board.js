// Game configurations - using var to avoid redeclaration errors
// Check if variables already exist before declaring
if (typeof BOARD_WIDTH === 'undefined') var BOARD_WIDTH = 800;
if (typeof BOARD_HEIGHT === 'undefined') var BOARD_HEIGHT = 600;
if (typeof POINT_WIDTH === 'undefined') var POINT_WIDTH = 50;
if (typeof POINT_HEIGHT === 'undefined') var POINT_HEIGHT = 240;
if (typeof CHECKER_RADIUS === 'undefined') var CHECKER_RADIUS = 25;
if (typeof BAR_WIDTH === 'undefined') var BAR_WIDTH = 50;
if (typeof BEAR_OFF_WIDTH === 'undefined') var BEAR_OFF_WIDTH = 80;

// Initialize the game board
function initializeBoard() {
    try {
        debugLog("Initializing game board");
        board = [];
        for (let i = 0; i < 24; i++) {
            board.push([]);
        }
        
        // White checkers
        for (let i = 0; i < 2; i++) board[0].push({ color: 'white' });
        for (let i = 0; i < 5; i++) board[11].push({ color: 'white' });
        for (let i = 0; i < 3; i++) board[16].push({ color: 'white' });
        for (let i = 0; i < 5; i++) board[18].push({ color: 'white' });
        
        // Black checkers
        for (let i = 0; i < 2; i++) board[23].push({ color: 'black' });
        for (let i = 0; i < 5; i++) board[12].push({ color: 'black' });
        for (let i = 0; i < 3; i++) board[7].push({ color: 'black' });
        for (let i = 0; i < 5; i++) board[5].push({ color: 'black' });
        
        whiteBar = [];
        blackBar = [];
        whiteBearOff = [];
        blackBearOff = [];
        
        debugLog("Board initialized:", { boardLength: board.length });
    } catch (error) {
        console.error("Error in initializeBoard:", error);
    }
}

// Drawing functions
function drawBoard() {
    try {
        // Draw bear-off areas
        fill(101, 67, 33);
        rect(0, 0, BEAR_OFF_WIDTH, BOARD_HEIGHT); // Left bear-off
        rect(BOARD_WIDTH + BEAR_OFF_WIDTH, 0, BEAR_OFF_WIDTH, BOARD_HEIGHT); // Right bear-off
        
        // Draw main board
        fill(101, 67, 33);
        rect(BEAR_OFF_WIDTH, 0, BOARD_WIDTH, BOARD_HEIGHT);
        
        let darkPointColor = color(165, 42, 42);
        let lightPointColor = color(245, 245, 220);
        
        for (let i = 0; i < 24; i++) {
            let pointX = getPointX(i);
            let pointY = getPointY(i);
            
            fill(i % 2 === 0 ? darkPointColor : lightPointColor);
            noStroke();
            
            if (i < 12) {
                triangle(
                    pointX - POINT_WIDTH/2, pointY, 
                    pointX + POINT_WIDTH/2, pointY, 
                    pointX, pointY - POINT_HEIGHT
                );
            } else {
                triangle(
                    pointX - POINT_WIDTH/2, pointY, 
                    pointX + POINT_WIDTH/2, pointY, 
                    pointX, pointY + POINT_HEIGHT
                );
            }
        }
        
        // Draw center bar
        fill(120, 80, 40); // Slightly different color for bar
        const barX = BOARD_WIDTH/2 - BAR_WIDTH/2 + BEAR_OFF_WIDTH;
        rect(barX, 0, BAR_WIDTH, BOARD_HEIGHT);
        
        // Draw board border
        noFill();
        strokeWeight(10);
        stroke(101, 67, 33);
        rect(BEAR_OFF_WIDTH, 0, BOARD_WIDTH, BOARD_HEIGHT);
        
        // Draw middle line
        stroke(101, 67, 33);
        line(BEAR_OFF_WIDTH, BOARD_HEIGHT/2, BEAR_OFF_WIDTH + BOARD_WIDTH, BOARD_HEIGHT/2);
    } catch (error) {
        console.error("Error in drawBoard:", error);
    }
}

function drawCheckers() {
    try {
        if (!board || board.length === 0) {
            debugLog("No board data to draw checkers");
            return;
        }
        
        for (let i = 0; i < board.length; i++) {
            let point = board[i];
            if (!point || point.length === 0) continue;
            
            let pointX = getPointX(i);
            
            for (let j = 0; j < point.length; j++) {
                if (selectedChecker && selectedChecker.pointIndex === i && selectedChecker.checkerIndex === j) {
                    continue;
                }
                
                let checker = point[j];
                if (!checker || !checker.color) continue;
                
                let checkerY = getCheckerY(i, j);
                
                drawChecker(pointX, checkerY, checker.color);
            }
        }
    } catch (error) {
        console.error("Error in drawCheckers:", error);
    }
}

function drawChecker(x, y, color) {
    try {
        if (color === 'white') {
            fill(255);
            stroke(200);
            strokeWeight(2);
            ellipse(x, y, CHECKER_RADIUS * 2);
            
            // Add a highlight to the checker
            noStroke();
            fill(255, 255, 255, 150);
            ellipse(x - CHECKER_RADIUS * 0.3, y - CHECKER_RADIUS * 0.3, CHECKER_RADIUS);
        } else {
            fill(50);
            stroke(20);
            strokeWeight(2);
            ellipse(x, y, CHECKER_RADIUS * 2);
            
            // Add a highlight to the checker
            noStroke();
            fill(100, 100, 100, 150);
            ellipse(x - CHECKER_RADIUS * 0.3, y - CHECKER_RADIUS * 0.3, CHECKER_RADIUS);
        }
    } catch (error) {
        console.error("Error in drawChecker:", error);
    }
}

function drawBar() {
    try {
        let barX = BOARD_WIDTH/2 + BEAR_OFF_WIDTH;
            
        // Draw bar background
        fill(120, 80, 40);
        rect(barX - BAR_WIDTH/2, 0, BAR_WIDTH, BOARD_HEIGHT);
        
        // Draw bar borders
        noFill();
        stroke(80, 40, 0);
        strokeWeight(3);
        rect(barX - BAR_WIDTH/2, 0, BAR_WIDTH, BOARD_HEIGHT);
        
        // Draw checkers on the bar
        if (whiteBar && whiteBar.length) {
            for (let i = 0; i < whiteBar.length; i++) {
                let barY = BOARD_HEIGHT / 4 - (i * CHECKER_RADIUS * 1.5);
                drawChecker(barX, barY, 'white');
            }
        }
        
        if (blackBar && blackBar.length) {
            for (let i = 0; i < blackBar.length; i++) {
                let barY = BOARD_HEIGHT * 3/4 + (i * CHECKER_RADIUS * 1.5);
                drawChecker(barX, barY, 'black');
            }
        }
        
        // Highlight the bar if player has checkers there and must move them
        let playerColor = currentPlayer === 'player1' ? 'white' : 'black';
        if ((playerColor === 'white' && whiteBar && whiteBar.length > 0) || 
            (playerColor === 'black' && blackBar && blackBar.length > 0)) {
            
            noFill();
            stroke(255, 255, 0);
            strokeWeight(3);
            rect(barX - BAR_WIDTH/2, 0, BAR_WIDTH, BOARD_HEIGHT);
            
            fill(255, 255, 0);
            noStroke();
            textSize(14);
            textAlign(CENTER);
            
            if (playerColor === 'white') {
                text("Must move from bar", barX, BOARD_HEIGHT/4 + CHECKER_RADIUS * 3);
            } else {
                text("Must move from bar", barX, BOARD_HEIGHT * 3/4 - CHECKER_RADIUS * 3);
            }
        }
    } catch (error) {
        console.error("Error in drawBar:", error);
    }
}

function drawBearOffAreas() {
    try {
        // Left bear-off area (Black)
        fill(80, 50, 20);
        rect(0, 0, BEAR_OFF_WIDTH, BOARD_HEIGHT);
        
        // Right bear-off area (White)
        fill(80, 50, 20);
        rect(BOARD_WIDTH + BEAR_OFF_WIDTH, 0, BEAR_OFF_WIDTH, BOARD_HEIGHT);
        
        // Rectangle dimensions for borne off pieces
        const rectWidth = 50;
        const rectHeight = 20;
        
        // Draw rectangle for each white piece borne off
        if (whiteBearOff && whiteBearOff.length) {
            for (let i = 0; i < whiteBearOff.length; i++) {
                fill(255);
                stroke(200);
                strokeWeight(2);
                
                // Stack vertically
                const y = 100 + i * (rectHeight + 5);
                const x = BOARD_WIDTH + BEAR_OFF_WIDTH + 15;
                
                rect(x, y, rectWidth, rectHeight, 5);
            }
        }
        
        // Draw rectangle for each black piece borne off
        if (blackBearOff && blackBearOff.length) {
            for (let i = 0; i < blackBearOff.length; i++) {
                fill(50);
                stroke(20);
                strokeWeight(2);
                
                // Stack vertically
                const y = 100 + i * (rectHeight + 5);
                const x = 15;
                
                rect(x, y, rectWidth, rectHeight, 5);
            }
        }
    } catch (error) {
        console.error("Error in drawBearOffAreas:", error);
    }
}

function drawValidMoves() {
    try {
        // Only show valid moves if it's the current player's turn and they can move
        if ((playerRole === "player1" && currentPlayer === "player1") || 
            (playerRole === "player2" && currentPlayer === "player2")) {
            
            // Highlight normal moves (from single dice)
            noStroke();
            fill(255, 255, 0, 100);
            
            if (validMoves && validMoves.length) {
                for (const pointIndex of validMoves) {
                    if (pointIndex === 24 || pointIndex === -1) continue;
                    
                    let pointX = getPointX(pointIndex);
                    let pointY = getPointY(pointIndex);
                    
                    if (pointIndex < 12) {
                        triangle(
                            pointX - POINT_WIDTH/2, pointY, 
                            pointX + POINT_WIDTH/2, pointY, 
                            pointX, pointY - POINT_HEIGHT
                        );
                    } else {
                        triangle(
                            pointX - POINT_WIDTH/2, pointY, 
                            pointX + POINT_WIDTH/2, pointY, 
                            pointX, pointY + POINT_HEIGHT
                        );
                    }
                }
            }
            
            // Highlight combined moves (using both dice)
            noStroke();
            fill(0, 255, 255, 100);
            
            if (combinedMoves && combinedMoves.length) {
                for (const combinedMove of combinedMoves) {
                    if (combinedMove.targetIndex === 24 || combinedMove.targetIndex === -1) continue;
                    
                    let pointX = getPointX(combinedMove.targetIndex);
                    let pointY = getPointY(combinedMove.targetIndex);
                    
                    if (combinedMove.targetIndex < 12) {
                        triangle(
                            pointX - POINT_WIDTH/2, pointY, 
                            pointX + POINT_WIDTH/2, pointY, 
                            pointX, pointY - POINT_HEIGHT
                        );
                    } else {
                        triangle(
                            pointX - POINT_WIDTH/2, pointY, 
                            pointX + POINT_WIDTH/2, pointY, 
                            pointX, pointY + POINT_HEIGHT
                        );
                    }
                }
            }
            
            // Bearing off indicators
            let playerColor = currentPlayer === 'player1' ? 'white' : 'black';
            
            if (validMoves && (validMoves.includes(24) || validMoves.includes(-1))) {
                noStroke();
                fill(255, 255, 0, 100);
                
                if (playerColor === 'white' && validMoves.includes(24)) {
                    rect(BOARD_WIDTH + BEAR_OFF_WIDTH, 0, BEAR_OFF_WIDTH, BOARD_HEIGHT/2);
                } else if (playerColor === 'black' && validMoves.includes(-1)) {
                    rect(0, BOARD_HEIGHT/2, BEAR_OFF_WIDTH, BOARD_HEIGHT/2);
                }
            }
        }
    } catch (error) {
        console.error("Error in drawValidMoves:", error);
    }
}

// Helper functions for board positions
function getPointX(pointIndex) {
    try {
        const boardOffset = BEAR_OFF_WIDTH;
        
        if (pointIndex < 6) {
            return boardOffset + BOARD_WIDTH - (pointIndex + 1) * POINT_WIDTH + POINT_WIDTH/2;
        } else if (pointIndex < 12) {
            return boardOffset + (12 - pointIndex) * POINT_WIDTH - POINT_WIDTH/2;
        } else if (pointIndex < 18) {
            return boardOffset + (pointIndex - 12 + 1) * POINT_WIDTH - POINT_WIDTH/2;
        } else {
            return boardOffset + BOARD_WIDTH - (24 - pointIndex) * POINT_WIDTH + POINT_WIDTH/2;
        }
    } catch (error) {
        console.error("Error in getPointX:", error);
        return BEAR_OFF_WIDTH + BOARD_WIDTH/2; // Default to center if error
    }
}

function getPointY(pointIndex) {
    try {
        return pointIndex < 12 ? BOARD_HEIGHT : 0;
    } catch (error) {
        console.error("Error in getPointY:", error);
        return BOARD_HEIGHT/2; // Default to middle if error
    }
}

function getCheckerY(pointIndex, checkerIndex) {
    try {
        let pointY = getPointY(pointIndex);
        if (pointIndex < 12) {
            return pointY - CHECKER_RADIUS - (checkerIndex * CHECKER_RADIUS * 2);
        } else {
            return pointY + CHECKER_RADIUS + (checkerIndex * CHECKER_RADIUS * 2);
        }
    } catch (error) {
        console.error("Error in getCheckerY:", error);
        return BOARD_HEIGHT/2; // Default to middle if error
    }
}

// Check if both players have joined and force game to start if needed
function checkAndStartGame() {
    try {
        debugLog("Checking if game can start...");
        debugLog("Player names:", { player1: player1Name, player2: player2Name });
        
        if (player1Name !== "Player 1" && player2Name !== "Player 2") {
            debugLog("Both players have joined, forcing game to start");
            
            // Force UI update
            gameStarted = true;
            
            // Hide waiting message for player 1
            const waitingMessage = document.getElementById('waiting-message');
            const playerJoin = document.getElementById('player-join');
            const gameControls = document.getElementById('game-controls');
            
            if (waitingMessage) waitingMessage.classList.add('hidden');
            if (playerJoin) playerJoin.classList.add('hidden');
            if (gameControls) gameControls.classList.remove('hidden');
            
            // Enable roll button for player 1
            if (currentPlayer === 'player1' && playerRole === 'player1') {
                const rollButton = document.getElementById('roll-button');
                if (rollButton) rollButton.disabled = false;
            }
            
            // Update UI
            const gameStatusEl = document.getElementById('game-status');
            if (gameStatusEl) gameStatusEl.textContent = player1Name + "'s turn to roll";
            
            // Update other UI elements
            if (typeof updatePlayerInfo === 'function') updatePlayerInfo();
            if (typeof updateDiceDisplay === 'function') updateDiceDisplay();
            
            // Save game state
            if (typeof saveGameState === 'function') {
                saveGameState();
            }
        }
    } catch (error) {
        console.error("Error in checkAndStartGame:", error);
    }
}

// p5.js setup function
function setup() {
    try {
        debugLog("Setup function called");
        
        // Create canvas and append to container
        const canvasContainer = document.getElementById('canvas-container');
        if (canvasContainer) {
            const canvas = createCanvas(BOARD_WIDTH + 2 * BEAR_OFF_WIDTH, BOARD_HEIGHT);
            canvas.parent('canvas-container');
            
            debugLog("Canvas created with dimensions:", { 
                width: BOARD_WIDTH + 2 * BEAR_OFF_WIDTH, 
                height: BOARD_HEIGHT 
            });
        } else {
            debugLog("Canvas container not found");
        }
        
        // Initialize game
        if (typeof initializeBoard === 'function') {
            initializeBoard();
        } else {
            console.error("initializeBoard function not available");
        }
        
        // Make sure the roll button is connected
        const rollButton = document.getElementById('roll-button');
        if (rollButton) {
            rollButton.addEventListener('click', function() {
                debugLog("Roll button clicked");
                if (typeof rollDice === 'function') {
                    rollDice();
                } else if (typeof window.rollDice === 'function') {
                    window.rollDice();
                } else {
                    debugLog("rollDice function not found");
                }
            });
            debugLog("Roll button event listener added");
        } else {
            debugLog("Roll button not found");
        }
        
        debugLog("Backgammon game initialized in setup");
    } catch (error) {
        console.error("Error in setup:", error);
    }
}

// p5.js draw function
function draw() {
    try {
        background(240);
        
        // Always draw the game board
        drawBoard();
        
        // Only draw checkers if game has started or board is initialized
        if (board && board.length > 0) {
            drawCheckers();
            drawBar();
            drawBearOffAreas();
        }
        
        // Only show valid moves if it's the current player's turn
        if (selectedChecker && canPlayerMove()) {
            drawValidMoves();
        }
        
        // Draw selected checker being dragged
        if (selectedChecker) {
            let checker;
            
            if (selectedChecker.pointIndex === -1) {
                checker = { color: currentPlayer === 'player1' ? 'white' : 'black' };
            } else if (board[selectedChecker.pointIndex] && 
                      board[selectedChecker.pointIndex][selectedChecker.checkerIndex]) {
                checker = board[selectedChecker.pointIndex][selectedChecker.checkerIndex];
            }
            
            if (checker) {
                drawChecker(mouseX, mouseY, checker.color);
            }
        }
    } catch (error) {
        console.error("Error in draw:", error);
    }
}

// Debug function to log current board state
function debugBoard() {
    console.log("===== BOARD STATE =====");
    
    console.log("White Bar:", whiteBar ? whiteBar.length : 0);
    console.log("White Bear Off:", whiteBearOff ? whiteBearOff.length : 0);
    
    if (board) {
        for (let i = 0; i < 24; i++) {
            if (!board[i] || board[i].length === 0) continue;
            
            let point = board[i];
            let whiteCount = 0;
            let blackCount = 0;
            
            for (let j = 0; j < point.length; j++) {
                if (point[j].color === 'white') {
                    whiteCount++;
                } else {
                    blackCount++;
                }
            }
            
            if (whiteCount > 0) {
                console.log(`Point ${i}: ${whiteCount} white`);
            }
            if (blackCount > 0) {
                console.log(`Point ${i}: ${blackCount} black`);
            }
        }
    }
    
    console.log("Black Bar:", blackBar ? blackBar.length : 0);
    console.log("Black Bear Off:", blackBearOff ? blackBearOff.length : 0);
    console.log("=======================");
}

// Make these functions globally accessible
window.initializeBoard = initializeBoard;
window.drawBoard = drawBoard;
window.drawCheckers = drawCheckers;
window.drawChecker = drawChecker;
window.drawBar = drawBar;
window.drawBearOffAreas = drawBearOffAreas;
window.drawValidMoves = drawValidMoves;
window.getPointX = getPointX;
window.getPointY = getPointY;
window.getCheckerY = getCheckerY;
window.checkAndStartGame = checkAndStartGame;
window.setup = setup;
window.draw = draw;
window.debugBoard = debugBoard;

// Log that the board functions have been loaded
debugLog("Game board functions loaded successfully");
