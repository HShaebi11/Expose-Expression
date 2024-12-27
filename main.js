let font;
let pg;
let textE1 = "666";

let E1TX = 20;      // Number of tiles in X direction
let E1TY = 20;      // Number of tiles in Y direction
let E1Speed = 0.02; // Speed of the wave animation
let E1DX = 0.1;     // Wave density X
let E1DY = 0.1;     // Wave density Y
let E1Offset = 20;  // How far the tiles move

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent('output');
  pg = createGraphics(windowWidth, windowHeight);
}

function draw() {
  // Update variables from sliders and display their values
  E1TX = document.getElementById('rangeE1TX').value;
  document.getElementById('rangeValueE1TX').textContent = E1TX;

  E1TY = document.getElementById('rangeE1TY').value;
  document.getElementById('rangeValueE1TY').textContent = E1TY;

  E1DX = document.getElementById('rangeE1DX').value;
  document.getElementById('rangeValueE1DX').textContent = E1DX;

  E1DY = document.getElementById('rangeE1DY').value;
  document.getElementById('rangeValueE1DY').textContent = E1DY;

  E1Offset = document.getElementById('rangeE1Offset').value;
  document.getElementById('rangeValueE1Offset').textContent = E1Offset;

  E1Speed = document.getElementById('rangeE1Speed').value;
  document.getElementById('rangeValueE1Speed').textContent = E1Speed;

  background(0);

  // PGraphics
  pg.background(0, 0);
  pg.fill(255);
  pg.textSize(400);
  pg.push();
  pg.translate(width/2, height/2);
  pg.textAlign(CENTER, CENTER);
  pg.text(textE1, 0, 0);
  pg.pop();

  let E1tilesX = E1TX;
  let E1tilesY = E1TY;

  let E1tileW = int(width/E1tilesX);
  let E1tileH = int(height/E1tilesY);

  for (let y = 0; y < E1tilesY; y++) {
    for (let x = 0; x < E1tilesX; x++) {

      // WARP
      let E1waveX = int(sin(frameCount * E1Speed + (x * y) * E1DX) * E1Offset);
      let E1waveY = int(sin(frameCount * E1Speed + (x * y) * E1DY) * E1Offset);

      // Remove or comment these out
      // if (0 === 0){
      //     E1waveX = 0;
      // }
      // if (0 === 0){
      //     E1waveY = 0;
      // }
      
      // image(pg,0,0)
      
      // SOURCE
      let E1sx = x*E1tileW + E1waveX;
      let E1sy = y*E1tileH + E1waveY;
      let E1sw = E1tileW;
      let E1sh = E1tileH;


      // DESTINATION
      let E1dx = x*E1tileW;
      let E1dy = y*E1tileH;
      let E1dw = E1tileW;
      let E1dh = E1tileH;



      copy(pg, E1sx, E1sy, E1sw, E1sh, E1dx, E1dy, E1dw, E1dh);

    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  pg.resizeCanvas(windowWidth, windowHeight);
}