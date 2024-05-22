
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const eagleImage = new Image();
const tunaImage = new Image();
const pizzaImage = new Image();
const rinkImage = new Image();

eagleImage.src = 'https://raw.githubusercontent.com/Domusgpt/Hockey/main/1000006602.png';
tunaImage.src = 'https://raw.githubusercontent.com/Domusgpt/Hockey/main/1000006603.png';
pizzaImage.src = 'https://raw.githubusercontent.com/Domusgpt/Hockey/main/1000006599%20(1).png';
rinkImage.src = 'https://raw.githubusercontent.com/Domusgpt/Hockey/main/IMG_20240521_230056.jpg';

const paddleWidth = 10;
const paddleHeight = 100;
const puckSize = 30;

const leftPaddle = { x: 50, y: (canvas.height - paddleHeight) / 2 };
const rightPaddle = { x: canvas.width - 50 - paddleWidth, y: (canvas.height - paddleHeight) / 2 };
const puck = { x: canvas.width / 2, y: canvas.height / 2, vx: 5, vy: 5 };

const collisionSound = new Audio('path_to_collision_sound.mp3');
const scoreSound = new Audio('path_to_score_sound.mp3');

function playSound(type) {
    if (type === 'collision') {
        collisionSound.play();
    } else if (type === 'score') {
        scoreSound.play();
    }
}

function drawPaddle(paddle, image) {
    ctx.drawImage(image, paddle.x, paddle.y, paddleWidth, paddleHeight);
}

function drawPuck() {
    ctx.drawImage(pizzaImage, puck.x, puck.y, puckSize, puckSize);
}

function drawRink() {
    ctx.drawImage(rinkImage, 0, 0, canvas.width, canvas.height);
    drawPaddle(leftPaddle, eagleImage);
    drawPaddle(rightPaddle, tunaImage);
    drawPuck();
}

function drawGridOverlay() {
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#000';
    for (let i = 0; i < canvas.width; i += 20) {
        for (let j = 0; j < canvas.height; j += 20) {
            let distance = Math.hypot(puck.x - i, puck.y - j);
            let intensity = 5 / distance;
            ctx.fillRect(i, j, 20, 20);
            ctx.clearRect(i + intensity, j + intensity, 20 - 2 * intensity, 20 - 2 * intensity);
        }
    }
    ctx.restore();
}

function movePuck() {
    puck.x += puck.vx;
    puck.y += puck.vy;

    // Collision with top and bottom walls
    if (puck.y <= 0 || puck.y + puckSize >= canvas.height) {
        puck.vy = -puck.vy;
    }

    // Collision with paddles
    if (
        (puck.x <= leftPaddle.x + paddleWidth &&
         puck.y + puckSize > leftPaddle.y &&
         puck.y < leftPaddle.y + paddleHeight) ||
        (puck.x + puckSize >= rightPaddle.x &&
         puck.y + puckSize > rightPaddle.y &&
         puck.y < rightPaddle.y + paddleHeight)
    ) {
        puck.vx = -puck.vx;
        playSound('collision'); // Play sound on collision
    }

    // Scoring
    if (puck.x <= 0) {
        declareWinner('Tuna');
    } else if (puck.x + puckSize >= canvas.width) {
        declareWinner('Eagle');
    }
}

function declareWinner(winner) {
    playSound('score');
    setTimeout(() => {
        window.location.href = `results.html?winner=${winner}`;
    }, 500); // Delay to play sound before redirecting
}

function gameLoop() {
    drawRink();
    drawGridOverlay();
    movePuck();
    requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'w' && leftPaddle.y > 0) {
        leftPaddle.y -= 10;
    } else if (e.key === 's' && leftPaddle.y + paddleHeight < canvas.height) {
        leftPaddle.y += 10;
    }

    if (e.key === 'ArrowUp' && rightPaddle.y > 0) {
        rightPaddle.y -= 10;
    } else if (e.key === 'ArrowDown' && rightPaddle.y + paddleHeight < canvas.height) {
        rightPaddle.y += 10;
    }
});

canvas.addEventListener('mousemove', (e) => {
    let relativeY = e.clientY - canvas.offsetTop;
    if (relativeY > 0 && relativeY < canvas.height - paddleHeight) {
        rightPaddle.y = relativeY - paddleHeight / 2;
    }
});

canvas.addEventListener('touchmove', (e) => {
    let touch = e.touches[0];
    let relativeY = touch.clientY - canvas.offsetTop;
    if (relativeY > 0 && relativeY < canvas.height - paddleHeight) {
        rightPaddle.y = relativeY - paddleHeight / 2;
    }
});

gameLoop();
