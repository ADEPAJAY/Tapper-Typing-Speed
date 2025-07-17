const word = document.getElementById("word");
const text = document.getElementById("text");
const scoreElement = document.getElementById("score");
const timeElement = document.getElementById("time");
const endgameElement = document.getElementById("end-game-container");

const difficultySelect = document.getElementById("difficulty");

const nameInputContainer = document.getElementById("name-input-container");
const playerNameInput = document.getElementById("player-name");
const startGameButton = document.getElementById("start-game-btn");
const typePrompt = document.getElementById("type-prompt");

// NEW: DOM elements for next words
const nextWordsContainer = document.querySelector(".next-words-container");
const nextWord1Element = document.getElementById("next-word-1");
const nextWord2Element = document.getElementById("next-word-2");


const allWords = {
  easy: [
    "cat", "dog", "sun", "run", "jump", "ball", "book", "tree", "car", "cup",
    "red", "blue", "big", "small", "eat", "sleep", "bird", "fish", "moon", "star",
    "walk", "play", "sing", "read", "cold", "warm", "fast", "slow", "happy", "sad",
    "desk", "chair", "door", "wall", "lamp", "sock", "shoe", "coat", "hat", "glove",
    "fork", "spoon", "knife", "plate", "glass", "water", "milk", "bread", "apple", "grape"
  ],
  medium: [
    "sigh", "tense", "airplane", "pies", "juice", "warlike", "north", "steer", "silver", "admit",
    "drag", "loving", "happy", "sad", "speak", "write", "journey", "mystery", "forest", "shadow",
    "breeze", "whisper", "ancient", "vibrant", "fragile", "humble", "daring", "gentle", "future", "wisdom",
    "elegant", "purpose", "freedom", "serene", "passion", "courage", "explore", "discover", "imagine", "create",
    "balance", "harmony", "enigma", "bliss", "wonder", "destiny", "inspire", "reflect", "solitude", "laughter"
  ],
  hard: [
    "highfalutin", "superficial", "quince", "dependent", "feeble", "onomatopoeia", "perspicacious", "ubiquitous",
    "ephemeral", "serendipity", "eloquence", "melancholy", "cacophony", "nefarious", "gregarious", "benevolent",
    "equilibrium", "quintessential", "paradoxical", "juxtaposition", "vicissitude", "synchronicity", "floccinaucinihilipilification",
    "pulchritudinous", "sesquipedalian", "antediluvian", "chrysanthemum", "discombobulate", "effervescent", "exacerbate",
    "idiosyncrasy", "magnanimous", "obfuscate", "parsimonious", "plethora", "quixotic", "ruminant", "sagacious",
    "surreptitious", "tranquility", "unilateral", "verisimilitude", "winsome", "xenophobia", "zeitgeist", "aberration",
    "capricious", "dichotomy", "equivocate", "fortuitous", "garrulous", "histrionic", "impecunious", "jejune",
    "kismet", "lugubrious", "meticulous", "nonchalant", "ostentatious", "paradigm", "rhetoric", "sanctimonious",
    "taciturn", "unctuous", "vociferous", "wanton", "zealous"
  ],
};

const initialTime = {
    easy: 15,
    medium: 10,
    hard: 7
};


let randomWord;
let score = 0;
let time = 10;
let difficulty =
  localStorage.getItem("difficulty") !== null
    ? localStorage.getItem("difficulty")
    : "medium";

let playerName = "";
let gameStarted = false;
let timeInterval;

// NEW: Variables for word sequence management
let currentWordList = []; // The list of words for the current difficulty
let currentWordIndex = 0; // Index of the current word in currentWordList

/**
 * Gets a random word from the word list based on the current difficulty.
 * This function is no longer solely responsible for word selection, but helps initialize.
 * @returns {string} A random word.
 */
function getRandomWord() {
  const wordsForCurrentDifficulty = allWords[difficulty];
  return wordsForCurrentDifficulty[
    Math.floor(Math.random() * wordsForCurrentDifficulty.length)
  ];
}

/**
 * NEW: Populates the current word and the next two words.
 * Manages the word sequence and wraps around if needed.
 */
function addWordToDom() {
  // Ensure currentWordList is set for the chosen difficulty
  if (currentWordList.length === 0 || !currentWordList[currentWordIndex]) {
    // If list is empty or index is out of bounds (e.g., first start or difficulty changed)
    // Randomize the list for the current difficulty so sequences are different each game
    currentWordList = shuffleArray([...allWords[difficulty]]);
    currentWordIndex = 0;
  }

  randomWord = currentWordList[currentWordIndex];
  word.innerText = randomWord;

  // Display next two words
  nextWord1Element.innerText = currentWordList[(currentWordIndex + 1) % currentWordList.length];
  nextWord2Element.innerText = currentWordList[(currentWordIndex + 2) % currentWordList.length];

  // Move to the next word for the next turn
  currentWordIndex = (currentWordIndex + 1) % currentWordList.length;
}

/**
 * Helper function to shuffle an array (Fisher-Yates algorithm).
 * Used to randomize the word list each game.
 * @param {Array} array - The array to shuffle.
 * @returns {Array} The shuffled array.
 */
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}


function updateScore() {
  score++;
  scoreElement.innerText = score;
}

function updateTime() {
  time--;
  timeElement.innerText = time + "s";
  if (time <= 0) {
    clearInterval(timeInterval);
    gameOver();
  }
}

function gameOver() {
  gameStarted = false;
  endgameElement.innerHTML = `
    <h1>Time ran out, ${playerName}!</h1>
    <p>Your final score is ${score}</p>
    <button id="play-again-btn">Play Again</button>
    <button id="view-scores-btn">View High Scores</button>
    `;
  endgameElement.classList.remove("game-hidden");

  saveHighScore(playerName, score, difficulty);

  document.getElementById("play-again-btn").addEventListener("click", () => {
    endgameElement.classList.add("game-hidden");
    showNameInputAndStartButton();
    resetGame();
  });

  document.getElementById("view-scores-btn").addEventListener("click", () => {
    showHighScores();
  });
}

function startGame() {
  playerName = playerNameInput.value.trim();
  if (playerName === "") {
    alert("Please enter your name to start the game!");
    return;
  }

  gameStarted = true;
  nameInputContainer.style.display = "none";

  // Show game elements by removing the 'game-hidden' class
  typePrompt.classList.remove("game-hidden");
  word.classList.remove("game-hidden");
  text.classList.remove("game-hidden");
  timeElement.parentElement.classList.remove("game-hidden");
  scoreElement.parentElement.classList.remove("game-hidden");
  nextWordsContainer.classList.remove("game-hidden"); // NEW: Show next words container
  endgameElement.classList.add("game-hidden");


  time = initialTime[difficulty];
  timeElement.innerText = time + "s";

  // Initialize word list and index for the current game
  currentWordList = shuffleArray([...allWords[difficulty]]); // Shuffle for new game
  currentWordIndex = 0;
  addWordToDom(); // Display first word and next two

  text.focus();
  timeInterval = setInterval(updateTime, 1000);
}

function resetGame() {
  score = 0;
  scoreElement.innerText = score;
  timeElement.innerText = initialTime[difficulty] + "s";
  text.value = "";
  clearInterval(timeInterval);
  // Do NOT reset currentWordIndex here, it's handled in startGame or addWordToDom
}


// High Score Management
function getHighScores() {
  const scores = JSON.parse(localStorage.getItem("highScores")) || [];
  return scores.sort((a, b) => b.score - a.score).slice(0, 10);
}

function saveHighScore(name, score, mode) {
  const highScores = getHighScores();
  const newScore = { name, score, date: new Date().toLocaleDateString(), mode: mode };
  highScores.push(newScore);
  highScores.sort((a, b) => b.score - a.score);
  localStorage.setItem("highScores", JSON.stringify(highScores.slice(0, 10)));
}

function showHighScores() {
  console.log("Opening High Scores window.");
  window.open('scoreboard.html', 'highScoresWindow', 'width=600,height=700,scrollbars=yes,resizable=yes');
}

function showNameInputAndStartButton() {
    nameInputContainer.style.display = "flex";

    // Hide game elements by adding the 'game-hidden' class
    typePrompt.classList.add("game-hidden");
    word.classList.add("game-hidden");
    text.classList.add("game-hidden");
    timeElement.parentElement.classList.add("game-hidden");
    scoreElement.parentElement.classList.add("game-hidden");
    nextWordsContainer.classList.add("game-hidden"); // NEW: Hide next words container
    endgameElement.classList.add("game-hidden");

    playerNameInput.value = "";
    timeElement.innerText = initialTime[difficulty] + "s";
}


// Event Listeners
text.addEventListener("keydown", (e) => {
  if (!gameStarted) return;

  if (e.key === "Enter") {
    const insertedText = e.target.value.trim();

    if (insertedText === randomWord) {
      e.target.value = "";
      addWordToDom(); // This will now get the next word in sequence
      updateScore();
      if (difficulty === "hard") time += 2;
      else if (difficulty === "medium") time += 3;
      else time += 5;
    } else {
      clearInterval(timeInterval);
      gameOver();
    }
  }
});

difficultySelect.addEventListener("change", (e) => {
  difficulty = e.target.value;
  localStorage.setItem("difficulty", difficulty);

  timeElement.innerText = initialTime[difficulty] + "s";

  if (!gameStarted) {
      // If not started, just prepare the new word sequence for next game
      currentWordList = shuffleArray([...allWords[difficulty]]);
      currentWordIndex = 0;
      addWordToDom(); // Update displayed word and next words
  } else {
      // If game is ongoing, changing difficulty will end the current round
      clearInterval(timeInterval);
      gameOver();
  }
});

startGameButton.addEventListener("click", startGame);


// Initialization
difficultySelect.value = difficulty;
showNameInputAndStartButton();