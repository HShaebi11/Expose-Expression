let colourBG = 220;
let backgroundImage = null;
let backgroundVideo = null;
let isVideo = false;
let font;
let pg;
let tX, tY, sp, dspx, dspy, fct;
let colourText = 255; // Default white text
let tpx, tpy;
let tsx, tsy;
let ts, tw, tt, tl;  // New control variables

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
  
  // Handle background first
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

  // Clear the PGraphics buffer
  pg.clear();
  pg.background(0, 0, 0, 0); // transparent background
  pg.fill(colourText);
  pg.textAlign(CENTER, CENTER);
  
  let inputText = textInput.value;
  
  // Apply text size from slider instead of calculating
  let baseSize = parseFloat(ts.value);
  pg.textSize(baseSize);
  
  // Apply text weight if supported
  if (pg.textStyle) {
    pg.textStyle(parseFloat(tw.value));
  }
  
  // Apply tracking (letter spacing)
  let tracking = parseFloat(tt.value) / 100;  // Convert percentage to decimal
  let leading = parseFloat(tl.value) / 100;   // Convert percentage to decimal
  
  pg.push();
  pg.translate(width/2 + parseFloat(tpx.value) * 5, height/2 + parseFloat(tpy.value) * 5);
  pg.scale(parseFloat(tsx.value), parseFloat(tsy.value));
  
  // Draw text with tracking and leading
  if (inputText) {
    let chars = inputText.split('');
    let totalWidth = 0;
    
    // Calculate total width with tracking
    chars.forEach(char => {
      totalWidth += pg.textWidth(char) * (1 + tracking);
    });
    
    // Center the text
    let xPos = -totalWidth / 2;
    let yPos = 0;
    
    // Draw each character with tracking
    chars.forEach(char => {
      pg.text(char, xPos, yPos);
      xPos += pg.textWidth(char) * (1 + tracking);
      yPos += baseSize * leading;  // Apply leading
    });
  }
  
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
  tpx = document.getElementById('rangeTPX');
  tpy = document.getElementById('rangeTPY');
  tsx = document.getElementById('rangeTSX');
  tsy = document.getElementById('rangeTSY');
  ts = document.getElementById('rangeTS');
  tw = document.getElementById('rangeTW');
  tt = document.getElementById('rangeTT');
  tl = document.getElementById('rangeTL');

  // Initialize all range value displays with their corresponding slider values
  initializeRangeValue('rangeValueTX', tX);
  initializeRangeValue('rangeValueTY', tY);
  initializeRangeValue('rangeValueSpeed', sp);
  initializeRangeValue('rangeValueDX', dspx);
  initializeRangeValue('rangeValueDY', dspy);
  initializeRangeValue('rangeValueOffset', fct);
  initializeRangeValue('rangeValueTPX', tpx);
  initializeRangeValue('rangeValueTPY', tpy);
  initializeRangeValue('rangeValueTSX', tsx);
  initializeRangeValue('rangeValueTSY', tsy);
  initializeRangeValue('rangeValueTS', ts);
  initializeRangeValue('rangeValueTW', tw);
  initializeRangeValue('rangeValueTT', tt, '%');
  initializeRangeValue('rangeValueTL', tl, '%');

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
  tpx.addEventListener('input', () => {
    document.getElementById('rangeValueTPX').textContent = tpx.value;
  });
  tpy.addEventListener('input', () => {
    document.getElementById('rangeValueTPY').textContent = tpy.value;
  });
  tsx.addEventListener('input', () => {
    document.getElementById('rangeValueTSX').textContent = tsx.value;
    console.log('TSX changed:', tsx.value);
  });
  tsy.addEventListener('input', () => {
    document.getElementById('rangeValueTSY').textContent = tsy.value;
    console.log('TSY changed:', tsy.value);
  });

  // Add event listeners for new controls
  if (ts) {
    ts.addEventListener('input', () => {
      document.getElementById('rangeValueTS').textContent = ts.value;
    });
  }
  if (tw) {
    tw.addEventListener('input', () => {
      document.getElementById('rangeValueTW').textContent = tw.value;
    });
  }
  if (tt) {
    tt.addEventListener('input', () => {
      document.getElementById('rangeValueTT').textContent = tt.value + '%';
    });
  }
  if (tl) {
    tl.addEventListener('input', () => {
      document.getElementById('rangeValueTL').textContent = tl.value + '%';
    });
  }
}

// Helper function to initialize range value displays
function initializeRangeValue(displayId, slider, suffix = '') {
  const display = document.getElementById(displayId);
  if (display && slider) {
    display.textContent = slider.value + suffix;
  }
}