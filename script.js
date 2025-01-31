let level = 1;
let score = 0;
let highScore = localStorage.getItem("mazehighscore") || 0;
let mazeSize = 8;
let playerPosition = { x: 0, y: 0 };
let maze = [];

document.getElementById("high-score").textContent = highScore;

function generateMaze() {
    mazeSize = 8 + Math.floor(level / 3);
    maze = Array.from({ length: mazeSize }, (_, y) =>
        Array.from({ length: mazeSize }, (_, x) => ({
            x,
            y,
            isWall: Math.random() < 0.3,
            isPath: false
        }))
    );

    // Создаём путь
    let x = 0, y = 0;
    while (x < mazeSize - 1 || y < mazeSize - 1) {
        if (x < mazeSize - 1 && Math.random() > 0.5) x++;
        else if (y < mazeSize - 1) y++;
        maze[y][x].isPath = true;
    }

    // Гарантируем, что старт и финиш не в стенах
    maze[0][0].isWall = false;
    maze[mazeSize - 1][mazeSize - 1].isWall = false;

    playerPosition = { x: 0, y: 0 };
    renderMaze();
}

function renderMaze() {
    const mazeContainer = document.getElementById("maze");
    mazeContainer.innerHTML = "";
    mazeContainer.style.gridTemplateColumns = `repeat(${mazeSize}, 30px)`;

    maze.forEach((row, y) => {
        row.forEach((cell, x) => {
            const div = document.createElement("div");
            div.classList.add("cell");
            if (cell.isWall) div.classList.add("wall");
            if (x === mazeSize - 1 && y === mazeSize - 1) div.classList.add("goal");
            if (playerPosition.x === x && playerPosition.y === y) div.classList.add("player");
            mazeContainer.appendChild(div);
        });
    });
}

function movePlayer(dx, dy) {
    let newX = playerPosition.x + dx;
    let newY = playerPosition.y + dy;

    if (newX >= 0 && newX < mazeSize && newY >= 0 && newY < mazeSize) {
        if (!maze[newY][newX].isWall) {
            playerPosition = { x: newX, y: newY };
            renderMaze();

            if (newX === mazeSize - 1 && newY === mazeSize - 1) {
                score += 100 * level;
                level++;
                document.getElementById("score").textContent = score;
                document.getElementById("level").textContent = level;
                
                if (score > highScore) {
                    highScore = score;
                    localStorage.setItem("mazehighscore", highScore);
                    document.getElementById("high-score").textContent = highScore;
                }

                setTimeout(generateMaze, 500);
            }
        }
    }
}

generateMaze();
