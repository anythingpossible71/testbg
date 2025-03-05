// fix-loops.js - Add this as a separate script at the bottom of game.html
// This script fixes the infinite loop issues by adding safety measures

(function() {
    console.log("Loading backgammon infinite loop protections...");
    
    // -------------------------------
    // Global performance safeguards
    // -------------------------------
    
    // Prevent too many redraws
    const MAX_FPS = 30;
    let lastFrameTime = 0;
    
    // Store original draw function
    if (typeof window.draw === 'function' && !window.originalDraw) {
        window.originalDraw = window.draw;
        
        // Replace with rate-limited version
        window.draw = function() {
            const now = performance.now();
            if (now - lastFrameTime < 1000 / MAX_FPS) {
                return; // Skip this frame
            }
            lastFrameTime = now;
            
            try {
                window.originalDraw();
            } catch (error) {
                console.error("Error in draw function:", error);
            }
        };
    }
    
    // Prevent console log flood
    const MAX_LOGS_PER_SECOND = 5;
    const logThrottleMap = new Map();
    const originalConsoleLog = console.log;
    
    console.log = function(...args) {
        const now = Date.now();
        const message = args[0] || '';
        const messageKey = typeof message === 'string' ? message.substring(0, 50) : 'non-string-message';
        
        // Always log errors
        if (typeof message === 'string' && 
            (message.includes('error') || message.includes('Error') || 
             message.includes('exception') || message.includes('Exception'))) {
            return originalConsoleLog.apply(console, args);
        }
        
        // Check if we've logged this message recently
        const lastLog = logThrottleMap.get(messageKey);
        if (!lastLog || now - lastLog.time > 1000 / MAX_LOGS_PER_SECOND) {
            logThrottleMap.set(messageKey, { time: now, count: 1 });
            return originalConsoleLog.apply(console, args);
        } 
        
        // Update count but don't log
        const newCount = lastLog.count + 1;
        logThrottleMap.set(messageKey, { time: lastLog.time, count: newCount });
        
        // Every 100 skipped logs, show a summary
        if (newCount % 100 === 0) {
            originalConsoleLog.call(console, `[Skipped ${newCount} similar logs] ${message}`);
        }
    };
    
    // -------------------------------
    // Firebase safety measures
    // -------------------------------
    
    // Prevent Firebase update loops by throttling
    let lastSaveTime = 0;
    const MIN_SAVE_INTERVAL = 3000; // 3 seconds between saves
    
    // Safely override saveGameState function if it exists
    if (typeof window.saveGameState === 'function' && !window.originalSaveGameState) {
        window.originalSaveGameState = window.saveGameState;
        
        window.saveGameState = function() {
            const now = Date.now();
            if (now - lastSaveTime < MIN_SAVE_INTERVAL) {
                console.log("Skipping Firebase save (too soon)");
                return;
            }
            
            lastSaveTime = now;
            
            try {
                // Add a version number if not already there
                if (!window.gameStateVersion) {
                    window.gameStateVersion = 1;
                } else {
                    window.gameStateVersion++;
                }
                
                // Call original function
                window.originalSaveGameState();
            } catch (error) {
                console.error("Error in saveGameState:", error);
            }
        };
    }
    
    // -------------------------------
    // Roll dice protection
    // -------------------------------
    
    // Prevent roll dice loops and double-clicks
    let lastRollTime = 0;
    const MIN_ROLL_INTERVAL = 2000; // 2 seconds between rolls
    let isRolling = false;
    
    // Safely override rollDice function if it exists
    if (typeof window.rollDice === 'function' && !window.originalRollDice) {
        window.originalRollDice = window.rollDice;
        
        window.rollDice = function() {
            const now = Date.now();
            
            // Skip if already rolling or too soon after last roll
            if (isRolling || now - lastRollTime < MIN_ROLL_INTERVAL) {
                console.log("Skipping roll (in progress or too soon)");
                return;
            }
            
            isRolling = true;
            lastRollTime = now;
            
            try {
                window.originalRollDice();
            } catch (error) {
                console.error("Error in rollDice:", error);
            } finally {
                // Release the lock after a delay
                setTimeout(() => {
                    isRolling = false;
                }, 1000);
            }
        };
    }
    
    // -------------------------------
    // Button click protections
    // -------------------------------
    
    // Prevent double-clicks on buttons
    const safeAddClickHandler = function(buttonId, handler) {
        const button = document.getElementById(buttonId);
        if (!button) return;
        
        // Remove existing handlers by cloning
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        // Set click tracking
        let lastClickTime = 0;
        const MIN_CLICK_INTERVAL = 1000; // 1 second
        
        // Add new handler with throttling
        newButton.addEventListener('click', function(event) {
            const now = Date.now();
            if (now - lastClickTime < MIN_CLICK_INTERVAL) {
                console.log(`Ignoring rapid click on ${buttonId}`);
                event.preventDefault();
                event.stopPropagation();
                return false;
            }
            
            lastClickTime = now;
            return handler.call(this, event);
        });
        
        console.log(`Safe click handler added to ${buttonId}`);
    };
    
    // Wait for DOM to be loaded
    const initSafeHandlers = function() {
        // Safe roll button handler
        safeAddClickHandler('roll-button', function() {
            console.log("Roll button clicked (safe handler)");
            if (typeof window.rollDice === 'function') {
                window.rollDice();
            } else {
                console.error("rollDice function not found");
            }
        });
        
        // Safe join button handler
        safeAddClickHandler('join-button', function() {
            console.log("Join button clicked (safe handler)");
            const playerNameInput = document.getElementById('player-name-input');
            if (!playerNameInput) return;
            
            const playerName = playerNameInput.value.trim();
            if (!playerName) {
                alert('Please enter your name');
                return;
            }
            
            // Handle join logic based on URL
            const urlParams = new URLSearchParams(window.location.search);
            const playerNum = urlParams.get('playerNum');
            
            if (playerNum === '2' || window.location.href.includes('playerNum=2')) {
                // This is player 2
                window.player2Name = playerName;
                window.playerRole = "player2";
                
                // Update UI
                const playerJoinElement = document.getElementById('player-join');
                const gameControlsElement = document.getElementById('game-controls');
                const player2NameElement = document.getElementById('player2-name');
                
                if (playerJoinElement) playerJoinElement.classList.add('hidden');
                if (gameControlsElement) gameControlsElement.classList.remove('hidden');
                if (player2NameElement) player2NameElement.textContent = playerName;
            } else {
                // This is player 1
                window.player1Name = playerName;
                window.playerRole = "player1";
                
                // Update UI
                const nameEntryElement = document.getElementById('name-entry');
                const waitingMessageElement = document.getElementById('waiting-message');
                const joinTitleElement = document.getElementById('join-title');
                const player1NameElement = document.getElementById('player1-name');
                
                if (nameEntryElement) nameEntryElement.classList.add('hidden');
                if (waitingMessageElement) waitingMessageElement.classList.remove('hidden');
                if (joinTitleElement) joinTitleElement.textContent = `Welcome, ${playerName}!`;
                if (player1NameElement) player1NameElement.textContent = playerName;
            }
            
            // Save game state once with the updated player info
            setTimeout(function() {
                if (typeof window.saveGameState === 'function') {
                    window.saveGameState();
                }
            }, 500);
        });
    };
    
    // Execute when DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSafeHandlers);
    } else {
        // DOM already loaded, run now
        initSafeHandlers();
    }
    
    // -------------------------------
    // Mouse event protection
    // -------------------------------
    
    // Prevent too many mouse events
    let lastMouseEvent = 0;
    const MIN_MOUSE_INTERVAL = 100; // 100ms between mouse events
    
    // Safe wrappers for mouse functions
    if (typeof window.mousePressed === 'function' && !window.originalMousePressed) {
        window.originalMousePressed = window.mousePressed;
        
        window.mousePressed = function() {
            const now = Date.now();
            if (now - lastMouseEvent < MIN_MOUSE_INTERVAL) {
                return; // Skip if too frequent
            }
            lastMouseEvent = now;
            
            try {
                window.originalMousePressed();
            } catch (error) {
                console.error("Error in mousePressed:", error);
            }
        };
    }
    
    if (typeof window.mouseReleased === 'function' && !window.originalMouseReleased) {
        window.originalMouseReleased = window.mouseReleased;
        
        window.mouseReleased = function() {
            const now = Date.now();
            if (now - lastMouseEvent < MIN_MOUSE_INTERVAL) {
                return; // Skip if too frequent
            }
            lastMouseEvent = now;
            
            try {
                window.originalMouseReleased();
            } catch (error) {
                console.error("Error in mouseReleased:", error);
            }
        };
    }
    
    // -------------------------------
    // Setup execution protection
    // -------------------------------
    
    // Ensure setup only runs once
    let setupExecuted = false;
    
    if (typeof window.setup === 'function' && !window.originalSetup) {
        window.originalSetup = window.setup;
        
        window.setup = function() {
            if (setupExecuted) {
                console.log("Setup already executed, skipping");
                return;
            }
            
            setupExecuted = true;
            console.log("Running setup once");
            
            try {
                window.originalSetup();
            } catch (error) {
                console.error("Error in setup:", error);
            }
        };
    }
    
    // Set a limit on the framerate for p5.js if available
    if (typeof frameRate === 'function') {
        try {
            frameRate(30);
            console.log("Frame rate limited to 30 FPS");
        } catch (e) {
            console.warn("Could not limit frame rate:", e);
        }
    }
    
    console.log("Backgammon infinite loop protections installed successfully");
})();
