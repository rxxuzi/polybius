const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

let rotationAngle = 0; // 現在の回転角度（ラジアン）
let isRotatingLeft = false;
let isRotatingRight = false;
const rotationSpeed = Math.PI / 135; // 1フレームあたりの回転速度（1度をラジアンに変換）。現在は2度/フレーム


function drawOctagon(x: number, y: number, radius: number) {
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
        let angle = Math.PI / 4 * i + rotationAngle; // ここにrotationAngleを追加
        let xOffset = radius * Math.cos(angle);
        let yOffset = radius * Math.sin(angle);
        if (i === 0) {
            ctx.moveTo(x + xOffset, y + yOffset);
        } else {
            ctx.lineTo(x + xOffset, y + yOffset);
        }
    }
    ctx.closePath();
    ctx.strokeStyle = "lime"; // ネオン色
    ctx.lineWidth = 3;
    ctx.stroke();
}
function drawTubeSegment(segment: TubeSegment, state: GameState) {
    const scaleFactor = 300 / (segment.depth + 300);
    const scaledRadius = 300 * scaleFactor;
    drawOctagon(canvas.width / 2, canvas.height / 2, scaledRadius);
}

class TubeSegment {
    depth: number;

    constructor(depth: number) {
        this.depth = depth;
    }
}

function isVisible(scaleFactor: number): boolean {
    return scaleFactor >= 0.01; // scaleFactorが非常に小さい場合、セグメントは表示されないと判断
}

class GameState {
    segments: TubeSegment[] = [];
    rotationAngle: number = 0;
    vanishingPoint: { x: number, y: number }[] = [];
    maxDepth: number;

    constructor(numSegments: number, maxDepth: number) {
        this.maxDepth = maxDepth;
        const depthPerSegment = maxDepth / numSegments;

        for (let i = 1; i <= numSegments; i++) {
            this.segments.push(new TubeSegment(i * depthPerSegment));
        }
    }
}

function updateTube(state: GameState) {
    const moveSpeed = 3.5;

    // 一番前のセグメントのスケールを計算
    const frontSegmentFactor = 200 / (state.segments[0].depth + 200);

    if (!isVisible(frontSegmentFactor)) {
        // 一番前のセグメントを削除
        state.segments.shift();

        // 新しいセグメントを最後に追加
        const lastSegmentDepth = state.segments[state.segments.length - 1].depth;
        state.segments.push(new TubeSegment(lastSegmentDepth + (state.maxDepth / (state.segments.length - 1))));
    }

    for (const segment of state.segments) {
        segment.depth -= moveSpeed;
    }
    // 回転の更新
    if (isRotatingLeft) {
        rotationAngle -= rotationSpeed;
    }
    if (isRotatingRight) {
        rotationAngle += rotationSpeed;
    }
}



function gameLoop(state: GameState) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    updateTube(state);
    drawTube(state);

    requestAnimationFrame(() => gameLoop(state));
}

function drawTube(state: GameState) {
    for (const segment of state.segments) {
        drawTubeSegment(segment, state); // 2つの引数を提供
    }
}
document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'a':
        case 'A':
            isRotatingLeft = true;  // キーが押されている
            break;
        case 'd':
        case 'D':
            isRotatingRight = true;  // キーが押されている
            break;
    }
});

document.addEventListener('keyup', (e) => {
    switch (e.key) {
        case 'a':
        case 'A':
            isRotatingLeft = false;  // キーが放された
            break;
        case 'd':
        case 'D':
            isRotatingRight = false;  // キーが放された
            break;
    }
});



// ゲームを初期化して開始する関数
function startGame() {
    const gameState = new GameState(20, 1000);

    gameLoop(gameState);
}

window.onload = startGame;


