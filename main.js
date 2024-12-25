let colourBG = 220;
let backgroundImage = null;
let backgroundVideo = null;
let isVideo = false;
let font;
let pg;
let tX, tY, sp, dspx, dspy, fct;
let colourText = 255; // Default white text

function setup() {
  let outputDiv = document.getElementById('output');
  let canvas = createCanvas(outputDiv.offsetWidth, outputDiv.offsetHeight);
  canvas.parent('output');
  canvas.style('width', '100%');
  canvas.style('height', '100%');

  // Initialize PGraphics and sliders
  pg = createGraphics(width, height);
  createSliders();

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

  // Add text color picker setup
  let textColorPicker = document.getElementById('colourText');
  if (textColorPicker) {
    textColorPicker.value = '#FFFFFF';
    textColorPicker.style.backgroundColor = textColorPicker.value;
    
    textColorPicker.addEventListener('input', function() {
      colourText = color(this.value);
      this.style.backgroundColor = this.value;
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
  pg.fill(colourText); // Use the selected text color instead of hardcoded white
  pg.textAlign(CENTER, CENTER);
  
  // Calculate dynamic text size based on text length
  let inputText = textInput.value;
  let textSize = height / (2 + (inputText ? inputText.length : 0) * 0.2);
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
}

function windowResized() {
  let outputDiv = document.getElementById('output');
  resizeCanvas(outputDiv.offsetWidth, outputDiv.offsetHeight);
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