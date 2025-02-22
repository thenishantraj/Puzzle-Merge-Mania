const GRID_SIZE = 6;
const INITIAL_TILES = 2;
let grid = [];
let score = 0;
let level = 1;
let goalScore = 100;
let powerUps = { hammer: 1, undo: 1 };
let prevState = null;

const gridElement = document.getElementById('grid');
const scoreElement = document.getElementById('score');
const goalElement = document.getElementById('goal');
const levelElement = document.getElementById('level');
const hammerCountElement = document.getElementById('hammer-count');
const undoCountElement = document.getElementById('undo-count');
const undoButton = document.getElementById('undo-btn');

// Initialize the game
function initGame() {
    grid = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0));
    for (let i = 0; i < INITIAL_TILES; i++) {
        addRandomTile();
    }
    renderGrid();
}

// Add a random tile (2 or 4)
function addRandomTile() {
    const emptyCells = [];
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            if (grid[i][j] === 0) emptyCells.push({ x: i, y: j });
        }
    }
    if (emptyCells.length > 0) {
        const { x, y } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        grid[x][y] = Math.random() > 0.5 ? 4 : 2;
    }
}

// Render the grid
function renderGrid() {
    gridElement.innerHTML = '';
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            const tile = document.createElement('div');
            tile.className = `tile tile-${grid[i][j]}`;
            tile.textContent = grid[i][j] !== 0 ? grid[i][j] : '';
            tile.onclick = () => useHammer(i, j);
            gridElement.appendChild(tile);
        }
    }
    updateUI();
}

// Update score, level, and power-ups UI
function updateUI() {
    scoreElement.textContent = score;
    goalElement.textContent = goalScore;
    levelElement.textContent = level;
    hammerCountElement.textContent = powerUps.hammer;
    undoCountElement.textContent = powerUps.undo;
    undoButton.disabled = powerUps.undo === 0 || !prevState;
}

// Merge tiles (only right direction implemented for simplicity)
function moveTiles(direction) {
    prevState = { grid: grid.map(row => [...row]), score }; // Save state for undo
    let newGrid = grid.map(row => [...row]);
    let mergeScore = 0;

    if (direction === 'right') {
        for (let i = 0; i < GRID_SIZE; i++) {
            let row = newGrid[i].filter(val => val !== 0);
            for (let j = row.length - 1; j > 0; j--) {
                if (row[j] === row[j - 1]) {
                    row[j] *= 2;
                    row[j - 1] = 0;
                    mergeScore += row[j];
                }
            }
            row = row.filter(val => val !== 0);
            newGrid[i] = [...Array(GRID_SIZE - row.length).fill(0), ...row];
        }
    }

    grid = newGrid;
    addRandomTile();
    score += mergeScore;
    renderGrid();

    // Check level progression
    if (score >= goalScore) {
        level++;
        goalScore = 100 * level;
        alert(`Level ${level - 1} Complete! Moving to Level ${level}`);
    }
}

// Power-up: Hammer (remove a tile)
function useHammer(x, y) {
    if (powerUps.hammer > 0 && grid[x][y] !== 0) {
        grid[x][y] = 0;
        powerUps.hammer--;
        renderGrid();
    }
}

// Power-up: Undo
function useUndo() {
    if (powerUps.undo > 0 && prevState) {
        grid = prevState.grid.map(row => [...row]);
        score = prevState.score;
        powerUps.undo--;
        renderGrid();
    }
}

// Add hammer via "ad"
function addHammer() {
    powerUps.hammer++;
    renderGrid();
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') moveTiles('right');
    // Add other directions: 'ArrowLeft', 'ArrowUp', 'ArrowDown'
});

// Start the game
initGame();