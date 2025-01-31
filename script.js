let maze = [];
let playerPosition = { x: 0, y: 0 };
let score = 0;
let level = 1;
let difficulty = 30;
let soundEnabled = true;
let mazeSize = 8;
let highScore = localStorage.getItem('mazehighscore') || 0;

const sounds = {
    move: new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'),
    wall: new Audio('https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3'),
    win: new Audio('https://assets.mixkit.co/active_storage/sfx/2573/2573-preview.mp3')
};

function playSound(type) {
    if (!soundEnabled) return;
    sounds[type].play().catch(console.error);
}

function createCell(x, y, isWall = false) {
    return {
        x,
        y,
        isWall,
        isPath: false,
        isVisited: false
    };
}

function generateMaze() {
    mazeSize = 8 + Math.floor(level / 3);
    maze = Array(mazeSize).fill(null).map((_, y) =>
        Array(mazeSize).fill(null).map((_, x) => createCell(x, y))
    );

    // Create path from start to finish
    let currentX = 0;
    let currentY = 0;
    const target = { x: mazeSize - 1, y: mazeSize - 1 };
    
    while (currentX !== target.x || currentY !== target.y) {
        if (currentX < target.x && Math.random() > 0.5) {
            currentX++;
        } else if (currentY < target.y) {
            currentY++;
        } else {
            currentX++;
        }
        maze[currentY][currentX].isPath = true;
    }

    // Add random walls
    for (let y = 0; y < mazeSize; y++) {
        for (let x = 0; x < mazeSize; x++) {
            if (!maze[y][x].isPath && Math.random() < difficulty / 100) {
                maze[y][x].isWall = true;
            }
        }
    }

    maze[0][0].isWall = false;
    maze[mazeSize - 1][mazeSize - 1].isWall = false;
    playerPosition = { x: 0, y: 0 };
    renderMaze();
}

function renderMaze() {
    const mazeElement = document.getElementById('maze');
    mazeElement.style.gridTemplateColumns = `repeat(${mazeSize}, 1fr)`;
    mazeElement.innerHTML = '';

    for (let y = 0; y < mazeSize; y++) {
        for (let x = 0; x < mazeSize; x++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            
            if (x === playerPosition.x && y === playerPosition.y) {
                cell.classList.add('player');
            } else if (x === mazeSize - 1 && y === mazeSize - 1) {
                cell.classList.add('target');
            } else if (maze[y][x].isWall) {
                cell.classList.add('wall');
            } else {
                cell.classList.add('empty');
            }
            
            mazeElement.appendChild(cell);
        }
    }
}

function showToast(message, isError = false) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.style.backgroundColor = isError ? '#f44336' : '#333';
    toast.style.display = 'block';
    setTimeout(() => {
        toast.style.display = 'none';
    }, 2000);
}

function movePlayer(dx, dy) {
    const newPosition = {
        x: playerPosition.x + dx,
        y: playerPosition.y + dy
    };

    if (
        newPosition.x >= 0 &&
        newPosition.x < mazeSize &&
        newPosition.y >= 0 &&
        newPosition.y < mazeSize
    ) {
        if (!maze[newPosition.y][newPosition.x].isWall) {
            playerPosition = newPosition;
            playSound('move');
            
            if (newPosition.x === mazeSize - 1 && newPosition.y === mazeSize - 1) {
                const levelScore = 100 * level;
                score += levelScore;
                if (score > highScore) {
                    highScore = score;
                    localStorage.setItem('mazehighscore', highScore);
                }
                playSound('win');
                showToast(`Уровень пройден! +${levelScore} очков!`);
                level++;
                generateMaze();
            } else {
                renderMaze();
            }
            updateStats();
        } else {
            playSound('wall');
            showToast('Упс! Там стена!', true);
        }
    }
}

function updateStats() {
    document.getElementById('level').textContent = level;
    document.getElementById('score').textContent = score;
    document.getElementById('highscore').textContent = highScore;
}

// Settings modal
const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const difficultySlider = document.getElementById('difficulty');
const difficultyValue = document.getElementById('difficulty-value');
const soundToggle = document.getElementById('sound-toggle');

settingsBtn.onclick = () => settingsModal.style.display = 'block';

function closeSettings() {
    settingsModal.style.display = 'none';
}

difficultySlider.oninput = function() {
    difficulty = this.value;
    difficultyValue.textContent = difficulty;
    generateMaze();
};

soundToggle.onchange = function() {
    soundEnabled = this.checked;
};

window.onclick = function(event) {
    if (event.target === settingsModal) {
        closeSettings();
    }
};

// Keyboard controls
document.addEventListener('keydown', (e) => {
    switch(e.key) {
        case 'ArrowUp':
            movePlayer(0, -1);
            break;
        case 'ArrowDown':
            movePlayer(0, 1);
            break;
        case 'ArrowLeft':
            movePlayer(-1, 0);
            break;
        case 'ArrowRight':
            movePlayer(1, 0);
            break;
    }
});

// Initialize game
generateMaze();
updateStats();
