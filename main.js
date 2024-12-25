let colourBG = 220;
let backgroundImage = null;
let backgroundVideo = null;
let isVideo = false;
let tiles = [];
const rows = 15;
const cols = 20;
let time = 0;
let font;
let pg;
let tX, tY, sp, dspx, dspy, fct;

function setup() {
  let outputDiv = document.getElementById('output');
  let canvas = createCanvas(outputDiv.offsetWidth, outputDiv.offsetHeight);
  canvas.parent('output');
  canvas.style('width', '100%');
  canvas.style('height', '100%');

  // Initialize PGraphics and sliders
  pg = createGraphics(width, height);
  createSliders();

  // Recalculate tile size to fill canvas
  const tileSize = Math.min(width / cols, height / rows);
  
  // Clear existing tiles
  tiles = [];
  
  // Initialize tiles with enhanced random properties
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      tiles.push({
        x: j * tileSize,
        y: i * tileSize,
        size: tileSize,
        amplitude: random(10, 25),
        period: random(1.5, 3.5),
        phase: random(TWO_PI),
        velocity: random(-2, 2),
        chaos: random(0.1, 0.3),
        speedMultiplier: random(1, 2.5)
      });
    }
  }

  // Color picker setup
  let colourPicker = document.getElementById('colourBG');
  if (colourPicker) {
    colourPicker.value = '#DCDCDC';
    colourPicker.style.backgroundColor = colourPicker.value;
    
    colourPicker.addEventListener('input', function() {
      colourBG = color(this.value);
      this.style.backgroundColor = this.value;
    });
  }

  // Background upload setup
  let uploadBG = document.getElementById('uploadBG');
  if (uploadBG) {
    uploadBG.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (file.type.startsWith('video/')) {
        isVideo = true;
        if (backgroundVideo) {
          backgroundVideo.remove();
        }
        backgroundVideo = createVideo(URL.createObjectURL(file), () => {
          backgroundVideo.loop();
          backgroundVideo.hide();
          backgroundVideo.volume(0);
          backgroundVideo.play();
        });
      } else if (file.type.startsWith('image/')) {
        isVideo = false;
        loadImage(URL.createObjectURL(file), img => {
          backgroundImage = img;
        });
      }
    });
  }
}

function draw() {
  clear();
  
  // Handle background
  if (isVideo && backgroundVideo) {
    let scale = Math.max(width / backgroundVideo.width, height / backgroundVideo.height);
    let w = backgroundVideo.width * scale;
    let h = backgroundVideo.height * scale;
    let x = (width - w) / 2;
    let y = (height - h) / 2;
    image(backgroundVideo, x, y, w, h);
  } else if (backgroundImage) {
    let scale = Math.max(width / backgroundImage.width, height / backgroundImage.height);
    let w = backgroundImage.width * scale;
    let h = backgroundImage.height * scale;
    let x = (width - w) / 2;
    let y = (height - h) / 2;
    image(backgroundImage, x, y, w, h);
  } else {
    background(colourBG);
  }

  // Draw kinetic typography
  pg.background(0, 0, 0, 0); // transparent background
  pg.fill(255);
  pg.textAlign(CENTER, CENTER);
  
  // Calculate dynamic text size based on text length
  let inputText = textInput.value || 'a';
  let textSize = height / (2 + inputText.length * 0.2); // Adjust text size based on length
  pg.textSize(textSize);
  
  pg.push();
  pg.translate(width/2, height/2);
  pg.text(inputText, 0, 0);
  pg.pop();

  let tilesX = parseInt(tX.value);
  let tilesY = parseInt(tY.value);
  let tileW = int(width/tilesX);
  let tileH = int(height/tilesY);

  for (let y = 0; y < tilesY; y++) {
    for (let x = 0; x < tilesX; x++) {
      let waveX = int(sin(frameCount * parseFloat(sp.value) + (x * y) * parseFloat(dspx.value)) * parseFloat(fct.value));
      let waveY = int(sin(frameCount * parseFloat(sp.value) + (x * y) * parseFloat(dspy.value)) * parseFloat(fct.value));

      if (parseFloat(dspx.value) === 0) waveX = 0;
      if (parseFloat(dspy.value) === 0) waveY = 0;
      
      let sx = x*tileW + waveX;
      let sy = y*tileH + waveY;
      copy(pg, sx, sy, tileW, tileH, x*tileW, y*tileH, tileW, tileH);
    }
  }

  // Draw existing wave animation
  noStroke();
  fill(255, 255, 255, 100);

  for (let tile of tiles) {
    let dx = mouseX - (tile.x + tile.size/2);
    let dy = mouseY - (tile.y + tile.size/2);
    let distance = sqrt(dx*dx + dy*dy);
    
    let repulsionForce = 200 / (distance + 1);
    
    let noiseVal = noise(tile.x * 0.01, tile.y * 0.01, time) * 20;
    
    let baseOffset = tile.amplitude * sin(time * tile.period * tile.speedMultiplier + tile.phase);
    let mouseOffset = repulsionForce * 25 * sin(distance * 0.03 - time * 3);
    let chaosOffset = noiseVal * tile.chaos;
    
    tile.velocity += (mouseOffset + chaosOffset - tile.velocity) * 0.15;
    tile.velocity *= 0.98;
    
    let totalOffset = baseOffset + tile.velocity;

    beginShape();
    vertex(tile.x, tile.y + totalOffset);
    vertex(tile.x + tile.size, tile.y + totalOffset);
    vertex(tile.x + tile.size, tile.y + tile.size + totalOffset);
    vertex(tile.x, tile.y + tile.size + totalOffset);
    endShape(CLOSE);
  }

  time += 0.04;
}

function windowResized() {
  let outputDiv = document.getElementById('output');
  resizeCanvas(outputDiv.offsetWidth, outputDiv.offsetHeight);
  
  const tileSize = Math.min(width / cols, height / rows);
  tiles.forEach((tile, index) => {
    let i = Math.floor(index / cols);
    let j = index % cols;
    tile.x = j * tileSize;
    tile.y = i * tileSize;
    tile.size = tileSize;
  });
}

function createSliders() {
  // Get all range inputs
  tX = document.getElementById('rangeTX');
  tY = document.getElementById('rangeTY');
  sp = document.getElementById('rangeSpeed');
  dspx = document.getElementById('rangeDX');
  dspy = document.getElementById('rangeDY');
  fct = document.getElementById('rangeOffset');

  // Add event listeners to update display values
  tX.addEventListener('input', () => {
    document.getElementById('rangeValueTX').textContent = tX.value;
  });
  tY.addEventListener('input', () => {
    document.getElementById('rangeValueTY').textContent = tY.value;
  });
  sp.addEventListener('input', () => {
    document.getElementById('rangeValueSpeed').textContent = sp.value;
  });
  dspx.addEventListener('input', () => {
    document.getElementById('rangeValueDX').textContent = dspx.value;
  });
  dspy.addEventListener('input', () => {
    document.getElementById('rangeValueDY').textContent = dspy.value;
  });
  fct.addEventListener('input', () => {
    document.getElementById('rangeValueOffset').textContent = fct.value;
  });
}