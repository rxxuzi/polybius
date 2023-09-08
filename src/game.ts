const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

let rotationAngle = 0; // 現在の回転角度（ラジアン）
let isRotatingLeft = false;
let isRotatingRight = false;
const rotationSpeed = Math.PI / 135; // 1フレームあたりの回転速度（1度をラジアンに変換）。現在は2度/フレーム


function drawOctagon(x: number, y: number, radius: number, angleOffset: number = 0) {
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
        let angle = Math.PI / 4 * i + rotationAngle + angleOffset; // angleOffsetを加算
        let xOffset = radius * Math.cos(angle);
        let yOffset = radius * Math.sin(angle);
        if (i === 0) {
            ctx.moveTo(x + xOffset, y + yOffset);
        } else {
            ctx.lineTo(x + xOffset, y + yOffset);
        }
    }
    ctx.closePath();
    ctx.strokeStyle = "lime";
    ctx.lineWidth = 3;
    ctx.stroke();
}


function drawTubeSegment(segment: TubeSegment, state: GameState) {
    const scaleFactor = 300 / (segment.depth + 300);
    const scaledRadius = 300 * scaleFactor * 2; // スケールファクタを2倍にして遠近効果を強化

    let segmentRotation = rotationAngle;

    switch (segment.curveDirection) {
        case 'left':
            segmentRotation += rotationSpeed;
            break;
        case 'right':
            segmentRotation -= rotationSpeed;
            break;
    }

    ctx.fillStyle = `rgba(100, 255, 100, ${scaleFactor})`; // 深度に基づくアルファを持つ色を設定
    drawOctagon(canvas.width / 2, canvas.height / 2, scaledRadius, segmentRotation);
    ctx.fill();
}


class TubeSegment {
    depth: number;
    curveDirection: 'left' | 'right' | 'straight';

    constructor(depth: number, curveDirection: 'left' | 'right' | 'straight' = 'straight') {
        this.depth = depth;
        this.curveDirection = curveDirection;
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

        const curveDirections: ('left' | 'right' | 'straight')[] = ['left', 'right', 'straight'];

        for (let i = 1; i <= numSegments; i++) {
            const randomDirection = curveDirections[Math.floor(Math.random() * curveDirections.length)];
            this.segments.push(new TubeSegment(i * depthPerSegment, randomDirection));
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
        drawTubeSegment(segment, state);  // ここを修正
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


