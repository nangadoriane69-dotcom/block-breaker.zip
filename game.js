const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const messageElement = document.getElementById('message');

const PADDLE_WIDTH = 120;
const PADDLE_HEIGHT = 15;
const BALL_RADIUS = 8;
const BLOCK_ROWS = 6;
const BLOCK_COLS = 10;
const BLOCK_WIDTH = 70;
const BLOCK_HEIGHT = 25;
const BLOCK_PADDING = 10;
const BLOCK_OFFSET_TOP = 60;
const BLOCK_OFFSET_LEFT = 35;

let gameState = 'ready';
let score = 0;
let lives = 3;

const paddle = {
  x: canvas.width / 2 - PADDLE_WIDTH / 2,
  y: canvas.height - 40,
  width: PADDLE_WIDTH,
  height: PADDLE_HEIGHT,
  speed: 8,
  dx: 0
};

const ball = {
  x: canvas.width / 2,
  y: paddle.y - BALL_RADIUS - 5,
  radius: BALL_RADIUS,
  speed: 5,
  dx: 0,
  dy: 0
};

const blocks = [];
const blockColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'];

function initBlocks() {
  blocks.length = 0;
  for (let row = 0; row < BLOCK_ROWS; row++) {
    for (let col = 0; col < BLOCK_COLS; col++) {
      blocks.push({
        x: BLOCK_OFFSET_LEFT + col * (BLOCK_WIDTH + BLOCK_PADDING),
        y: BLOCK_OFFSET_TOP + row * (BLOCK_HEIGHT + BLOCK_PADDING),
        width: BLOCK_WIDTH,
        height: BLOCK_HEIGHT,
        color: blockColors[row],
        visible: true
      });
    }
  }
}

function drawPaddle() {
  ctx.fillStyle = '#4ECDC4';
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
  ctx.strokeStyle = '#3BB4AC';
  ctx.lineWidth = 2;
  ctx.strokeRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = '#FFE66D';
  ctx.fill();
  ctx.strokeStyle = '#FFD43B';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.closePath();
}

function drawBlocks() {
  blocks.forEach(block => {
    if (block.visible) {
      ctx.fillStyle = block.color;
      ctx.fillRect(block.x, block.y, block.width, block.height);
      ctx.strokeStyle = 'rgba(0,0,0,0.2)';
      ctx.lineWidth = 2;
      ctx.strokeRect(block.x, block.y, block.width, block.height);
    }
  });
}

function drawScore() {
  scoreElement.textContent = score;
  livesElement.textContent = lives;
}

function movePaddle() {
  paddle.x += paddle.dx;

  if (paddle.x < 0) {
    paddle.x = 0;
  }

  if (paddle.x + paddle.width > canvas.width) {
    paddle.x = canvas.width - paddle.width;
  }
}

function moveBall() {
  if (gameState !== 'playing') return;

  ball.x += ball.dx;
  ball.y += ball.dy;

  if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
    ball.dx = -ball.dx;
  }

  if (ball.y - ball.radius < 0) {
    ball.dy = -ball.dy;
  }

  if (ball.y + ball.radius > canvas.height) {
    lives--;
    if (lives === 0) {
      gameState = 'gameOver';
      messageElement.textContent = 'Game Over! Press SPACE to restart';
    } else {
      resetBall();
      gameState = 'ready';
      messageElement.textContent = 'Press SPACE to continue';
    }
  }
}

function checkPaddleCollision() {
  if (
    ball.y + ball.radius > paddle.y &&
    ball.y - ball.radius < paddle.y + paddle.height &&
    ball.x > paddle.x &&
    ball.x < paddle.x + paddle.width
  ) {
    ball.dy = -ball.dy;

    const hitPos = (ball.x - paddle.x) / paddle.width;
    const angle = (hitPos - 0.5) * Math.PI / 3;
    ball.dx = ball.speed * Math.sin(angle);
    ball.dy = -ball.speed * Math.cos(angle);
  }
}

function checkBlockCollision() {
  blocks.forEach(block => {
    if (!block.visible) return;

    if (
      ball.x + ball.radius > block.x &&
      ball.x - ball.radius < block.x + block.width &&
      ball.y + ball.radius > block.y &&
      ball.y - ball.radius < block.y + block.height
    ) {
      ball.dy = -ball.dy;
      block.visible = false;
      score += 10;

      const visibleBlocks = blocks.filter(b => b.visible).length;
      if (visibleBlocks === 0) {
        gameState = 'win';
        messageElement.textContent = 'You Win! Press SPACE to restart';
      }
    }
  });
}

function resetBall() {
  ball.x = canvas.width / 2;
  ball.y = paddle.y - ball.radius - 5;
  ball.dx = 0;
  ball.dy = 0;
}

function startGame() {
  if (gameState === 'ready') {
    gameState = 'playing';
    const angle = (Math.random() - 0.5) * Math.PI / 4;
    ball.dx = ball.speed * Math.sin(angle);
    ball.dy = -ball.speed * Math.cos(angle);
    messageElement.textContent = '';
  } else if (gameState === 'gameOver' || gameState === 'win') {
    score = 0;
    lives = 3;
    gameState = 'ready';
    resetBall();
    initBlocks();
    messageElement.textContent = 'Press SPACE to start';
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBlocks();
  drawPaddle();
  drawBall();
  drawScore();
}

function update() {
  movePaddle();
  moveBall();
  checkPaddleCollision();
  checkBlockCollision();
  draw();
  requestAnimationFrame(update);
}

function keyDown(e) {
  if (e.key === 'ArrowRight' || e.key === 'Right') {
    paddle.dx = paddle.speed;
  } else if (e.key === 'ArrowLeft' || e.key === 'Left') {
    paddle.dx = -paddle.speed;
  } else if (e.key === ' ' || e.key === 'Spacebar') {
    e.preventDefault();
    startGame();
  }
}

function keyUp(e) {
  if (
    e.key === 'ArrowRight' ||
    e.key === 'Right' ||
    e.key === 'ArrowLeft' ||
    e.key === 'Left'
  ) {
    paddle.dx = 0;
  }
}

function mouseMove(e) {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  paddle.x = mouseX - paddle.width / 2;

  if (paddle.x < 0) {
    paddle.x = 0;
  }
  if (paddle.x + paddle.width > canvas.width) {
    paddle.x = canvas.width - paddle.width;
  }
}

document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);
canvas.addEventListener('mousemove', mouseMove);

initBlocks();
update();
