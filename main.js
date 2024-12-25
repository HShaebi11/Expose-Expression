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

  let colourPicker = document.getElementById('colourBG');
  colourPicker.value = '#DCDCDC';
  colourPicker.style.backgroundColor = colourPicker.value;
  
  colourPicker.addEventListener('input', function() {
    colourBG = color(this.value);
    this.style.backgroundColor = this.value;
  });

  let uploadBG = document.getElementById('uploadBG');
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

function draw() {
  clear();
  
  if (isVideo && backgroundVideo) {
    // Calculate scaling factors for cover effect
    let scale = Math.max(width / backgroundVideo.width, height / backgroundVideo.height);
    let w = backgroundVideo.width * scale;
    let h = backgroundVideo.height * scale;
    let x = (width - w) / 2;
    let y = (height - h) / 2;
    image(backgroundVideo, x, y, w, h);
  } else if (backgroundImage) {
    // Calculate scaling factors for cover effect
    let scale = Math.max(width / backgroundImage.width, height / backgroundImage.height);
    let w = backgroundImage.width * scale;
    let h = backgroundImage.height * scale;
    let x = (width - w) / 2;
    let y = (height - h) / 2;
    image(backgroundImage, x, y, w, h);
  } else {
    background(colourBG);
  }
  
  fill(255, 0, 0);
  circle(width/2, height/2, 100);
}

// Resize canvas when window is resized
function windowResized() {
  let outputDiv = document.getElementById('output');
  resizeCanvas(outputDiv.offsetWidth, outputDiv.offsetHeight);
}