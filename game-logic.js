// Game Logic Functions

// Mouse interaction functions
function mousePressed() {
    debugLog("Mouse pressed");
    
    // Only allow player to interact if it's their turn
    if (!canPlayerMove()) {
        debugLog("Cannot move - not your turn");
        return;
    }
    
    if (!diceRolled) {
        debugLog("Dice not rolled yet");
        return;
    }
    if (mouseY > BOARD_HEIGHT) {
        debugLog("Mouse outside board area");
        return;
    }
    
    let playerColor = currentPlayer === 'player1' ? 'white' : 'black';
    debugLog("Player color:", playerColor);
    
    // Check if player has checkers on the bar
    if ((playerColor === 'white' && whiteBar.length > 0) || 
        (playerColor === 'black' && blackBar.length > 0)) {
        
        let barX = BOARD_WIDTH / 2 + BEAR_OFF_WIDTH;
        let barY = playerColor === 'white' ? BOARD_HEIGHT / 4 : BOARD_HEIGHT * 3/4;
        
        if (dist(mouseX, mouseY, barX, barY) < CHECKER_RADIUS * 2) {
            selectedChecker = { pointIndex: -1, checkerIndex: 0 };
            calculateValidMoves(-1, dice);
            debugLog("Selected checker from bar");
            return;
        }
        
        debugLog("Must move from bar");
        return;  // Must move from bar
    }
    
    // Check if a checker was clicked
    for (let i = 0; i < board.length; i++) {
        if (!board[i]) continue; // Skip if point is undefined
        
        let point = board[i];
        let pointX = getPointX(i);
        
        for (let j = 0; j < point.length; j++) {
            let checker = point[j];
            if (checker.color === playerColor) {
                let checkerY = getCheckerY(i, j);
                
                if (dist(mouseX, mouseY, pointX, checkerY) < CHECKER_RADIUS) {
                    selectedChecker = { pointIndex: i, checkerIndex: j };
                    calculateValidMoves(i, dice);
                    debugLog("Selected checker at point", { point: i, checker: j });
                    return;
                }
            }
        }
    }
    
    debugLog("No checker selected");
}

function mouseReleased() {
    debugLog("Mouse released");
    
    if (!canPlayerMove()) {
        debugLog("Cannot move - not your turn");
        selectedChecker = null;
        validMoves = [];
        combinedMoves = [];
        return;
    }
    
    if (!selectedChecker) {
        debugLog("No checker selected");
        return;
    }
    
    // Check for win condition
    if (whiteBearOff.length === 15 || blackBearOff.length === 15) {
        debugLog("Game already won");
        selectedChecker = null;
        validMoves = [];
        combinedMoves = [];
        return;
    }
    
    let moved = false;
    let playerColor = currentPlayer === 'player1' ? 'white' : 'black';
    
    // Check valid moves (including combined moves)
    let allPossibleMoves = [...validMoves];
    let combinedMoveIndices = [];
    
    // Add combined move target indices
    for (let i = 0; i < combinedMoves.length; i++) {
        allPossibleMoves.push(combinedMoves[i].targetIndex);
        combinedMoveIndices.push(allPossibleMoves.length - 1);
    }
    
    debugLog("Checking possible moves:", { validMoves: validMoves, combinedMoves: combinedMoves });
    
    for (let i = 0; i < allPossibleMoves.length; i++) {
        const pointIndex = allPossibleMoves[i];
        const isCombinedMove = combinedMoveIndices.includes(i);
        
        // Handle bearing off
        if ((playerColor === 'white' && pointIndex === 24) || 
            (playerColor === 'black' && pointIndex === -1)) {
            
            let checker;
            
            if (selectedChecker.pointIndex === -1) {
                checker = playerColor === 'white' ? whiteBar.pop() : blackBar.pop();
                debugLog("Taking checker from bar for bearing off");
            } else {
                checker = board[selectedChecker.pointIndex].splice(selectedChecker.checkerIndex, 1)[0];
                debugLog("Taking checker from point for bearing off:", selectedChecker.pointIndex);
            }
            
            if (playerColor === 'white') {
                whiteBearOff.push(checker);
                debugLog("White checker borne off, total:", whiteBearOff.length);
                
                if (whiteBearOff.length === 15) {
                    gameStatus = player1Name + " wins the game!";
                    dice = [];
                    diceRolled = false;
                    selectedChecker = null;
                    validMoves = [];
                    combinedMoves = [];
                    moved = true;
                    
                    debugLog("White wins the game!");
                    // Save final game state
                    if (typeof saveGameState === 'function') {
                        saveGameState();
                    }
                    break;
                } else {
                    gameStatus = 'White checker borne off!';
                }
            } else {
                blackBearOff.push(checker);
                debugLog("Black checker borne off, total:", blackBearOff.length);
                
                if (blackBearOff.length === 15) {
                    gameStatus = player2Name + " wins the game!";
                    dice = [];
                    diceRolled = false;
                    selectedChecker = null;
                    validMoves = [];
                    combinedMoves = [];
                    moved = true;
                    
                    debugLog("Black wins the game!");
                    // Save final game state
                    if (typeof saveGameState === 'function') {
                        saveGameState();
                    }
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
                
                debugLog("Used combined dice:", combinedMove.die1, combinedMove.die2);
            } else {
                // Remove appropriate die
                if (dice.length > 0) {
                    dice.splice(0, 1);
                    debugLog("Used one die for bearing off, remaining dice:", dice);
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
                debugLog("Moving checker from bar to point:", pointIndex);
            } else {
                checker = board[selectedChecker.pointIndex].splice(selectedChecker.checkerIndex, 1)[0];
                debugLog("Moving checker from point", selectedChecker.pointIndex, "to point", pointIndex);
            }
            
            // Check if hitting opponent's checker
            if (board[pointIndex].length === 1 && board[pointIndex][0].color !== checker.color) {
                let hitChecker = board[pointIndex].pop();
                if (hitChecker.color === 'white') {
                    whiteBar.push(hitChecker);
                    gameStatus = "White checker was hit!";
                    debugLog("White checker was hit and moved to bar");
                } else {
                    blackBar.push(hitChecker);
                    gameStatus = "Black checker was hit!";
                    debugLog("Black checker was hit and moved to bar");
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
                
                debugLog("Used combined dice:", combinedMove.die1, combinedMove.die2);
            } else {
                // Remove one die
                if (dice.length > 0) {
                    // Calculate which die was used
                    let die;
                    if (selectedChecker.pointIndex === -1) {
                        // From bar
                        die = playerColor === 'white' ? pointIndex + 1 : 24 - pointIndex;
                    } else {
                        // Normal move
                        die = Math.abs(pointIndex - selectedChecker.pointIndex);
                    }
                    
                    // Find and remove the die that was used
                    let dieIndex = dice.indexOf(die);
                    if (dieIndex !== -1) {
                        dice.splice(dieIndex, 1);
                        debugLog("Used die:", die);
                    } else {
                        // If exact die not found, use first available die
                        debugLog("No exact die match, using first available die:", dice[0]);
                        dice.splice(0, 1);
                    }
                    
                    debugLog("Remaining dice:", dice);
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
        debugLog("Invalid move attempted");
    }
    
    // Check for win or end of turn
    if (moved) {
        debugLog("Move completed, checking game state");
        
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
    debugLog("Roll dice called. diceRolled=", diceRolled, 
                "canPlayerMove=", canPlayerMove(), 
                "playerRole=", playerRole, 
                "currentPlayer=", currentPlayer);
                
    if (diceRolled) {
        debugLog("Dice already rolled, ignoring");
        return;
    }
    if (whiteBearOff.length === 15 || blackBearOff.length === 15) {
        debugLog("Game already won, ignoring dice roll");
        return;
    }
    if (!canPlayerMove()) {
        debugLog("Not your turn, ignoring dice roll");
        return;
    }
    
    debugLog("Rolling dice for player:", currentPlayer);
    
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
function switchPlayer() {
    debugLog("Switching player from", currentPlayer);
    
    currentPlayer = currentPlayer === 'player1' ? 'player2' : 'player1';
    diceRolled = false;
    gameStatus = currentPlayer === 'player1' ? 
        player1Name + "'s turn" : player2Name + "'s turn";
    
    debugLog("Switched to player", currentPlayer);
    
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

function calculateValidMoves(pointIndex, dice) {
    validMoves = [];
    combinedMoves = [];
    
    let playerColor = currentPlayer === 'player1' ? 'white' : 'black';
    let direction = currentPlayer === 'player1' ? 1 : -1;
    
    debugLog("Calculating valid moves for point", pointIndex, "with dice", dice);
    
    // Handle moves from the bar
    if ((playerColor === 'white' && whiteBar.length > 0) || 
        (playerColor === 'black' && blackBar.length > 0)) {
        
        if (pointIndex !== -1) {
            debugLog("Must move from bar first");
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
                        debugLog("Valid bar entry point:", entryPoint);
                    }
                }
            }
        }
        return;
    }
    
    // Check if player can bear off
    let canBearOff = canPlayerBearOff(playerColor);
    debugLog("Can player bear off:", canBearOff);
    
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
                            debugLog("Valid bearing off move for white");
                        }
                        continue;
                    }
                }
            } else { // Black player
                if (pointIndex <= 5) { // Only allow bearing off from home board
                    if (targetIndex < 0 || (die > pointIndex + 1 && isValidBearOff(pointIndex, die, playerColor))) {
                        if (!validMoves.includes(-1)) {
                            validMoves.push(-1); // Special target index for bearing off
                            debugLog("Valid bearing off move for black");
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
                    debugLog("Valid normal move to point:", targetIndex);
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
                                        debugLog("Valid combined move to point:", finalIndex);
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
                                        debugLog("Valid combined bearing off move");
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
                                        debugLog("Valid combined move (reverse order) to point:", finalIndex);
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
                                        debugLog("Valid combined bearing off move (reverse order)");
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    
    debugLog("Valid moves calculated:", { normal: validMoves, combined: combinedMoves });
}
function isValidBearOff(pointIndex, die, playerColor) {
    debugLog("Checking if bearing off is valid for point", pointIndex, "with die", die);
    
    // For white players (home board is 18-23)
    if (playerColor === 'white') {
        // Case 1: Exact roll (e.g., position 20 with die 4 = 24)
        if (pointIndex + die === 24) {
            debugLog("Exact die roll for bearing off white");
            return true;
        }
        
        // Case 2: Roll is higher than needed
        if (die > 24 - pointIndex) {
            // Verify this is the highest piece
            for (let i = 23; i > pointIndex; i--) {
                if (board[i] && board[i].length > 0 && board[i][0].color === 'white') {
                    // Not the highest piece, can't use larger die
                    debugLog("Not the highest white piece, can't bear off with larger die");
                    return false;
                }
            }
            debugLog("This is the highest white piece, can bear off with larger die");
            return true; // This is the highest piece, can use larger die
        }
        return false;
    } 
    // For black players (home board is 0-5)
    else {
        // Case 1: Exact roll (e.g., position 3 with die 4 = -1)
        if (pointIndex - die === -1) {
            debugLog("Exact die roll for bearing off black");
            return true;
        }
        
        // Case 2: Roll is higher than needed
        if (die > pointIndex + 1) {
            // Verify this is the highest piece
            for (let i = 0; i < pointIndex; i++) {
                if (board[i] && board[i].length > 0 && board[i][0].color === 'black') {
                    // Not the highest piece, can't use larger die
                    debugLog("Not the highest black piece, can't bear off with larger die");
                    return false;
                }
            }
            debugLog("This is the highest black piece, can bear off with larger die");
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
            if (!board[i]) continue;
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
            if (!board[i]) continue;
            for (let j = 0; j < board[i].length; j++) {
                if (board[i][j].color === 'black') {
                    checkersOutside++;
                }
            }
        }
        checkersOutside += blackBar.length;
    }
    
    debugLog("Checkers outside home board:", checkersOutside);
    return checkersOutside === 0;
}

function hasLegalMoves() {
    let playerColor = currentPlayer === 'player1' ? 'white' : 'black';
    debugLog("Checking if player has legal moves. Color:", playerColor);
    
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
                    debugLog("Legal move from bar found");
                    return true;
                }
            }
        }
        
        debugLog("No legal moves from bar");
        return false;
    }
    
    // Check for bearing off
    let canBearOff = canPlayerBearOff(playerColor);
    if (canBearOff) {
        debugLog("Player can bear off, checking if there are legal bearing off moves");
        if (playerColor === 'white') {
            for (let i = 18; i <= 23; i++) {
                if (!board[i]) continue;
                for (let j = 0; j < board[i].length; j++) {
                    if (board[i][j].color === 'white') {
                        for (let k = 0; k < dice.length; k++) {
                            let die = dice[k];
                            if (isValidBearOff(i, die, playerColor)) {
                                debugLog("Legal bearing off move found for white");
                                return true;
                            }
                        }
                    }
                }
            }
        } else {
            for (let i = 0; i <= 5; i++) {
                if (!board[i]) continue;
                for (let j = 0; j < board[i].length; j++) {
                    if (board[i][j].color === 'black') {
                        for (let k = 0; k < dice.length; k++) {
                            let die = dice[k];
                            if (isValidBearOff(i, die, playerColor)) {
                                debugLog("Legal bearing off move found for black");
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
        if (!board[i]) continue;
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
                            debugLog("Legal regular move found from point", i, "to", targetIndex);
                            return true;
                        }
                    }
                }
            }
        }
    }
    
    debugLog("No legal moves found");
    return false;
}
function checkWinCondition() {
    if (whiteBearOff.length === 15) {
        gameStatus = player1Name + " (White) wins the game!";
        diceRolled = false;
        dice = [];
        selectedChecker = null;
        validMoves = [];
        combinedMoves = [];
        
        debugLog("White wins the game!");
        updateGameStatus();
        
        // Save final game state
        if (typeof saveGameState === 'function') {
            saveGameState();
        }
        
        return true;
    } 
    else if (blackBearOff.length === 15) {
        gameStatus = player2Name + " (Black) wins the game!";
        diceRolled = false;
        dice = [];
        selectedChecker = null;
        validMoves = [];
        combinedMoves = [];
        
        debugLog("Black wins the game!");
        updateGameStatus();
        
        // Save final game state
        if (typeof saveGameState === 'function') {
            saveGameState();
        }
        
        return true;
    }
    return false;
}

// Check if current player can move
function canPlayerMove() {
    debugLog("Can player move check:", { playerRole: playerRole, currentPlayer: currentPlayer });
    
    if (typeof playerRole === 'undefined') return false;
    if (playerRole === "spectator") return false;
    if (playerRole === "player1" && currentPlayer === "player1") return true;
    if (playerRole === "player2" && currentPlayer === "player2") return true;
    
    return false;
}

// Event listeners for mouse interactions
document.addEventListener('mousePressed', mousePressed);
document.addEventListener('mouseReleased', mouseReleased);

// Make these functions globally accessible
window.rollDice = rollDice;
window.switchPlayer = switchPlayer;
window.calculateValidMoves = calculateValidMoves;
window.isValidBearOff = isValidBearOff;
window.canPlayerBearOff = canPlayerBearOff;
window.hasLegalMoves = hasLegalMoves;
window.checkWinCondition = checkWinCondition;
window.canPlayerMove = canPlayerMove;

// Debug function to log board state
function debugBoard() {
    console.log("===== BOARD STATE =====");
    
    // Log white bar
    console.log("White Bar:", whiteBar.length);
    
    // Log white bear off
    console.log("White Bear Off:", whiteBearOff.length);
    
    // Log points 0-23
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
    
    // Log black bar
    console.log("Black Bar:", blackBar.length);
    
    // Log black bear off
    console.log("Black Bear Off:", blackBearOff.length);
    
    console.log("=======================");
}

// Add a global debug board function
window.debugBoard = debugBoard;

// Log that the game logic has been loaded
debugLog("Game logic loaded successfully");
