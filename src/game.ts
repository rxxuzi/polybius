const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;


function drawOctagon(x: number, y: number, radius: number) {
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
        let angle = Math.PI / 4 * i;
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

function drawTubeSection(centerX: number, centerY: number, radius: number, depth: number) {
    const scaleFactor = 200 / (depth + 200); // 奥行きに応じたスケールファクター
    const scaledRadius = radius * scaleFactor;

    drawOctagon(centerX, centerY, scaledRadius);
}

function drawTubeSegment(segment: TubeSegment) {
    const scaleFactor = 200 / (segment.depth + 200);
    const scaledRadius = 300 * scaleFactor;

    drawOctagon(canvas.width / 2, canvas.height / 2, scaledRadius);
}

function drawTube(state: GameState) {
    for (const segment of state.segments) {
        drawTubeSegment(segment);
    }
}


class TubeSegment {
    depth: number;

    constructor(depth: number) {
        this.depth = depth;
    }
}

class GameState {
    segments: TubeSegment[] = [];

    constructor(numSegments: number, maxDepth: number) {
        const depthPerSegment = maxDepth / numSegments;

        for (let i = 1; i <= numSegments; i++) {
            this.segments.push(new TubeSegment(i * depthPerSegment));
        }
    }
}


function isVisible(scaleFactor: number, radius: number): boolean {
    const scaledRadius = radius * scaleFactor;
    return scaledRadius > 1; // 1ピクセル以上のサイズであれば、表示中と判断
}

function updateTube(state: GameState) {
    const moveSpeed = 5;
    const maxDepth = 1000;
    let resetDepth = maxDepth;

    for (const segment of state.segments) {
        segment.depth -= moveSpeed;

        const scaleFactor = 200 / (segment.depth + 200);

        if (!isVisible(scaleFactor, 300)) {
            segment.depth = resetDepth;
            resetDepth += moveSpeed;  // 次のセグメントが少し奥に配置されるように
        }
    }
}



function gameLoop(state: GameState) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    updateTube(state);
    drawTube(state);

    requestAnimationFrame(() => gameLoop(state));
}



// ゲームを初期化して開始する関数
function startGame() {
    const gameState = new GameState(20, 1000);

    gameLoop(gameState);
}

window.onload = startGame;

