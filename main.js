let colourBG = 220; // Default background color
let backgroundImage = null;
let backgroundVideo = null;
let isVideo = false;

function setup() {
  let outputDiv = document.getElementById('output');
  let canvas = createCanvas(outputDiv.offsetWidth, outputDiv.offsetHeight);
  canvas.parent('output');
  canvas.style('width', '100%');
  canvas.style('height', '100%');

  setupBackgroundControls();
}

function setupBackgroundControls() {
  // Color picker setup
  let colourPicker = document.getElementById('colourBG');
  colourPicker.value = '#DCDCDC';
  colourPicker.style.backgroundColor = colourPicker.value;
  
  colourPicker.addEventListener('input', function() {
    colourBG = color(this.value);
    this.style.backgroundColor = this.value;
  });

  // Background upload setup
  let uploadBG = document.getElementById('uploadBG');
  uploadBG.addEventListener('change', handleBackgroundUpload);
}

function handleBackgroundUpload(e) {
  const file = e.target.files[0];
  if (file.type.startsWith('video/')) {
    setupVideoBackground(file);
  } else if (file.type.startsWith('image/')) {
    setupImageBackground(file);
  }
}

function setupVideoBackground(file) {
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
}

function setupImageBackground(file) {
  isVideo = false;
  loadImage(URL.createObjectURL(file), img => {
    backgroundImage = img;
  });
}

function drawBackground() {
  if (isVideo && backgroundVideo) {
    drawMediaBackground(backgroundVideo);
  } else if (backgroundImage) {
    drawMediaBackground(backgroundImage);
  } else {
    background(colourBG);
  }
}

function drawMediaBackground(media) {
  // Calculate scaling factors for cover effect
  let scale = Math.max(width / media.width, height / media.height);
  let w = media.width * scale;
  let h = media.height * scale;
  let x = (width - w) / 2;
  let y = (height - h) / 2;
  image(media, x, y, w, h);
}

function draw() {
  clear();
  drawBackground();
  
  fill(255, 0, 0);
  circle(width/2, height/2, 100);
}

// Resize canvas when window is resized
function windowResized() {
  let outputDiv = document.getElementById('output');
  resizeCanvas(outputDiv.offsetWidth, outputDiv.offsetHeight);
}