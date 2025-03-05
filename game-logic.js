// Game Logic Functions

// Mouse interaction functions
function mousePressed() {
    // Only allow player to interact if it's their turn
    if (!canPlayerMove()) return;
    
    if (!diceRolled) return;
    if (mouseY > BOARD_HEIGHT) return;
    
    let playerColor = currentPlayer === 'player1' ? 'white' : 'black';
    
    // Check if player has checkers on the bar
    if ((playerColor === 'white' && whiteBar.length > 0) || 
        (playerColor === 'black' && blackBar.length > 0)) {
        
        let barX = BOARD_WIDTH / 2 + BEAR_OFF_WIDTH;
        let barY = playerColor === 'white' ? BOARD_HEIGHT / 4 : BOARD_HEIGHT * 3/4;
        
        if (dist(mouseX, mouseY, barX, barY) < CHECKER_RADIUS * 2) {
            selectedChecker = { pointIndex: -1, checkerIndex: 0 };
            calculateValidMoves(-1, dice);
            return;
        }
        
        return;  // Must move from bar
    }
    
    // Check if a checker was clicked
    for (let i = 0; i < board.length; i++) {
        let point = board[i];
        let pointX = getPointX(i);
        
        for (let j = 0; j < point.length; j++) {
            let checker = point[j];
            if (checker.color === playerColor) {
                let checkerY = getCheckerY(i, j);
                
                if (dist(mouseX, mouseY, pointX, checkerY) < CHECKER_RADIUS) {
                    selectedChecker = { pointIndex: i, checkerIndex: j };
                    calculateValidMoves(i, dice);
                    return;
                }
            }
        }
    }
}

function mouseReleased() {
    if (!canPlayerMove()) {
        selectedChecker = null;
        validMoves = [];
        combinedMoves = [];
        return;
    }
    
    if (!selectedChecker) return;
    
    // Check for win condition
    if (whiteBearOff.length === 15 || blackBearOff.length === 15) {
        selectedChecker = null;
        validMoves = [];
        combinedMoves = [];
        return;
    }
    
    let moved = false;
    let playerColor = currentPlayer === 'player1' ? 'white' : 'black';
    
    // Check valid moves (including combined moves)
    let allPossibleMoves = [...validMoves, ...combinedMoves.map(cm => cm.targetIndex)];
    
    for (let i = 0; i < allPossibleMoves.length; i++) {
        const pointIndex = allPossibleMoves[i];
        const isCombinedMove = i >= validMoves.length;
        
        // Handle bearing off
        if ((playerColor === 'white' && pointIndex === 24) || 
            (playerColor === 'black' && pointIndex === -1)) {
            
            let checker;
            
            if (selectedChecker.pointIndex === -1) {
                checker = playerColor === 'white' ? whiteBar.pop() : blackBar.pop();
            } else {
                checker = board[selectedChecker.pointIndex].splice(selectedChecker.checkerIndex, 1)[0];
            }
            
            if (playerColor === 'white') {
                whiteBearOff.push(checker);
                if (whiteBearOff.length === 15) {
                    gameStatus = "White wins the game!";
                    dice = [];
                    diceRolled = false;
                    selectedChecker = null;
                    validMoves = [];
                    combinedMoves = [];
                    moved = true;
                    break;
                } else {
                    gameStatus = 'White checker borne off!';
                }
            } else {
                blackBearOff.push(checker);
                if (blackBearOff.length === 15) {
                    gameStatus = "Black wins the game!";
                    dice = [];
                    diceRolled = false;
                    selectedChecker = null;
                    validMoves = [];
                    combinedMoves = [];
                    moved = true;
                    break;
                } else {
                    gameStatus = 'Black checker borne off!';
                }
            }
            
            // Handle dice removal
            if (isCombinedMove) {
                // Use both dice for combined move
                let combinedMove = combinedMoves[i - validMoves.length];
                // Remove the specific dice used
                let dieIndex1 = dice.indexOf(combinedMove.die1);
                if (dieIndex1 !== -1) dice.splice(dieIndex1, 1);
                
                let dieIndex2 = dice.indexOf(combinedMove.die2);
                if (dieIndex2 !== -1) dice.splice(dieIndex2, 1);
            } else {
                // Remove appropriate die
                if (dice.length > 0) {
                    dice.splice(0, 1);
                }
            }
            
            moved = true;
            break;
        }
        
        // Normal move within the board
        let pointX = getPointX(pointIndex);
        let pointY = getPointY(pointIndex);
        let pointTop = pointIndex < 12 ? pointY - POINT_HEIGHT : pointY;
        let pointBottom = pointIndex < 12 ? pointY : pointY + POINT_HEIGHT;
        
        if (mouseX >= pointX - POINT_WIDTH/2 && mouseX <= pointX + POINT_WIDTH/2 &&
            mouseY >= pointTop && mouseY <= pointBottom) {
            
            let checker;
            
            if (selectedChecker.pointIndex === -1) {
                checker = playerColor === 'white' ? whiteBar.pop() : blackBar.pop();
            } else {
                checker = board[selectedChecker.pointIndex].splice(selectedChecker.checkerIndex, 1)[0];
            }
            
            // Check if hitting opponent's checker
            if (board[pointIndex].length === 1 && board[pointIndex][0].color !== checker.color) {
                let hitChecker = board[pointIndex].pop();
                if (hitChecker.color === 'white') {
                    whiteBar.push(hitChecker);
                    gameStatus = "White checker was hit!";
                } else {
                    blackBar.push(hitChecker);
                    gameStatus = "Black checker was hit!";
                }
            }
            
            board[pointIndex].push(checker);
            
            // Handle dice removal for normal moves
            if (isCombinedMove) {
                // Use both dice for combined move
                let combinedMove = combinedMoves[i - validMoves.length];
                // Remove the specific dice used
                let dieIndex1 = dice.indexOf(combinedMove.die1);
                if (dieIndex1 !== -1) dice.splice(dieIndex1, 1);
                
                let dieIndex2 = dice.indexOf(combinedMove.die2);
                if (dieIndex2 !== -1) dice.splice(dieIndex2, 1);
            } else {
                // Remove one die
                if (dice.length > 0) {
                    dice.splice(0, 1);
                }
            }
            
            moved = true;
            
            if (gameStatus.indexOf("checker was hit") === -1 && 
                gameStatus.indexOf("borne off") === -1) {
                gameStatus = currentPlayer === 'player1' ? 
                    player1Name + ' made a move!' : player2Name + ' made a move!';
            }
            
            break;
        }
    }
    
    if (!moved && selectedChecker.pointIndex !== -1) {
        gameStatus = "Invalid move! Try again.";
    }
    
    // Check for win or end of turn
    if (moved) {
        // Check win condition
        if ((playerColor === 'white' && whiteBearOff.length === 15) ||
            (playerColor === 'black' && blackBearOff.length === 15)) {
            checkWinCondition();
        } else if (dice.length === 0 || !hasLegalMoves()) {
            // Switch player
            switchPlayer();
        }
        
        // Save game state after move
        if (typeof saveGameState === 'function') {
            saveGameState();
        }
        
        // Update UI
        if (typeof updateDiceDisplay === 'function') updateDiceDisplay();
        if (typeof updatePlayerInfo === 'function') updatePlayerInfo();
        if (typeof updateGameStatus === 'function') updateGameStatus();
    }
    
    selectedChecker = null;
    validMoves = [];
    combinedMoves = [];
}

// Game mechanics functions
function rollDice() {
    console.log("Roll dice called. diceRolled=", diceRolled, 
                "canPlayerMove=", canPlayerMove(), 
                "playerRole=", playerRole, 
                "currentPlayer=", currentPlayer);
                
    if (diceRolled) return;
    if (whiteBearOff.length === 15 || blackBearOff.length === 15) return;
    if (!canPlayerMove()) return;
    
    const die1 = Math.floor(Math.random() * 6) + 1;
    const die2 = Math.floor(Math.random() * 6) + 1;
    
    if (die1 === die2) {
        // For doubles, we get 4 moves
        dice = [die1, die1, die1, die1];
    } else {
        dice = [die1, die2];
    }
    
    diceRolled = true;
    
    // Update the dice display in UI
    if (typeof updateDiceDisplay === 'function') {
        updateDiceDisplay();
    } else {
        document.getElementById('dice1').textContent = die1;
        document.getElementById('dice2').textContent = die2;
        document.getElementById('roll-button').disabled = true;
    }
    
    gameStatus = currentPlayer === 'player1' ? 
        player1Name + " rolled " + die1 + " and " + die2 + "!" :
        player2Name + " rolled " + die1 + " and " + die2 + "!";
    
    if (typeof updateGameStatus === 'function') {
        updateGameStatus();
    } else {
        document.getElementById('game-status').textContent = gameStatus;
    }
    
    // Check if there are legal moves
    if (!hasLegalMoves()) {
        gameStatus = "No legal moves available. Switching players...";
        if (typeof updateGameStatus === 'function') {
            updateGameStatus();
        } else {
            document.getElementById('game-status').textContent = gameStatus;
        }
        
        // Auto switch player after short delay
        setTimeout(() => {
            switchPlayer();
        }, 2000);
    }
    
    // Save game state after rolling
    if (typeof saveGameState === 'function') {
        saveGameState();
    }
}

// Make rollDice globally accessible
window.rollDice = rollDice;

function switchPlayer() {
    currentPlayer = currentPlayer === 'player1' ? 'player2' : 'player1';
    diceRolled = false;
    gameStatus = currentPlayer === 'player1' ? 
        player1Name + "'s turn" : player2Name + "'s turn";
    
    if (typeof updateGameStatus === 'function') {
        updateGameStatus();
    } else {
        document.getElementById('game-status').textContent = gameStatus;
    }
    
    if (typeof updatePlayerInfo === 'function') {
        updatePlayerInfo();
    } else {
        // Highlight active player
        if (currentPlayer === 'player1') {
            document.getElementById('player1-card').classList.add('active');
            document.getElementById('player2-card').classList.remove('active');
        } else {
            document.getElementById('player1-card').classList.remove('active');
            document.getElementById('player2-card').classList.add('active');
        }
    }
    
    if (typeof updateDiceDisplay === 'function') {
        updateDiceDisplay();
    } else {
        document.getElementById('dice1').textContent = '-';
        document.getElementById('dice2').textContent = '-';
        document.getElementById('roll-button').disabled = !canPlayerMove();
    }
    
    // Save game state after switching players
    if (typeof saveGameState === 'function') {
        saveGameState();
    }
}
// Game logic continued

function calculateValidMoves(pointIndex, dice) {
    validMoves = [];
    combinedMoves = [];
    
    let playerColor = currentPlayer === 'player1' ? 'white' : 'black';
    let direction = currentPlayer === 'player1' ? 1 : -1;
    
    // Handle moves from the bar
    if ((playerColor === 'white' && whiteBar.length > 0) || 
        (playerColor === 'black' && blackBar.length > 0)) {
        
        if (pointIndex !== -1) {
            return;
        } else {
            for (let i = 0; i < dice.length; i++) {
                let die = dice[i];
                let entryPoint;
                
                if (playerColor === 'white') {
                    entryPoint = die - 1;
                } else {
                    entryPoint = 24 - die;
                }
                
                if (entryPoint >= 0 && entryPoint < 24) {
                    if (board[entryPoint].length === 0 || 
                        board[entryPoint][0].color === playerColor ||
                        (board[entryPoint].length === 1 && board[entryPoint][0].color !== playerColor)) {
                        validMoves.push(entryPoint);
                    }
                }
            }
        }
