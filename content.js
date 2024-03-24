

async function findGameStatus(gameId) {
    try {
        const response = await fetch("https://cdn.nba.com/static/json/liveData/scoreboard/todaysScoreboard_00.json", {
            "headers": {
                "accept": "*/*",
                "accept-language": "en-US,en;q=0.9",
                // Include other headers as necessary
            },
            "method": "GET",
            "mode": "cors",
            "credentials": "omit"
        });

        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }

        const data = await response.json();
        const games = data.scoreboard.games;

        const game = games.find(g => g.gameId === gameId);
        if (game) {
            //console.log(`Game ID: ${gameId}, Status: ${game.gameStatusText}`);
            return game.gameStatusText;
        } else {
            console.log("Game not found.");
            return "Game not found.";
        }
    } catch (error) {
        console.error("There was an error fetching the game data:", error);
    }
}



// This function extracts the game ID from the NBA game page URL
function extractGameIdFromURL() {
    const gameIdPattern = /\/game\/[a-z\-]+(\d{10})/i;
    const match = window.location.href.match(gameIdPattern);
    return match ? match[1] : null;
}

const GAME_ID = extractGameIdFromURL();
console.log(`Game ID: ${GAME_ID}`);

const videoContainerSelector = 'div.sc-kFuwaP.bBWia';
let videoMode = 'game'; // Tracks the current video mode (game or break)
let gameVideoHTML; // To store the game's video HTML
function checkAndUpdateVideo() {
    setInterval(async () => {
        const videoContainerDiv = document.querySelector(videoContainerSelector);
        if (!videoContainerDiv) return; // Exit if the container is not found

        const gameStatus = await findGameStatus(GAME_ID);
        
        const isBreakTime = ["Final", "Halftime", "Timeout"].includes(gameStatus);
        if (videoMode === 'game' && isBreakTime) {
            console.log("Game has paused. Switching to break video.");
            console.log(`Status: ${gameStatus}`);

            videoMode = 'break';
            gameVideoHTML = videoContainerDiv.innerHTML;
            videoContainerDiv.innerHTML = `<video autoplay loop name="media" style="width:100%;"><source src="${chrome.runtime.getURL('cat_video.mp4')}" type="video/mp4"></video>`; // Your break video HTML
        } else if (videoMode === 'break' && !isBreakTime) { // removed 
            console.log("Game is back. Restoring game video.");
            console.log(`Status: ${gameStatus}`);
            videoMode = 'game';
            videoContainerDiv.innerHTML = gameVideoHTML; // Restore the original game video HTML
        }

    }, 1000); // Check every second (1000 ms)
}

// Start the check-and-update process after a 5-second delay
(async () => {
    for (let i = 0; i < 10; i++) {
        await new Promise(r => setTimeout(r, 2000));
        checkAndUpdateVideo();
    }
    console.log("Error: videoContainerDiv not found")
})();