import mainTrack from "../assets/sounds/main_track.mp3";
import hitTrack from "../assets/sounds/hit.mp3";

// Left info panel
const angle1DOM = document.querySelector("#info-left .angle");
const velocity1DOM = document.querySelector("#info-left .velocity");
const score1DOM = document.querySelector("#info-left .score");

// Right info panel
const angle2DOM = document.querySelector("#info-right .angle");
const velocity2DOM = document.querySelector("#info-right .velocity");
const score2DOM = document.querySelector("#info-right .score");

// Congratulations panel
const congratulationsDOM = document.getElementById("congratulations");
const winnerDOM = document.getElementById("winner");
const newGameButtonDOM = document.getElementById("new-game");
const resetGameButtonDOM = document.getElementById("reset-game");

// The bomb's grab area 
const bombGrabAreaDOM = document.getElementById("bomb-grab-area");

// Main track and FX
const trackDomElement = document.createElement("audio");
trackDomElement.src = mainTrack;
trackDomElement.volume = 0.12;
trackDomElement.loop = true;

const hitDomElement = document.createElement("audio");
hitDomElement.src = hitTrack;
hitDomElement.volume = 1.0;
hitDomElement.loop = false;


let isDragging = false;
let dragStartX = undefined;
let dragStartY = undefined;

// Game state and score
let state = {};
let score = {
    player1: 0,
    player2: 0,
    max: 5
};

// Referencias dos elementos HTML
const canvas = document.getElementById("game");
// Preenchendo toda a tela do navegador
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext("2d");

// Randomize initial player
function getRandomInt(min, max) {
  min = Math.ceil(min); // Round up the minimum value
  max = Math.floor(max); // Round down the maximum value
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

let initialPlayer = getRandomInt(1, 2);

newGame();

function newGame() {

  
  // Set game state
  state = {
    scale: 1,
    phase: "aiming", // aiming | inFlight | celebrating
    //currentPlayer: 1,
    currentPlayer: initialPlayer ? initialPlayer : state.currentPlayer,
    bomb: {
      x: undefined,
      y: undefined,
      velocity: { x: 0, y: 0 },
    },
    buildings: generateBuildings(),
    score1: score.player1,
    score2: score.player2,
  };

  calculateScale();

  initializeBombPosition();

  // Reset HTML elements
  congratulationsDOM.style.visibility = "hidden";
  angle1DOM.innerText = 0;
  velocity1DOM.innerText = 0;
  score1DOM.innerText = state.score1;
  angle2DOM.innerText = 0;
  velocity2DOM.innerText = 0;
  score2DOM.innerText = state.score2;

  resetGameButtonDOM.style.visibility = "visible";  

  draw();

  initialPlayer = undefined;
}

function resetScore() {
    // Initialize game state
    score = {
        player1: 0,
        player2: 0
    }
}

function generateBuildings() {
  const buildings = [];
  for (let index = 0; index < 8; index++) {
    const previousBuilding = buildings[index - 1];
    
    const x = previousBuilding
      ? previousBuilding.x + previousBuilding.width + 4
      : 0;

    const minWidth = 80;
    const maxWidth = 130;
    const width = minWidth + Math.random() * (maxWidth - minWidth);

    const platformWithGorilla = index === 1 || index === 6;

    const minHeight = 40;
    const maxHeight = 300;
    const minHeightGorilla = 30;
    const maxHeightGorilla = 150;

    const height = platformWithGorilla
      ? minHeightGorilla + Math.random() * (maxHeightGorilla - minHeightGorilla)
      : minHeight + Math.random() * (maxHeight - minHeight);

    buildings.push({ x, width, height });
  }
  return buildings;
}

function calculateScale() {
  const lastBuilding = state.buildings.at(-1);
  const totalWidthOfTheCity = lastBuilding.x + lastBuilding.width;
  
  state.scale = window.innerWidth / totalWidthOfTheCity;
}

function initializeBombPosition() {
  const building =
    state.currentPlayer === 1
      ? state.buildings.at(1) // Second building
      : state.buildings.at(-2); // Second last building

  const gorillaX = building.x + building.width / 2;
  const gorillaY = building.height;

  const gorillaHandOffsetX = state.currentPlayer === 1 ? -28 : 28;
  const gorillaHandOffsetY = 107;

  state.bomb.x = gorillaX + gorillaHandOffsetX;
  state.bomb.y = gorillaY + gorillaHandOffsetY;
  state.bomb.velocity.x = 0;
  state.bomb.velocity.y = 0;

  // Initialize the position of the grab area in HTML
  const grabAreaRadius = 15;
  const left = state.bomb.x * state.scale - grabAreaRadius;
  const bottom = state.bomb.y * state.scale - grabAreaRadius;
  bombGrabAreaDOM.style.left = `${left}px`;
  bombGrabAreaDOM.style.bottom = `${bottom}px`;
}

function initializeMainTrack() {
    if (trackDomElement.currentTime === 0) {
        trackDomElement.play();
    } else {
        // track already playing
    }
}

function initializeHitTrack() {
    hitDomElement.play();
}

function draw() {
    ctx.save();
    // Inverte o sistema de coordenadas
    ctx.translate(0, window.innerHeight);
    ctx.scale(1, -1);
    ctx.scale(state.scale, state.scale);

    // Desenha a cena do jogo
    drawBackground();
    drawBuildings();
    drawGorilla(1);
    drawGorilla(2);
    drawBomb();

    // Restaura o sistema de coordenadas
    ctx.restore();
};

function drawBackground() {
    ctx.fillStyle = "#58A8D8";
    ctx.fillRect(
        0,
        0,
        window.innerWidth / state.scale,
        window.innerHeight / state.scale
    );
};

function drawBuildings() {
    state.buildings.forEach((building) => {
        ctx.fillStyle = "#152A47";
        ctx.fillRect(building.x, 0, building.width, building.height);
    });
};

function drawGorilla(player) {
  ctx.save();
  const building =
    player === 1
      ? state.buildings.at(1) // Second building
      : state.buildings.at(-2); // Second last building

  ctx.translate(building.x + building.width / 2, building.height);

  drawGorillaBody();
  drawGorillaLeftArm(player);
  drawGorillaRightArm(player);
  drawGorillaFace(player);
  
  ctx.restore();
};

function drawGorillaBody() {
    ctx.fillStyle = "black";

    ctx.beginPath(); 

    // Starting Position
    ctx.moveTo(0, 15); 

    // Left Leg
    ctx.lineTo(-7, 0);
    ctx.lineTo(-20, 0); 

    // Main Body
    ctx.lineTo(-13, 77);
    ctx.lineTo(0, 84);
    ctx.lineTo(13, 77); 

    // Right Leg
    ctx.lineTo(20, 0);
    ctx.lineTo(7, 0);

    ctx.fill();
}

function drawGorillaLeftArm(player) {
    ctx.strokeStyle = "black";
    ctx.lineWidth = 18;

    ctx.beginPath();
    ctx.moveTo(-13, 50);

    if (
    (state.phase === "aiming" && state.currentPlayer === 1 && player === 1) ||
    (state.phase === "celebrating" && state.currentPlayer === player)
    ) {
    ctx.quadraticCurveTo(-44, 63, -28, 107);
    } else {
    ctx.quadraticCurveTo(-44, 45, -28, 12);
    }

    ctx.stroke();
}

function drawGorillaRightArm(player) {
    ctx.strokeStyle = "black";
    ctx.lineWidth = 18;

    ctx.beginPath();
    ctx.moveTo(+13, 50);

    if (
    (state.phase === "aiming" && state.currentPlayer === 2 && player === 2) ||
    (state.phase === "celebrating" && state.currentPlayer === player)
    ) {
    ctx.quadraticCurveTo(+44, 63, +28, 107);
    } else {
    ctx.quadraticCurveTo(+44, 45, +28, 12);
    }

    ctx.stroke();
}

function drawGorillaFace(player) {
    ctx.strokeStyle = "lightgray";
    ctx.lineWidth = 3;

    ctx.beginPath();

    // Left Eye
    ctx.moveTo(-5, 70);
    ctx.lineTo(-2, 70);

    // Right Eye
    ctx.moveTo(2, 70);
    ctx.lineTo(5, 70);

    // Mouth
    if ( state.phase === "aiming" && state.currentPlayer === player || state.phase === "inFlight" && state.currentPlayer === player ) {
        // default mouth
        ctx.moveTo(-5, 62);
        ctx.lineTo(5, 62);
    } else if( state.phase === "celebrating" && state.currentPlayer === player ) {
        // draw a smile mouth
        ctx.moveTo(-5, 62);
        ctx.quadraticCurveTo(-7, 58, 7, 62);
    } else {
        // draw worried mouth
        ctx.moveTo(-7, 63);
        ctx.lineTo(-2, 62);  
    }

    ctx.stroke();
}

function drawBomb() {
  // Draw throwing trajectory
  if (state.phase === "aiming") {
    ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
    ctx.setLineDash([3, 8]);
    ctx.lineWidth = 3;
    
    ctx.beginPath();
    ctx.moveTo(state.bomb.x, state.bomb.y);
    ctx.lineTo(
      state.bomb.x + state.bomb.velocity.x,
      state.bomb.y + state.bomb.velocity.y
    );
    ctx.stroke();
  }

  // Draw circle
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(state.bomb.x, state.bomb.y, 6, 0, 2 * Math.PI);
  ctx.fill();
}

let previousAnimationTimestamp = undefined;

// Event handlers
window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  calculateScale();
  initializeBombPosition();
  draw();
});

bombGrabAreaDOM.addEventListener("mousedown", function (e) {
  if (state.phase === "aiming") {
    isDragging = true;

    dragStartX = e.clientX;
    dragStartY = e.clientY;
    
    document.body.style.cursor = "grabbing";
    initializeMainTrack();
  }
});

window.addEventListener("mousemove", function (e) {
  if (isDragging) {
    let deltaX = e.clientX - dragStartX;
    let deltaY = e.clientY - dragStartY;

    state.bomb.velocity.x = -deltaX;
    state.bomb.velocity.y = +deltaY;
    setInfo(deltaX, deltaY);

    draw();
  }
});

window.addEventListener("mouseup", function () {
  if (isDragging) {
    isDragging = false;

    document.body.style.cursor = "default";
    
    throwBomb();
  }
});

newGameButtonDOM.addEventListener("click", newGame);
resetGameButtonDOM.addEventListener("click", newGame);

function setInfo(deltaX, deltaY) {
  const hypotenuse = Math.sqrt(deltaX ** 2 + deltaY ** 2);
  const angleInRadians = Math.asin(deltaY / hypotenuse);
  const angleInDegrees = (angleInRadians / Math.PI) * 180;
  
  if (state.currentPlayer === 1) {
    angle1DOM.innerText = Math.round(angleInDegrees);
    velocity1DOM.innerText = Math.round(hypotenuse);
  } else {
    angle2DOM.innerText = Math.round(angleInDegrees);
    velocity2DOM.innerText = Math.round(hypotenuse);
  }
}

function throwBomb() {
  state.phase = "inFlight";
  previousAnimationTimestamp = undefined;
  requestAnimationFrame(animate);
}

function animate(timestamp) {
  if (!previousAnimationTimestamp) {
    previousAnimationTimestamp = timestamp;
    requestAnimationFrame(animate);
    return;
  }
  
  const elapsedTime = timestamp - previousAnimationTimestamp;

  const hitDetectionPrecision = 10;
  for (let i = 0; i < hitDetectionPrecision; i++) {
    moveBomb(elapsedTime / hitDetectionPrecision); // Hit detection

    const miss = checkFrameHit() || checkBuildingHit();
    const hit = checkGorillaHit();

    // Handle the case when we hit a building or the bomb got off-screen
    if (miss) {
        // Switch players
        switchPlayers();
        state.phase = "aiming";
        initializeBombPosition();
        draw();
        return;
    }

    // Handle the case when we hit the enemy
    if (hit) {
        initializeHitTrack();

        if (state.currentPlayer == 1) {
        score.player1++;
        score1DOM.innerText = score.player1;
        } else if (state.currentPlayer == 2) {
        score.player2++;
        score2DOM.innerText = score.player2;
        }

        if (score.player1 == score.max || score.player2 == score.max) {

        console.log('player1: ', score.player1, 'player2: ', score.player2);
        console.log(score.max);
        console.log(initialPlayer);

        state.phase = "celebrating";
        announceWinner();
        draw();
        return;
        } else {
        // Switch players
        switchPlayers();
        newGame();
        return;
        }

    }
  }

  draw();

  // Continue the animation loop
  previousAnimationTimestamp = timestamp;
  requestAnimationFrame(animate);
}

function switchPlayers() {
    return state.currentPlayer = state.currentPlayer === 1 ? 2 : 1;
}

function checkFrameHit() {
  if (
    state.bomb.y < 0 ||
    state.bomb.x < 0 ||
    state.bomb.x > window.innerWidth / state.scale
  ) {
    return true; // The bomb is off-screen
  }
}

function checkBuildingHit() {
  for (let i = 0; i < state.buildings.length; i++) {
    const building = state.buildings[i];
    if (
      state.bomb.x + 4 > building.x &&
      state.bomb.x - 4 < building.x + building.width &&
      state.bomb.y - 4 < 0 + building.height
    ) {
      return true; // Building hit
    }
  }
}

function checkGorillaHit() {
  const enemyPlayer = state.currentPlayer === 1 ? 2 : 1;
  const enemyBuilding =
    enemyPlayer === 1
      ? state.buildings.at(1) // Second building
      : state.buildings.at(-2); // Second last building

  ctx.save();

  ctx.translate(
    enemyBuilding.x + enemyBuilding.width / 2,
    enemyBuilding.height
  );

  drawGorillaBody();
  let hit = ctx.isPointInPath(state.bomb.x, state.bomb.y);

  drawGorillaLeftArm(enemyPlayer);
  hit ||= ctx.isPointInStroke(state.bomb.x, state.bomb.y);

  drawGorillaRightArm(enemyPlayer);
  hit ||= ctx.isPointInStroke(state.bomb.x, state.bomb.y);

  ctx.restore();
  
  return hit;
}

function moveBomb(elapsedTime) {
  const multiplier = elapsedTime / 200; // Adjust trajectory by gravity

  state.bomb.velocity.y -= 20 * multiplier; // Calculate new position
  
  state.bomb.x += state.bomb.velocity.x * multiplier;
  state.bomb.y += state.bomb.velocity.y * multiplier;
}

function announceWinner() {
  winnerDOM.innerText = `Player ${state.currentPlayer}`;
  congratulationsDOM.style.visibility = "visible";
  resetGameButtonDOM.style.visibility = "hidden";
  trackDomElement.pause();
  trackDomElement.currentTime = 0;
  resetScore();
}

console.log("Game loaded.");