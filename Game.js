const canvas = document.getElementById('gameCanvas');
const score = document.getElementById('score');
const ctx = canvas.getContext('2d');

const MAP_WIDTH = 10000;
const MAP_HEIGHT = 10000;
const GRID_SIZE = 100; // 100x100のグリッドを持つ

let velocityX = 0;
let velocityY = 0;

let player = {
    x: MAP_WIDTH / 2,
    y: MAP_HEIGHT / 2,
    radius: 30,
    color: 'blue',
};

const enemies = [];

for (let i = 0; i < 50; i++) {
    enemies.push({
        x: Math.random() * 10000,
        y: Math.random() * 10000,
        radius: Math.random() * 20 + 30, // 30から50の範囲でランダムな半径
        color: 'yellow'
    });
}



let foods = [];
for (let i = 0; i < 200; i++) {
    foods.push({
        x: Math.random() * MAP_WIDTH,
        y: Math.random() * MAP_HEIGHT,
        radius: 5,
        color: 'red',
    });
}

function addRandomFood() {
    foods.push({
        x: Math.random() * MAP_WIDTH,
        y: Math.random() * MAP_HEIGHT,
        radius: 5,
        color: 'red',
    });
}

function drawCircle(x, y, radius, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
}

function checkCollision(circle1, circle2) {
    const distance = Math.hypot(circle1.x - circle2.x, circle1.y - circle2.y);
    return distance < circle1.radius + circle2.radius;
}


function drawGrid() {
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    for (let x = 0; x <= MAP_WIDTH; x += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(x - player.x + canvas.width / 2, 0 - player.y + canvas.height / 2);
        ctx.lineTo(x - player.x + canvas.width / 2, MAP_HEIGHT - player.y + canvas.height / 2);
        ctx.stroke();
    }

    for (let y = 0; y <= MAP_HEIGHT; y += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(0 - player.x + canvas.width / 2, y - player.y + canvas.height / 2);
        ctx.lineTo(MAP_WIDTH - player.x + canvas.width / 2, y - player.y + canvas.height / 2);
        ctx.stroke();
    }
}

function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawGrid();

    foods.forEach((food, index) => {
        drawCircle(food.x - player.x + canvas.width / 2, food.y - player.y + canvas.height / 2, food.radius, food.color);

        if (Math.hypot(player.x - food.x, player.y - food.y) < player.radius) {
            foods.splice(index, 1);
            player.radius += 1;
        }
    });

    enemies.forEach((enemy, index) => {
        drawCircle(enemy.x - player.x + canvas.width / 2, enemy.y - player.y + canvas.height / 2, enemy.radius, enemy.color);

        if (checkCollision(player, enemy)) {
            if (player.radius > enemy.radius) {
                player.radius += enemy.radius;
                enemies.splice(index, 1);
            } else {
                // この例では、プレイヤーが敵より小さい場合、ゲームを再起動します。
                location.reload();
            }
        }
    });

    player.x += velocityX;
    player.y += velocityY;

    drawCircle(canvas.width / 2, canvas.height / 2, player.radius, player.color);
    score.textContent = `Score: ${player.radius}`;
    requestAnimationFrame(update);
}

canvas.addEventListener('mousemove', (event) => {
    let bounds = canvas.getBoundingClientRect();
    let mouseX = event.clientX - bounds.left;
    let mouseY = event.clientY - bounds.top;

    // マウスとプレイヤーとのxおよびyの差を計算します。
    let diffX = mouseX - canvas.width / 2;
    let diffY = mouseY - canvas.height / 2;

    // マウスとプレイヤーとの距離を計算します。
    let distance = Math.sqrt(diffX * diffX + diffY * diffY);

    // 移動の最大速度を設定します。
    const maxSpeed = 5;

    // 距離を0からmaxSpeedにマッピングします。
    let speedFactor = Math.min(distance / (player.radius + 50), 1); // 1を超えないように制限します。

    velocityX = diffX / distance * speedFactor * maxSpeed;
    velocityY = diffY / distance * speedFactor * maxSpeed;
});


setInterval(addRandomFood, 5000); // 5000ミリ秒 = 5秒


update();
