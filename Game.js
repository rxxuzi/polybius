const canvas = document.getElementById('gameCanvas');
const score = document.getElementById('score');
const ctx = canvas.getContext('2d');

const MAP_WIDTH = 10000;
const MAP_HEIGHT = 10000;
const GRID_SIZE = 100; // 100x100のグリッドを持つ

const START_PLAYER_SIZE = 20
function getScale() {
    return player.radius > 100 ? 100 / player.radius : 1;
}

let velocityX = 0;
let velocityY = 0;

// 線形補間関数
function lerp(start, end, factor) {
    return start + (end - start) * factor;
}
//シグモイド関数
function sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
}

let player = {
    x: MAP_WIDTH / 2,
    y: MAP_HEIGHT / 2,
    radius: START_PLAYER_SIZE,
    targetRadius: START_PLAYER_SIZE,
    color: 'blue',
};

const enemies = [];

const MAX_SPEED = 10;
const BASE_RADIUS = 40; // これは中央の値で、この周辺のradiusで速度が最も変動します。

for (let i = 0; i < 50; i++) {
    const MINIMUM_RADIUS = 10;
    const RADIUS_RANGE = 60
    const radius = Math.random() * RADIUS_RANGE + MINIMUM_RADIUS;
    const speedFactor = sigmoid((BASE_RADIUS - radius) * 0.1); // 0.1はシグモイドの「感度」を調整します。
    enemies.push({
        x: Math.random() * 10000,
        y: Math.random() * 10000,
        radius: radius,
        color: 'yellow',
        speed: MAX_SPEED * speedFactor,
        direction: Math.random() * Math.PI * 2
    });
}



let foods = [];
for (let i = 0; i < 1200; i++) {
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

    // 毎フレーム、radiusをtargetRadiusに近づける
    player.radius = lerp(player.radius, player.targetRadius, 0.05);

    // 差が十分に小さくなったら、radiusを直接targetRadiusに設定
    if (Math.abs(player.radius - player.targetRadius) < 0.1) {
        player.radius = player.targetRadius;
    }

    foods.forEach((food, index) => {
        drawCircle(food.x - player.x + canvas.width / 2, food.y - player.y + canvas.height / 2, food.radius, food.color);

        if (Math.hypot(player.x - food.x, player.y - food.y) < player.radius) {
            foods.splice(index, 1);
            player.radius += 1; // foodを食べたら、直接radiusを増加
            player.targetRadius += 1;
        }
    });

    enemies.forEach((enemy, index) => {
        drawCircle(enemy.x - player.x + canvas.width / 2, enemy.y - player.y + canvas.height / 2, enemy.radius, enemy.color);

        if (checkCollision(player, enemy)) {
            if (player.radius > enemy.radius) {
                player.targetRadius += enemy.radius; // targetRadiusを増やす
                enemies.splice(index, 1);
            } else {
                location.reload();
            }
        }

        //move
        enemy.x += Math.cos(enemy.direction) * enemy.speed;
        enemy.y += Math.sin(enemy.direction) * enemy.speed;

        // 敵が画面の境界に達したら、方向を反転
        if (enemy.x < 0 || enemy.x > MAP_WIDTH) {
            enemy.direction = Math.PI - enemy.direction;
        }
        if (enemy.y < 0 || enemy.y > MAP_HEIGHT) {
            enemy.direction = -enemy.direction;
        }


    });


    player.x += velocityX;
    player.y += velocityY;

    drawCircle(canvas.width / 2, canvas.height / 2, player.radius, player.color);
    score.textContent = `Score: ${Math.floor(player.radius)}`;

    requestAnimationFrame(update);
}

canvas.addEventListener('mousemove', (event) => {
    let bounds = canvas.getBoundingClientRect();
    let mouseX = event.clientX - bounds.left;
    let mouseY = event.clientY - bounds.top;

    let diffX = mouseX - canvas.width / 2;
    let diffY = mouseY - canvas.height / 2;

    let distance = Math.sqrt(diffX * diffX + diffY * diffY);

    const maxSpeed = 5;

    // 距離を0からmaxSpeedにマッピング
    let speedFactor = Math.min(distance / (player.radius + 50), 1); // 1を超えないように制限します。

    velocityX = diffX / distance * speedFactor * maxSpeed;
    velocityY = diffY / distance * speedFactor * maxSpeed;
});


setInterval(addRandomFood, 5000); // 5000ミリ秒 = 5秒
setInterval(() => {
    enemies.forEach(enemy => {
        enemy.direction = Math.random() * Math.PI * 2;
    });
}, 5000);

update();

