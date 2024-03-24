

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
const videoContainerSelector = 'div.sc-kFuwaP.bBWia';

const GAME_ID = '0022301020'; // Example game ID
let videoMode = 'game'; // Tracks the current video mode (game or break)
let gameVideoHTML; // To store the game's video HTML
function checkAndUpdateVideo() {
    setInterval(async () => {
        const videoContainerDiv = document.querySelector(videoContainerSelector);
        if (!videoContainerDiv) return; // Exit if the container is not found

        const gameStatus = await findGameStatus(GAME_ID);

        if (videoMode === 'game' && (gameStatus === "Final" || gameStatus === "Halftime" || gameStatus === "Timeout")) {
            console.log("Game has paused. Switching to break video.");
            videoMode = 'break';
            gameVideoHTML = videoContainerDiv.innerHTML;
            videoContainerDiv.innerHTML = `<video autoplay loop name="media" style="width:100%;"><source src="${chrome.runtime.getURL('cat_video.mp4')}" type="video/mp4"></video>`; // Your break video HTML
        } else if (videoMode === 'break') { // removed && !(gameStatus === "Final" || gameStatus === "Halftime" || gameStatus === "Timeout")
            console.log("Game is back. Restoring game video.");
            videoMode = 'game';
            videoContainerDiv.innerHTML = gameVideoHTML; // Restore the original game video HTML
        }
        
    }, 1000); // Check every second (1000 ms)
}

// Start the check-and-update process after a 5-second delay
(async () => {
    await new Promise(r => setTimeout(r, 5000));
    checkAndUpdateVideo();
})();