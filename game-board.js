// Game configurations
const BOARD_WIDTH = 800;
const BOARD_HEIGHT = 600;
const POINT_WIDTH = 50;
const POINT_HEIGHT = 240;
const CHECKER_RADIUS = 25;
const BAR_WIDTH = 50;
const BEAR_OFF_WIDTH = 80;

// Initialize the game board
function initializeBoard() {
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
    
    debugLog("Board initialized", { board: board });
}

// Drawing functions
function drawBoard() {
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
}

function drawCheckers() {
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
            let checkerY = getCheckerY(i, j);
            
            drawChecker(pointX, checkerY, checker.color);
        }
    }
}

function drawChecker(x, y, color) {
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
}
function drawBar() {
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
    for (let i = 0; i < whiteBar.length; i++) {
        let barY = BOARD_HEIGHT / 4 - (i * CHECKER_RADIUS * 1.5);
        drawChecker(barX, barY, 'white');
    }
    
    for (let i = 0; i < blackBar.length; i++) {
        let barY = BOARD_HEIGHT * 3/4 + (i * CHECKER_RADIUS * 1.5);
        drawChecker(barX, barY, 'black');
    }
    
    // Highlight the bar if player has checkers there and must move them
    let playerColor = currentPlayer === 'player1' ? 'white' : 'black';
    if ((playerColor === 'white' && whiteBar.length > 0) || 
        (playerColor === 'black' && blackBar.length > 0)) {
        
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
}

function drawBearOffAreas() {
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
    for (let i = 0; i < whiteBearOff.length; i++) {
        fill(255);
        stroke(200);
        strokeWeight(2);
        
        // Stack vertically
        const y = 100 + i * (rectHeight + 5);
        const x = BOARD_WIDTH + BEAR_OFF_WIDTH + 15;
        
        rect(x, y, rectWidth, rectHeight, 5);
    }
    
    // Draw rectangle for each black piece borne off
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

function drawValidMoves() {
    // Only show valid moves if it's the current player's turn and they can move
    if ((playerRole === "player1" && currentPlayer === "player1") || 
        (playerRole === "player2" && currentPlayer === "player2")) {
        
        // Highlight normal moves (from single dice)
        noStroke();
        fill(255, 255, 0, 100);
        
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
        
        // Highlight combined moves (using both dice)
        noStroke();
        fill(0, 255, 255, 100);
        
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
        
        // Bearing off indicators
        let playerColor = currentPlayer === 'player1' ? 'white' : 'black';
        
        if (validMoves.includes(24) || validMoves.includes(-1)) {
            noStroke();
            fill(255, 255, 0, 100);
            
            if (playerColor === 'white' && validMoves.includes(24)) {
                rect(BOARD_WIDTH + BEAR_OFF_WIDTH, 0, BEAR_OFF_WIDTH, BOARD_HEIGHT/2);
            } else if (playerColor === 'black' && validMoves.includes(-1)) {
                rect(0, BOARD_HEIGHT/2, BEAR_OFF_WIDTH, BOARD_HEIGHT/2);
            }
        }
        
        // Combined moves for bearing off
        for (const combinedMove of combinedMoves) {
            if ((playerColor === 'white' && combinedMove.targetIndex === 24) || 
                (playerColor === 'black' && combinedMove.targetIndex === -1)) {
                
                noStroke();
                fill(0, 255, 255, 100);
                
                if (playerColor === 'white') {
                    rect(BOARD_WIDTH + BEAR_OFF_WIDTH, 0, BEAR_OFF_WIDTH, BOARD_HEIGHT/2);
                } else {
                    rect(0, BOARD_HEIGHT/2, BEAR_OFF_WIDTH, BOARD_HEIGHT/2);
                }
            }
        }
    }
}
// Helper functions for board positions
function getPointX(pointIndex) {
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
}

function getPointY(pointIndex) {
    return pointIndex < 12 ? BOARD_HEIGHT : 0;
}

function getCheckerY(pointIndex, checkerIndex) {
    let pointY = getPointY(pointIndex);
    if (pointIndex < 12) {
        return pointY - CHECKER_RADIUS - (checkerIndex * CHECKER_RADIUS * 2);
    } else {
        return pointY + CHECKER_RADIUS + (checkerIndex * CHECKER_RADIUS * 2);
    }
}

// p5.js setup function
function setup() {
    debugLog("Setup function called");
    
    // Create canvas and append to container
    const canvas = createCanvas(BOARD_WIDTH + 2 * BEAR_OFF_WIDTH, BOARD_HEIGHT);
    canvas.parent('canvas-container');
    
    // Initialize game
    if (typeof initializeBoard === 'function') {
        initializeBoard();
    }
    
    // Make sure the roll button is connected
    const rollButton = document.getElementById('roll-button');
    if (rollButton) {
        if (typeof rollDice === 'function') {
            rollButton.addEventListener('click', rollDice);
        } else if (typeof window.rollDice === 'function') {
            rollButton.addEventListener('click', window.rollDice);
        }
    }
    
    debugLog("Backgammon game initialized in setup");
}

// p5.js draw function
function draw() {
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
window.setup = setup;
window.draw = draw;
