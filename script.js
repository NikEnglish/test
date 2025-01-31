// Класс для ячейки лабиринта
class Cell {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.isWall = false;
        this.isPath = false;
        this.isVisited = false;
    }
}

// Основной класс игры
class MazeGame {
    constructor() {
        this.maze = [];
        this.playerPosition = { x: 0, y: 0 };
        this.score = 0;
        this.level = 1;
        this.difficulty = 30;
        this.mazeSize = 8 + Math.floor(this.level / 3);
        this.highScore = localStorage.getItem('mazeHighScore') || 0;
        
        this.init();
    }

    init() {
        this.generateMaze();
        this.render();
        this.setupControls();
    }

    generateMaze() {
        // Создаем пустой лабиринт
        this.maze = Array(this.mazeSize).fill().map(() => 
            Array(this.mazeSize).fill().map((_, x) => 
                new Cell(x, 0)
            )
        );

        // Создаем путь от начала до конца
        let currentX = 0;
        let currentY = 0;
        const target = { x: this.mazeSize - 1, y: this.mazeSize - 1 };

        while (currentX !== target.x || currentY !== target.y) {
            if (currentX < target.x && Math.random() > 0.5) {
                currentX++;
            } else if (currentY < target.y) {
                currentY++;
            } else {
                currentX++;
            }
            this.maze[currentY][currentX].isPath = true;
        }

        // Добавляем случайные стены
        for (let y = 0; y < this.mazeSize; y++) {
            for (let x = 0; x < this.mazeSize; x++) {
                if (!this.maze[y][x].isPath && Math.random() < this.difficulty / 100) {
                    this.maze[y][x].isWall = true;
                }
            }
        }

        // Очищаем начало и конец
        this.maze[0][0].isWall = false;
        this.maze[this.mazeSize - 1][this.mazeSize - 1].isWall = false;

        this.playerPosition = { x: 0, y: 0 };
    }

    render() {
        const root = document.getElementById('root');
        if (!root) return;

        root.innerHTML = `
            <div class="maze-container">
                <div class="maze-header">
                    <h1 class="maze-title">Лабиринт</h1>
                    <div class="maze-stats">
                        <p class="maze-stat">Уровень: ${this.level}</p>
                        <p class="maze-stat">Счет: ${this.score}</p>
                        <p class="maze-stat">Рекорд: ${this.highScore}</p>
                    </div>
                </div>

                <div class="maze-grid">
                    ${this.maze.map((row, y) => `
                        <div class="maze-row">
                            ${row.map((cell, x) => `
                                <div class="cell ${
                                    cell.isWall ? "wall" :
                                    this.playerPosition.x === x && this.playerPosition.y === y ? "player" :
                                    x === this.mazeSize - 1 && y === this.mazeSize - 1 ? "target" :
                                    "path"
                                }"></div>
                            `).join('')}
                        </div>
                    `).join('')}
                </div>

                <div class="controls">
                    <button class="control-button" onclick="game.movePlayer({x: 0, y: -1})">↑</button>
                    <button class="control-button" onclick="game.movePlayer({x: -1, y: 0})">←</button>
                    <button class="control-button" onclick="game.movePlayer({x: 0, y: 1})">↓</button>
                    <button class="control-button" onclick="game.movePlayer({x: 1, y: 0})">→</button>
                </div>
            </div>
        `;
    }

    movePlayer(direction) {
        const newPosition = {
            x: this.playerPosition.x + direction.x,
            y: this.playerPosition.y + direction.y
        };

        if (
            newPosition.x >= 0 &&
            newPosition.x < this.mazeSize &&
            newPosition.y >= 0 &&
            newPosition.y < this.mazeSize
        ) {
            if (!this.maze[newPosition.y][newPosition.x].isWall) {
                this.playerPosition = newPosition;

                if (newPosition.x === this.mazeSize - 1 && newPosition.y === this.mazeSize - 1) {
                    const levelScore = 100 * this.level;
                    this.score += levelScore;
                    
                    if (this.score > this.highScore) {
                        this.highScore = this.score;
                        localStorage.setItem('mazeHighScore', this.score.toString());
                    }

                    this.level++;
                    this.mazeSize = 8 + Math.floor(this.level / 3);
                    this.generateMaze();
                }
            }
        }

        this.render();
    }

    setupControls() {
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowUp':
                    this.movePlayer({x: 0, y: -1});
                    break;
                case 'ArrowDown':
                    this.movePlayer({x: 0, y: 1});
                    break;
                case 'ArrowLeft':
                    this.movePlayer({x: -1, y: 0});
                    break;
                case 'ArrowRight':
                    this.movePlayer({x: 1, y: 0});
                    break;
            }
        });
    }
}

// Создаем экземпляр игры
const game = new MazeGame();
