let REFRESH_TIME = 2000
let GEN_PROB = 0.2

let HEIGHT;
let WIDTH;
let CELL;
let GRID_ROWS;
let GRID_COLS;
let WORLD;
let STATE = 0;
let EXIT = 0;
let WORLD_COPY;
let isRunning = true;
let resizeTimeout;

function updateState(ctx){
    let old = STATE;
    STATE = 1 - STATE;
    const dx = [-1, 0, 1];
    const dy = [-1, 0, 1];
    let population = 0;

    for(let i = 0; i < GRID_COLS; i++){
        for(let j = 0; j < GRID_ROWS; j++){
            WORLD[STATE][i][j] = 0;
        }
    }
    for(let i = 0; i < GRID_COLS; i++){
        for(let j = 0; j < GRID_ROWS; j++){
            let neighbours = 0;
            for(let ix = 0; ix < 3; ix++){
                for(let iy = 0; iy < 3; iy++){
                    if(dx[ix] == 0 && dy[iy] == 0){
                        continue;
                    }
                    const x = i + dx[ix];
                    const y = j + dy[iy];
                    if(x >= 0 && x < GRID_COLS && y >= 0 && y < GRID_ROWS && WORLD[old][x][y] === 1){
                        neighbours++;
                    }
                }
            }
            if(WORLD[old][i][j] === 1){
                if(neighbours != 2 && neighbours != 3){
                    WORLD[STATE][i][j] = 0;
                }
                else{
                    WORLD[STATE][i][j] = 1;
                    population++;
                }
            }
            else {
                if(neighbours === 3){
                    WORLD[STATE][i][j] = 1;
                    population++;
                }
            }
        }
    }
    const populationPara = document.getElementById("population");
    populationPara.textContent = "Population: " + population;
    if(population === 0){
        EXIT = 1;
        resetWorld(ctx);
        setInitialState();
        return;
    }
    if(STATE === 0){
        let isSame = true;
        for(let i = 0; i < GRID_COLS; i++){
            for(let j = 0; j < GRID_ROWS; j++){
                if(WORLD[STATE][i][j] !== WORLD_COPY[i][j]){
                    isSame = false;
                }
                WORLD_COPY[i][j] = WORLD[STATE][i][j];
            }
        }
        if(isSame){
            const resetButton = document.getElementById("reset-button");
            resetButton.click();
        }
    }
}

function renderWorld(ctx){
    for(let i = 0; i < GRID_COLS; i++){
        for(let j = 0; j < GRID_ROWS; j++){
            if(WORLD[STATE][i][j] === 1){
                ctx.fillStyle = "#cfeaee";
                ctx.fillRect(i * CELL, j * CELL, CELL, CELL);
            }
        }
    }
}

function setInitialState(){
    STATE = 0;
    WORLD = Array.from({ length: 2 }, () => Array.from({ length: GRID_COLS }, () => Array(GRID_ROWS).fill(0)));
    WORLD_COPY = WORLD[0].map(row => row.slice());
    for(let i = 0; i < GRID_COLS; i++){
        for(let j = 0; j < GRID_ROWS; j++){
            if(i > GRID_COLS/10 && i < 5*GRID_COLS/10 && j > GRID_ROWS/16){
                continue;
            }
            WORLD[STATE][i][j] = (Math.random() > 1 - GEN_PROB ? 1 : 0);
        }
    }
}

function resetWorld(ctx){
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
}

(() => {
    const canvas = document.getElementById("main-canvas");
    if (canvas === null) {
        throw new Error("No canvas element is present with id `main-canvas`");
    }
    
    const ctx = canvas.getContext("2d");
    if (ctx === null) {
        throw new Error("2d context not supported");
    }

    function resizeCanvas() {
        clearTimeout(resizeTimeout);

        resizeTimeout = setTimeout(() => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            EXIT = 1;
            HEIGHT = canvas.height;
            WIDTH = canvas.width;
            GRID_ROWS = Math.floor(HEIGHT/CELL);
            GRID_COLS = Math.floor(WIDTH/CELL);
            WORLD = Array.from({ length: 2 }, () => Array.from({ length: GRID_COLS }, () => Array(GRID_ROWS).fill(0)));
            setInitialState();
            gameloop();
        }, 500)
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    CELL = 25;
    HEIGHT = canvas.height;
    WIDTH = canvas.width;
    GRID_ROWS = Math.floor(HEIGHT/CELL);
    GRID_COLS = Math.floor(WIDTH/CELL);
    WORLD = Array.from({ length: 2 }, () => Array.from({ length: GRID_COLS }, () => Array(GRID_ROWS).fill(0)));
    WORLD_COPY = WORLD[0].map(row => row.slice());


    const buttonCont = document.getElementById("button-cont");
    const startButton = document.getElementById("start-button");
    const startImage = document.getElementById("start-image");
    const resetButton = document.getElementById("reset-button");
    const plusButton = document.getElementById("plus-button");
    const minusButton = document.getElementById("minus-button");
    const population = document.getElementById("population");
    const refreshtime = document.getElementById("refresh-time");

    refreshtime.textContent = "Refresh time: " + REFRESH_TIME + "ms";

    buttonCont.addEventListener('mouseover', () => {
        population.style.display = 'block';
        refreshtime.style.display = 'block';
    }, true);
    
    buttonCont.addEventListener('mouseout', () => {
        population.style.display = 'none';
        refreshtime.style.display = 'none';
    }, true);

    startButton.addEventListener('click', () => {
        if(isRunning){
            EXIT = 1;
            isRunning = false;
            startImage.src = "others/play.png";
        }
        else{
            isRunning = true;
            startImage.src = "others/pause.png";
            gameloop();
        }
    }, true);

    resetButton.addEventListener('click', () => {
        setInitialState();
        resetWorld(ctx);
    }, true);
    
    plusButton.addEventListener('click', () => {
        REFRESH_TIME += 100
        refreshtime.textContent = "Refresh time: " + REFRESH_TIME + "ms";
    }, true);
    
    minusButton.addEventListener('click', () => {
        REFRESH_TIME -= Math.min(REFRESH_TIME - 100, 100)
        refreshtime.textContent = "Refresh time: " + REFRESH_TIME + "ms";
    }, true);

    setInitialState();
    function gameloop() {
        if (EXIT === 1) {
            EXIT = 0;
            return;
        }
        resetWorld(ctx);
        updateState(ctx);
        renderWorld(ctx);
        setTimeout(() => { requestAnimationFrame(gameloop); }, REFRESH_TIME);
    }
    gameloop();
})();
