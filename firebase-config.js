// Firebase configuration
// Replace with your Firebase project config
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    databaseURL: "YOUR_DATABASE_URL",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase - Uncomment when you add your Firebase configuration
// firebase.initializeApp(firebaseConfig);
// const database = firebase.database();

// Generate a unique game ID (for demonstration)
function generateUniqueId() {
    return 'game_' + Math.random().toString(36).substr(2, 9);
}

// Save game state to Firebase
function saveGameState() {
    console.log("Saving game state for game:", gameId);
    
    // For Firebase implementation, uncomment this when Firebase is configured
    /*
    if (!gameId) return;
    
    firebase.database().ref('games/' + gameId).update({
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
    });
    */
}

// Load existing game state from Firebase
function loadGameState() {
    console.log("Loading game state for game:", gameId);
    
    // For Firebase implementation, uncomment this when Firebase is configured
    /*
    if (!gameId) return;
    
    firebase.database().ref('games/' + gameId).once('value').then((snapshot) => {
        const gameData = snapshot.val();
        if (!gameData) return;
        
        // Update local game state with Firebase data
        updateGameFromFirebase(gameData);
    });
    */
}

// Listen for game state changes
function listenForGameChanges(gameId) {
    console.log("Setting up listener for game changes:", gameId);
    
    // For Firebase implementation, uncomment this when Firebase is configured
    /*
    if (!gameId) return;
    
    firebase.database().ref('games/' + gameId).on('value', (snapshot) => {
        const gameData = snapshot.val();
        if (!gameData) return;
        
        // Only update if there's a change and it's not likely from our own action
        if (gameData.timestamp > window.lastUpdateTimestamp) {
            console.log("Received updated game state:", gameData);
            
            // Update local game state with Firebase data
            updateGameFromFirebase(gameData);
            
            window.lastUpdateTimestamp = gameData.timestamp;
        }
    });
    */
}

// Update game state from Firebase data
function updateGameFromFirebase(gameData) {
    // Update player names if they exist
    if (gameData.player1Name) {
        player1Name = gameData.player1Name;
        const p1NameEl = document.getElementById('player1-name');
        if (p1NameEl) p1NameEl.textContent = player1Name;
    }
    
    if (gameData.player2Name) {
        player2Name = gameData.player2Name;
        const p2NameEl = document.getElementById('player2-name');
        if (p2NameEl) p2NameEl.textContent = player2Name;
    }
    
    // If player 2 joined, update UI accordingly
    if (playerRole === "player1" && gameData.player2Name && 
        gameData.player2Name !== "Player 2") {
        // Hide waiting message and show game controls
        const playerJoin = document.getElementById('player-join');
        const gameControls = document.getElementById('game-controls');
        if (playerJoin) playerJoin.classList.add('hidden');
        if (gameControls) gameControls.classList.remove('hidden');
        
        // Start game if not already started
        if (!gameStarted && typeof startGame === 'function') {
            startGame();
        }
    }
    
    // If game has started, update game state
    if (gameData.gameStarted) {
        board = gameData.board;
        whiteBar = gameData.whiteBar || [];
        blackBar = gameData.blackBar || [];
        whiteBearOff = gameData.whiteBearOff || [];
        blackBearOff = gameData.blackBearOff || [];
        currentPlayer = gameData.currentPlayer;
        dice = gameData.dice || [];
        diceRolled = gameData.diceRolled || false;
        gameStatus = gameData.gameStatus;
        gameStarted = true;
        
        // Update UI elements
        if (typeof updatePlayerInfo === 'function') updatePlayerInfo();
        if (typeof updateDiceDisplay === 'function') updateDiceDisplay();
        if (typeof updateGameStatus === 'function') updateGameStatus();
    }
}
