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
                // Calculate which die was used
                let die;
                if (playerColor === 'white') {
                    if (selectedChecker.pointIndex === -1) {
                        // From bar
                        if (dice.length > 0) {
                            dice.splice(0, 1);
                        }
                    } else {
                        die = 24 - selectedChecker.pointIndex;
                        
                        // Find and remove the die that was used or the closest larger one
                        let dieIndex = dice.indexOf(die);
                        if (dieIndex !== -1) {
                            dice.splice(dieIndex, 1);
                        } else {
                            // Find smallest die larger than needed
                            let smallestLargerDie = 100;
                            let smallestLargerDieIndex = -1;
                            
                            for (let i = 0; i < dice.length; i++) {
                                if (dice[i] > die && dice[i] < smallestLargerDie) {
                                    smallestLargerDie = dice[i];
                                    smallestLargerDieIndex = i;
                                }
                            }
                            
                            if (smallestLargerDieIndex !== -1) {
                                dice.splice(smallestLargerDieIndex, 1);
                            } else if (dice.length > 0) {
                                dice.splice(0, 1);
                            }
                        }
                    }
                } else {
                    // Black player
                    if (selectedChecker.pointIndex === -1) {
                        // From bar
                        if (dice.length > 0) {
                            dice.splice(0, 1);
                        }
                    } else {
                        die = selectedChecker.pointIndex + 1;
                        
                        // Find and remove the die that was used or the closest larger one
                        let dieIndex = dice.indexOf(die);
                        if (dieIndex !== -1) {
                            dice.splice(dieIndex, 1);
                        } else {
                            // Find smallest die larger than needed
                            let smallestLargerDie = 100;
                            let smallestLargerDieIndex = -1;
                            
                            for (let i = 0; i < dice.length; i++) {
                                if (dice[i] > die && dice[i] < smallestLargerDie) {
                                    smallestLargerDie = dice[i];
                                    smallestLargerDieIndex = i;
                                }
                            }
                            
                            if (smallestLargerDieIndex !== -1) {
                                dice.splice(smallestLargerDieIndex, 1);
                            } else if (dice.length > 0) {
                                dice.splice(0, 1);
                            }
                        }
                    }
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
                // Calculate which die was used
                let die;
                if (selectedChecker.pointIndex === -1) {
                    die = playerColor === 'white' ? pointIndex + 1 : 24 - pointIndex;
                } else {
                    die = Math.abs(pointIndex - selectedChecker.pointIndex);
                }
                
                // Find and remove the die that was used
                let dieIndex = dice.indexOf(die);
                if (dieIndex !== -1) {
                    dice.splice(dieIndex, 1);
                }
            }
            
            moved = true;
            
            if (gameStatus.indexOf("checker was hit") === -1 && 
                gameStatus.indexOf("borne off") === -1) {
                gameStatus = currentPlayer === 'player1' ? 
                    hostName + ' made a move!' : guestName + ' made a move!';
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
        saveGameState();
        
        // Update UI
        updateDiceDisplay();
        updatePlayerInfo();
        updateGameStatus();
    }
    
    selectedChecker = null;
    validMoves = [];
    combinedMoves = [];
}

// Game mechanics functions
function rollDice() {
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
    updateDiceDisplay();
    
    gameStatus = currentPlayer === 'player1' ? 
        hostName + " rolled " + die1 + " and " + die2 + "!" :
        guestName + " rolled " + die1 + " and " + die2 + "!";
    
    updateGameStatus();
    
    // Check if there are legal moves
    if (!hasLegalMoves()) {
        gameStatus = "No legal moves available. Switching players...";
        updateGameStatus();
        
        // Auto switch player after short delay
        setTimeout(() => {
            switchPlayer();
        }, 2000);
    }
    
    // Save game state after rolling
    saveGameState();
}

function switchPlayer() {
    currentPlayer = currentPlayer === 'player1' ? 'player2' : 'player1';
    diceRolled = false;
    gameStatus = currentPlayer === 'player1' ? 
        hostName + "'s turn" : guestName + "'s turn";
    
    updateGameStatus();
    updatePlayerInfo();
    updateDiceDisplay();
}

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
        return;
    }
    
    // Check if player can bear off
    let canBearOff = canPlayerBearOff(playerColor);
    
    // Process each die
    for (let i = 0; i < dice.length; i++) {
        let die = dice[i];
        let targetIndex = pointIndex + (die * direction);
        
        // Check for bearing off
        if (canBearOff) {
            if (playerColor === 'white') {
                if (pointIndex >= 18) { // Only allow bearing off from home board
                    if (targetIndex >= 24 || (die > 24 - pointIndex && isValidBearOff(pointIndex, die, playerColor))) {
                        if (!validMoves.includes(24)) {
                            validMoves.push(24); // Special target index for bearing off
                        }
                        continue;
                    }
                }
            } else { // Black player
                if (pointIndex <= 5) { // Only allow bearing off from home board
                    if (targetIndex < 0 || (die > pointIndex + 1 && isValidBearOff(pointIndex, die, playerColor))) {
                        if (!validMoves.includes(-1)) {
                            validMoves.push(-1); // Special target index for bearing off
                        }
                        continue;
                    }
                }
            }
        }
        
        // Normal move within the board
        if (targetIndex >= 0 && targetIndex < 24) {
            let targetPoint = board[targetIndex];
            
            if (targetPoint.length === 0 ||
                (targetPoint.length > 0 && targetPoint[0].color === playerColor) ||
                (targetPoint.length === 1 && targetPoint[0].color !== playerColor)) {
                if (!validMoves.includes(targetIndex)) {
                    validMoves.push(targetIndex);
                }
            }
        }
    }
    
    // Calculate combined moves (using multiple dice)
    if (dice.length >= 2) {
        // Create an array of unique dice values
        let uniqueDice = [...new Set(dice)];
        
        if (uniqueDice.length >= 2) {
            // Test all combinations of two different dice
            for (let d1 = 0; d1 < uniqueDice.length - 1; d1++) {
                for (let d2 = d1 + 1; d2 < uniqueDice.length; d2++) {
                    let die1 = uniqueDice[d1];
                    let die2 = uniqueDice[d2];
                    
                    // Try die1 then die2
                    let intermediateIndex = pointIndex + (die1 * direction);
                    if (intermediateIndex >= 0 && intermediateIndex < 24) {
                        if (board[intermediateIndex].length === 0 ||
                            board[intermediateIndex][0].color === playerColor) {
                            
                            let finalIndex = intermediateIndex + (die2 * direction);
                            
                            // Check if this is a valid move
                            if (finalIndex >= 0 && finalIndex < 24) {
                                if (board[finalIndex].length === 0 ||
                                    board[finalIndex][0].color === playerColor ||
                                    (board[finalIndex].length === 1 && board[finalIndex][0].color !== playerColor)) {
                                    let alreadyAdded = combinedMoves.some(move => move.targetIndex === finalIndex);
                                    if (!alreadyAdded) {
                                        combinedMoves.push({
                                            targetIndex: finalIndex,
                                            die1: die1,
                                            die2: die2
                                        });
                                    }
                                }
                            } else if (canBearOff && 
                                    ((playerColor === 'white' && finalIndex >= 24) || 
                                    (playerColor === 'black' && finalIndex < 0))) {
                                // Valid bearing off with combined dice
                                if (isValidBearOff(intermediateIndex, die2, playerColor)) {
                                    let bearOffTarget = playerColor === 'white' ? 24 : -1;
                                    let alreadyAdded = combinedMoves.some(move => move.targetIndex === bearOffTarget);
                                    if (!alreadyAdded) {
                                        combinedMoves.push({
                                            targetIndex: bearOffTarget,
                                            die1: die1,
                                            die2: die2
                                        });
                                    }
                                }
                            }
                        }
                    }
                    
                    // Try die2 then die1 (opposite order)
                    intermediateIndex = pointIndex + (die2 * direction);
                    if (intermediateIndex >= 0 && intermediateIndex < 24) {
                        if (board[intermediateIndex].length === 0 ||
                            board[intermediateIndex][0].color === playerColor) {
                            
                            let finalIndex = intermediateIndex + (die1 * direction);
                            
                            // Check if this is a valid move
                            if (finalIndex >= 0 && finalIndex < 24) {
                                if (board[finalIndex].length === 0 ||
                                    board[finalIndex][0].color === playerColor ||
                                    (board[finalIndex].length === 1 && board[finalIndex][0].color !== playerColor)) {
                                    let alreadyAdded = combinedMoves.some(move => move.targetIndex === finalIndex);
                                    if (!alreadyAdded) {
                                        combinedMoves.push({
                                            targetIndex: finalIndex,
                                            die1: die2,
                                            die2: die1
                                        });
                                    }
                                }
                            } else if (canBearOff && 
                                    ((playerColor === 'white' && finalIndex >= 24) || 
                                    (playerColor === 'black' && finalIndex < 0))) {
                                // Valid bearing off with combined dice
                                if (isValidBearOff(intermediateIndex, die1, playerColor)) {
                                    let bearOffTarget = playerColor === 'white' ? 24 : -1;
                                    let alreadyAdded = combinedMoves.some(move => move.targetIndex === bearOffTarget);
                                    if (!alreadyAdded) {
                                        combinedMoves.push({
                                            targetIndex: bearOffTarget,
                                            die1: die2,
                                            die2: die1
                                        });
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

function isValidBearOff(pointIndex, die, playerColor) {
    // For white players (home board is 18-23)
    if (playerColor === 'white') {
        // Case 1: Exact roll (e.g., position 20 with die 4 = 24)
        if (pointIndex + die === 24) {
            return true;
        }
        
        // Case 2: Roll is higher than needed
        if (die > 24 - pointIndex) {
            // Verify this is the highest piece
            for (let i = 23; i > pointIndex; i--) {
                if (board[i] && board[i].length > 0 && board[i][0].color === 'white') {
                    // Not the highest piece, can't use larger die
                    return false;
                }
            }
            return true; // This is the highest piece, can use larger die
        }
        return false;
    } 
    // For black players (home board is 0-5)
    else {
        // Case 1: Exact roll (e.g., position 3 with die 4 = -1)
        if (pointIndex - die === -1) {
            return true;
        }
        
        // Case 2: Roll is higher than needed
        if (die > pointIndex + 1) {
            // Verify this is the highest piece
            for (let i = 0; i < pointIndex; i++) {
                if (board[i] && board[i].length > 0 && board[i][0].color === 'black') {
                    // Not the highest piece, can't use larger die
                    return false;
                }
            }
            return true; // This is the highest piece, can use larger die
        }
        return false;
    }
}

function canPlayerBearOff(playerColor) {
    let checkersOutside = 0;
    
    if (playerColor === 'white') {
        // White checkers must all be in home board (points 18-23)
        for (let i = 0; i < 18; i++) {
            for (let j = 0; j < board[i].length; j++) {
                if (board[i][j].color === 'white') {
                    checkersOutside++;
                }
            }
        }
        checkersOutside += whiteBar.length;
    } else {
        // Black checkers must all be in home board (points 0-5)
        for (let i = 6; i < 24; i++) {
            for (let j = 0; j < board[i].length; j++) {
                if (board[i][j].color === 'black') {
                    checkersOutside++;
                }
            }
        }
        checkersOutside += blackBar.length;
    }
    
    return checkersOutside === 0;
}

function hasLegalMoves() {
    let playerColor = currentPlayer === 'player1' ? 'white' : 'black';
    
    // Check if player has checkers on the bar
    if ((playerColor === 'white' && whiteBar.length > 0) || 
        (playerColor === 'black' && blackBar.length > 0)) {
        
        for (let i = 0; i < dice.length; i++) {
            let die = dice[i];
            let entryPoint = playerColor === 'white' ? die - 1 : 24 - die;
            
            if (entryPoint >= 0 && entryPoint < 24) {
                if (board[entryPoint].length === 0 || 
                    board[entryPoint][0].color === playerColor ||
                    (board[entryPoint].length === 1 && board[entryPoint][0].color !== playerColor)) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    // Check for bearing off
    let canBearOff = canPlayerBearOff(playerColor);
    if (canBearOff) {
        if (playerColor === 'white') {
            for (let i = 18; i <= 23; i++) {
                for (let j = 0; j < board[i].length; j++) {
                    if (board[i][j].color === 'white') {
                        for (let k = 0; k < dice.length; k++) {
                            let die = dice[k];
                            if (isValidBearOff(i, die, playerColor)) {
                                return true;
                            }
                        }
                    }
                }
            }
        } else {
            for (let i = 0; i <= 5; i++) {
                for (let j = 0; j < board[i].length; j++) {
                    if (board[i][j].color === 'black') {
                        for (let k = 0; k < dice.length; k++) {
                            let die = dice[k];
                            if (isValidBearOff(i, die, playerColor)) {
                                return true;
                            }
                        }
                    }
                }
            }
        }
    }
    
    // Check for regular moves
    for (let i = 0; i < 24; i++) {
        for (let j = 0; j < board[i].length; j++) {
            if (board[i][j].color === playerColor) {
                for (let k = 0; k < dice.length; k++) {
                    let die = dice[k];
                    let direction = playerColor === 'white' ? 1 : -1;
                    let targetIndex = i + (die * direction);
                    
                    if (targetIndex >= 0 && targetIndex < 24) {
                        if (board[targetIndex].length === 0 || 
                            board[targetIndex][0].color === playerColor ||
                            (board[targetIndex].length === 1 && board[targetIndex][0].color !== playerColor)) {
                            return true;
                        }
                    }
                }
            }
        }
    }
    
    return false;
}

function checkWinCondition() {
    if (whiteBearOff.length === 15) {
        gameStatus = hostName + " (White) wins the game!";
        diceRolled = false;
        dice = [];
        selectedChecker = null;
        validMoves = [];
        combinedMoves = [];
        updateGameStatus();
        return true;
    } 
    else if (blackBearOff.length === 15) {
        gameStatus = guestName + " (Black) wins the game!";
        diceRolled = false;
        dice = [];
        selectedChecker = null;
        validMoves = [];
        combinedMoves = [];
        updateGameStatus();
        return true;
    }
    return false;
}

// Check if current player can move
function canPlayerMove() {
    if (playerRole === "spectator") return false;
    if (playerRole === "host" && currentPlayer === "player1") return true;
    if (playerRole === "guest" && currentPlayer === "player2") return true;
    return false;
}
