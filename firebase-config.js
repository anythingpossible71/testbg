// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDxzet1iGv7p-8mfRi9tNfJvdEdPmkzdk",
  authDomain: "backgammon-multiplayer.firebaseapp.com",
  projectId: "backgammon-multiplayer",
  storageBucket: "backgammon-multiplayer.firebasestorage.app",
  messagingSenderId: "1044672583667",
  appId: "1:1044672583667:web:dd3a7443903685f38e486",
  databaseURL: "https://backgammon-multiplayer-default-rtdb.firebaseio.com"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Generate a unique game ID
function generateUniqueId() {
    return 'game_' + Math.random().toString(36).substr(2, 9);
}

// Function to prepare data for Firebase (preventing circular references)
function prepareGameDataForSaving(gameData) {
    // Create a deep copy without circular references
    const safeData = {};
    
    // Handle the board specially - convert to a simple format
    if (gameData.board) {
        safeData.board = [];
        for (let i = 0; i < gameData.board.length; i++) {
            const point = gameData.board[i] || [];
            safeData.board[i] = [];
            for (let j = 0; j < point.length; j++) {
                // Only store the color of each checker
                safeData.board[i].push({
                    color: point[j].color
                });
            }
        }
    }
    
    // Copy other properties directly
    for (const key in gameData) {
        if (key !== 'board') {
            safeData[key] = gameData[key];
        }
    }
    
    return safeData;
}

// Save game state to Firebase
function saveGameState() {
    if (typeof debugLog === 'function') {
        debugLog("Saving game state for game:", gameId);
    } else {
        console.log("[DEBUG] Saving game state for game:", gameId);
    }
    
    if (!gameId) {
        console.log("[DEBUG] No game ID, cannot save state");
        return;
    }
    
    try {
        const gameData = {
            board: board,
            whiteBar: whiteBar,
            blackBar: blackBar,
            whiteBearOff: whiteBearOff,
            blackBearOff: blackBearOff,
            currentPlayer: currentPlayer,
            dice: dice,
            diceRolled: diceRolled,
            gameStatus: gameStatus,
            player1Name: player1Name,
            player2Name: player2Name,
            gameStarted: gameStarted,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        };
        
        // Use the serializer to prepare safe data
        const safeData = prepareGameDataForSaving(gameData);
        
        if (typeof debugLog === 'function') {
            debugLog("Saving data to Firebase");
        }
        
        firebase.database().ref('games/' + gameId).update(safeData)
            .then(() => {
                if (typeof debugLog === 'function') {
                    debugLog("Game state saved successfully");
                } else {
                    console.log("[DEBUG] Game state saved successfully");
                }
            })
            .catch((error) => {
                console.error("Error saving game state:", error);
            });
    } catch (error) {
        console.error("Error preparing game state for saving:", error);
    }
}

// Load existing game state from Firebase
function loadGameState() {
    if (typeof debugLog === 'function') {
        debugLog("Loading game state for game:", gameId);
    } else {
        console.log("[DEBUG] Loading game state for game:", gameId);
    }
    
    if (!gameId) {
        console.log("[DEBUG] No game ID, cannot load state");
        return;
    }
    
    firebase.database().ref('games/' + gameId).once('value')
        .then((snapshot) => {
            const gameData = snapshot.val();
            if (!gameData) {
                if (typeof debugLog === 'function') {
                    debugLog("No game data found for ID:", gameId);
                } else {
                    console.log("[DEBUG] No game data found for ID:", gameId);
                }
                return;
            }
            
            if (typeof debugLog === 'function') {
                debugLog("Loaded game data");
            }
            
            // Update local game state with Firebase data
            updateGameFromFirebase(gameData);
        })
        .catch((error) => {
            console.error("Error loading game state:", error);
        });
}

// Listen for game state changes
function listenForGameChanges(gameId) {
    if (typeof debugLog === 'function') {
        debugLog("Setting up listener for game changes:", gameId);
    } else {
        console.log("[DEBUG] Setting up listener for game changes:", gameId);
    }
    
    if (!gameId) {
        console.log("[DEBUG] No game ID, cannot listen for changes");
        return;
    }
    
    firebase.database().ref('games/' + gameId).on('value', (snapshot) => {
        const gameData = snapshot.val();
        if (!gameData) {
            if (typeof debugLog === 'function') {
                debugLog("No game data found for ID:", gameId);
            } else {
                console.log("[DEBUG] No game data found for ID:", gameId);
            }
            return;
        }
        
        // Only update if there's a change and it's not likely from our own action
        if (!window.lastUpdateTimestamp || gameData.timestamp > window.lastUpdateTimestamp + 100) { // 100ms buffer
            if (typeof debugLog === 'function') {
                debugLog("Received updated game state");
            } else {
                console.log("[DEBUG] Received updated game state");
            }
            
            // Update local game state with Firebase data
            updateGameFromFirebase(gameData);
            
            window.lastUpdateTimestamp = gameData.timestamp;
        } else {
            if (typeof debugLog === 'function') {
                debugLog("Ignoring own update");
            } else {
                console.log("[DEBUG] Ignoring own update");
            }
        }
    });
}

// Force game to start
function forceStartGame() {
    console.log("Force starting the game with players:", player1Name, player2Name);
    
    // Ensure we have a board
    if (!board || board.length === 0) {
        if (typeof initializeBoard === 'function') {
            initializeBoard();
        }
    }
    
    // Set game state
    gameStarted = true;
    currentPlayer = 'player1';
    
    // Update UI
    if (document.getElementById('player-join')) {
        document.getElementById('player-join').classList.add('hidden');
    }
    if (document.getElementById('game-controls')) {
        document.getElementById('game-controls').classList.remove('hidden');
    }
    
    // Update game status
    gameStatus = player1Name + "'s turn to roll";
    if (document.getElementById('game-status')) {
        document.getElementById('game-status').textContent = gameStatus;
    }
    
    // Enable roll button for player 1
    if (currentPlayer === 'player1' && playerRole === 'player1') {
        const rollButton = document.getElementById('roll-button');
        if (rollButton) rollButton.disabled = false;
    }
    
    // Save the state
    if (typeof saveGameState === 'function') {
        saveGameState();
    }
    
    console.log("Game forcefully started");
}

// Update game state from Firebase data
function updateGameFromFirebase(gameData) {
    try {
        // Update player names if they exist
        if (gameData.player1Name) {
            player1Name = gameData.player1Name;
            const p1NameEl = document.getElementById('player1-name');
            if (p1NameEl) p1NameEl.textContent = player1Name;
            
            if (typeof debugLog === 'function') {
                debugLog("Updated player1Name:", player1Name);
            }
        }
        
        if (gameData.player2Name) {
            player2Name = gameData.player2Name;
            const p2NameEl = document.getElementById('player2-name');
            if (p2NameEl) p2NameEl.textContent = player2Name;
            
            if (typeof debugLog === 'function') {
                debugLog("Updated player2Name:", player2Name);
            }
        }
        
        // If both players have joined, force start the game
        if (player1Name !== "Player 1" && player2Name !== "Player 2") {
            forceStartGame();
        }
        
        // If player 2 joined, update UI accordingly
        if (playerRole === "player1" && gameData.player2Name && 
            gameData.player2Name !== "Player 2") {
            
            if (typeof debugLog === 'function') {
                debugLog("Player 2 has joined, showing game for player 1");
            }
            
            // Hide waiting message and show game controls
            const playerJoin = document.getElementById('player-join');
            const gameControls = document.getElementById('game-controls');
            if (playerJoin) playerJoin.classList.add('hidden');
            if (gameControls) gameControls.classList.remove('hidden');
            
            // Force game to start
            forceStartGame();
        }
        
        // If game has started, update game state
        if (gameData.gameStarted) {
            gameStarted = true;
            
            // Update game state variables
            if (gameData.board) board = gameData.board;
            if (gameData.whiteBar) whiteBar = gameData.whiteBar;
            if (gameData.blackBar) blackBar = gameData.blackBar;
            if (gameData.whiteBearOff) whiteBearOff = gameData.whiteBearOff;
            if (gameData.blackBearOff) blackBearOff = gameData.blackBearOff;
            if (gameData.currentPlayer) currentPlayer = gameData.currentPlayer;
            if (gameData.dice) dice = gameData.dice;
            if (gameData.diceRolled !== undefined) diceRolled = gameData.diceRolled;
            if (gameData.gameStatus) gameStatus = gameData.gameStatus;
            
            // Debug log for the most critical states
            if (typeof debugLog === 'function') {
                debugLog("Updated from Firebase:", {
                    currentPlayer: currentPlayer,
                    diceRolled: diceRolled,
                    gameStatus: gameStatus
                });
            }
            
            // Update UI elements
            if (typeof updatePlayerInfo === 'function') updatePlayerInfo();
            if (typeof updateDiceDisplay === 'function') updateDiceDisplay();
            if (typeof updateGameStatus === 'function') updateGameStatus();
        }
    } catch (error) {
        console.error("Error updating game from Firebase:", error);
    }
}

// Make these functions globally accessible
window.saveGameState = saveGameState;
window.loadGameState = loadGameState;
window.listenForGameChanges = listenForGameChanges;
window.updateGameFromFirebase = updateGameFromFirebase;
window.generateUniqueId = generateUniqueId;
window.forceStartGame = forceStartGame;

console.log("Firebase configuration loaded successfully");
