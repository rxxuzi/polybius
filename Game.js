const canvas = document.getElementById('gameCanvas');
const score = document.getElementById('score');
const ctx = canvas.getContext('2d');

const MAP_WIDTH = 10000;
const MAP_HEIGHT = 10000;
const GRID_SIZE = 100; // 100x100のグリッドを持つ

const START_PLAYER_SIZE = 20
const SENSOR_RANGE = 70;

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
const BASE_RADIUS = 40;

for (let i = 0; i < 50; i++) {
    const MINIMUM_RADIUS = 10;
    const RADIUS_RANGE = 60
    const radius = Math.random() * RADIUS_RANGE + MINIMUM_RADIUS;
    const speedFactor = sigmoid((BASE_RADIUS - radius) * 0.1);
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

function upgradeRadius(x) {
    player.radius += x;
    player.targetRadius += x;
}

function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawGrid();

    // Each frame, radius is brought closer to targetRadius
    player.radius = lerp(player.radius, player.targetRadius, 0.05);

    // When the difference is small enough, set radius directly to targetRadius
    if (Math.abs(player.radius - player.targetRadius) < 0.1) {
        player.radius = player.targetRadius;
    }

    foods.forEach((food, index) => {
        drawCircle(food.x - player.x + canvas.width / 2, food.y - player.y + canvas.height / 2, food.radius, food.color);

        if (Math.hypot(player.x - food.x, player.y - food.y) < player.radius) {
            foods.splice(index, 1);
            upgradeRadius(1);
        }
    });

    enemies.forEach((enemy, index) => {
        drawCircle(enemy.x - player.x + canvas.width / 2, enemy.y - player.y + canvas.height / 2, enemy.radius, enemy.color);


        if (checkCollision(player, enemy)) {
            const scoreRate = 0.5
            if(enemy.radius > 30){
                if (player.radius > enemy.radius) {
                    player.targetRadius += enemy.radius * scoreRate;
                    enemies.splice(index, 1);
                } else {
                    location.reload();
                }
            }else {
                if (player.radius > enemy.radius + 10) {
                    player.targetRadius += enemy.radius * scoreRate;
                    enemies.splice(index, 1);
                } else if(player.radius <= enemy.radius - 5){
                    location.reload();
                }
            }

        }

        // Move the enemy
        let newEnemyX = enemy.x + Math.cos(enemy.direction) * enemy.speed;
        let newEnemyY = enemy.y + Math.sin(enemy.direction) * enemy.speed;


        // If the new position will take the enemy outside the bounds, reflect the direction
        if (newEnemyX - enemy.radius < 0 || newEnemyX + enemy.radius > MAP_WIDTH) {
            enemy.direction = Math.PI - enemy.direction;
        }
        if (newEnemyY - enemy.radius < 0 || newEnemyY + enemy.radius > MAP_HEIGHT) {
            enemy.direction = -enemy.direction;
        }

        // Update the enemy's position using the possibly modified direction
        let distanceToPlayer = Math.hypot(player.x - enemy.x, player.y - enemy.y);

        if (distanceToPlayer < SENSOR_RANGE) {
            let angleToPlayer = Math.atan2(player.y - enemy.y, player.x - enemy.x);
            // If the player is smaller than the enemy, moves in the direction of the player
            if (player.radius < enemy.radius) {
                enemy.x += Math.cos(angleToPlayer) * enemy.speed;
                enemy.y += Math.sin(angleToPlayer) * enemy.speed;
            }
            // If the player is larger than the enemy, moves in the opposite direction from the player
            else {
                enemy.x -= Math.cos(angleToPlayer) * enemy.speed;
                enemy.y -= Math.sin(angleToPlayer) * enemy.speed;
            }
        }
        else {
            // If out of range of sensor, original motion is retained
            enemy.x += Math.cos(enemy.direction) * enemy.speed;
            enemy.y += Math.sin(enemy.direction) * enemy.speed;
        }
    });



    // Update player's position
    let newPlayerX = player.x + velocityX;
    let newPlayerY = player.y + velocityY;

    // If the new position will take the player outside the bounds, reflect the velocity
    if (newPlayerX - player.radius < 0 || newPlayerX + player.radius > MAP_WIDTH) {
        velocityX = -velocityX;
    }
    if (newPlayerY - player.radius < 0 || newPlayerY + player.radius > MAP_HEIGHT) {
        velocityY = -velocityY;
    }

    // Update the player's position using the possibly modified velocities
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

    // Mapping distance from 0 to maxSpeed
    let speedFactor = Math.min(distance / (player.radius + 50), 1);

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

