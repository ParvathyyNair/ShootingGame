const game = document.getElementById('game');
const player = document.getElementById('player');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const pauseBtn = document.getElementById('pauseBtn');
const restartBtn = document.getElementById('restartBtn');
const scoreDisplay = document.getElementById('score');
const livesDisplay = document.getElementById('lives');
const highScoreDisplay = document.getElementById('high-score');
const finalScoreDisplay = document.getElementById('final-score');
const finalHighScoreDisplay = document.getElementById('final-high-score');
const difficultySelect = document.getElementById('difficulty');
const titleScreen = document.getElementById('title-screen');
const controls = document.getElementById('controls');
const countdown = document.getElementById('countdown');
const gameOverOverlay = document.getElementById('game-over-overlay');
const controlsBtn = document.getElementById('controlsBtn');
const controlsModal = document.getElementById('controls-modal');
const closeModal = document.querySelector('.close');

let bullets = [], enemies = [];
let playerX = 175, score = 0, lives = 3;
let isRunning = false, isPaused = false;
let spawnRate = 1200;
let enemyInterval, gameLoopId;
let highScore = localStorage.getItem('highScore') || 0;
highScoreDisplay.innerText = highScore;

// Sound Effects
const shootSound = new Audio('shoot.mp3');
shootSound.volume = 1.0; // Maximum volume
shootSound.play();
const hitSound = new Audio('hit.mp3');
hitSound.volume = 1.0; // Maximum volume
hitSound.play();
const gameOverSound = new Audio('gameover.mp3');
gameOverSound.volume = 1.0; // Maximum volume
gameOverSound.play();


// Show controls modal
controlsBtn.onclick = () => controlsModal.style.display = 'block';
closeModal.onclick = () => controlsModal.style.display = 'none';
window.onclick = (e) => {
  if (e.target === controlsModal) controlsModal.style.display = 'none';
};

// Difficulty settings
function setDifficulty() {
  const level = difficultySelect.value;
  if (level === 'easy') spawnRate = 1500;
  else if (level === 'medium') spawnRate = 1000;
  else if (level === 'hard') spawnRate = 700;
}

// Start the game with countdown
startBtn.addEventListener('click', () => {
  setDifficulty();
  const bgMusic = document.getElementById('bg-music');
bgMusic.volume = 0.5; // Set volume (0.0 to 1.0)
bgMusic.play();

  titleScreen.style.display = 'none';
  countdown.style.display = 'block';
  let count = 3;
  countdown.textContent = count;
  const interval = setInterval(() => {
    count--;
    if (count > 0) countdown.textContent = count;
    else {
      clearInterval(interval);
      countdown.style.display = 'none';
      initGame();
    }
  }, 1000);
});

function initGame() {
  isRunning = true;
  isPaused = false;
  score = 0;
  lives = 3;
  playerX = 175;
  bullets = [];
  enemies = [];
  scoreDisplay.innerText = score;
  livesDisplay.innerText = lives;
  highScoreDisplay.innerText = highScore;
  controls.style.display = 'flex';
  game.style.display = 'block';
  player.style.left = playerX + 'px';
  clearGameObjects();
  enemyInterval = setInterval(spawnEnemy, spawnRate);
  gameLoop();
}

// Clear bullets and enemies
function clearGameObjects() {
  document.querySelectorAll('.bullet, .enemy').forEach(e => e.remove());
}

// Shoot bullet
function shoot() {
  if (!isRunning || isPaused) return;
  const bullet = document.createElement('div');
  bullet.classList.add('bullet');
  bullet.style.left = playerX + 22 + 'px';
  bullet.style.bottom = '60px';
  game.appendChild(bullet);
  bullets.push(bullet);
  shootSound.currentTime = 0;
  shootSound.play();
}

// Spawn enemies
function spawnEnemy() {
  if (!isRunning || isPaused) return;
  const enemy = document.createElement('img');
  enemy.src = 'enemy.png';
  enemy.classList.add('enemy');
  enemy.style.left = Math.floor(Math.random() * 360) + 'px';
  enemy.style.top = '0px';
  game.appendChild(enemy);
  enemies.push(enemy);
}

// Game loop
function gameLoop() {
  if (!isRunning) return;
  if (!isPaused) updateGame();
  gameLoopId = requestAnimationFrame(gameLoop);
}

function updateGame() {
  // Move bullets
  bullets.forEach((bullet, i) => {
    let bottom = parseInt(bullet.style.bottom);
    if (bottom > 600) {
      bullet.remove();
      bullets.splice(i, 1);
    } else {
      bullet.style.bottom = bottom + 10 + 'px';
    }
  });

  // Move enemies and check for collisions
  enemies.forEach((enemy, ei) => {
    let top = parseInt(enemy.style.top);
    if (top > 600) {
      enemy.remove();
      enemies.splice(ei, 1);
      loseLife();
    } else {
      enemy.style.top = top + 5 + 'px';
    }

    bullets.forEach((bullet, bi) => {
      const bRect = bullet.getBoundingClientRect();
      const eRect = enemy.getBoundingClientRect();
      if (
        bRect.top < eRect.bottom &&
        bRect.bottom > eRect.top &&
        bRect.left < eRect.right &&
        bRect.right > eRect.left
      ) {
        bullet.remove();
        bullets.splice(bi, 1);
        enemy.src = 'explosion.png';
        enemy.classList.add('explosion'); // Add explosion class for bigger size

        hitSound.currentTime = 0;
        hitSound.play();
        setTimeout(() => enemy.remove(), 300);
        enemies.splice(ei, 1);
        score++;
        scoreDisplay.innerText = score;
        if (score > highScore) {
          highScore = score;
          highScoreDisplay.innerText = highScore;
          localStorage.setItem('highScore', highScore);
        }
      }
    });
  });
}

// Player movement
document.addEventListener('keydown', (e) => {
  if (!isRunning || isPaused) return;

  if (e.key === 'ArrowLeft' && playerX > 0) playerX -= 20;
  else if (e.key === 'ArrowRight' && playerX < 350) playerX += 20;
  else if (e.key === ' ') shoot();

  player.style.left = playerX + 'px';
});

// Pause the game
pauseBtn.addEventListener('click', () => {
  if (!isRunning) return;
  isPaused = !isPaused;
  pauseBtn.innerText = isPaused ? 'Resume' : 'Pause';
});

// Stop the game
stopBtn.addEventListener('click', stopGame);

function stopGame() {
  if (!isRunning) return;
  cancelAnimationFrame(gameLoopId);
  clearInterval(enemyInterval);
  clearGameObjects();
  isRunning = false;
  game.style.display = 'none';
  controls.style.display = 'none';
  titleScreen.style.display = 'block';
}

// Lose a life
function loseLife() {
  lives--;
  livesDisplay.innerText = lives;
  if (lives <= 0) {
    gameOver();
  }
}

// Game over screen
function gameOver() {
  gameOverSound.play();
  cancelAnimationFrame(gameLoopId);
  clearInterval(enemyInterval);
  isRunning = false;
  controls.style.display = 'none';
  game.style.display = 'none';
  finalScoreDisplay.innerText = score;
  finalHighScoreDisplay.innerText = highScore;
  gameOverOverlay.style.display = 'flex';
}

// Restart the game
restartBtn.addEventListener('click', () => {
  gameOverOverlay.style.display = 'none';
  setDifficulty();
  startCountdown();
});

function startCountdown() {
  countdown.style.display = 'block';
  let count = 3;
  countdown.textContent = count;
  const interval = setInterval(() => {
    count--;
    if (count > 0) countdown.textContent = count;
    else {
      clearInterval(interval);
      countdown.style.display = 'none';
      initGame();
    }
  }, 1000);
}
