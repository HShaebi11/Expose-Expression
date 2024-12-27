let backgroundHandler = {
  type: 'color',  // 'color', 'image', or 'video'
  color: 220,
  defaultColor: 220,
  image: null,
  video: null,
  
  // Method to draw the current background
  draw: function() {
    switch(this.type) {
      case 'video':
        if (this.video) {
          this.drawMedia(this.video);
        }
        break;
      case 'image':
        if (this.image) {
          this.drawMedia(this.image);
        }
        break;
      default:
        background(this.color);
    }
  },

  // Helper method for drawing media with proper scaling
  drawMedia: function(media) {
    let scale = Math.max(width / media.width, height / media.height);
    let w = media.width * scale;
    let h = media.height * scale;
    let x = (width - w) / 2;
    let y = (height - h) / 2;
    image(media, x, y, w, h);
  },

  // Method to update background
  setBackground: function(input) {
    if (typeof input === 'string') {  // Color string
      this.type = 'color';
      this.color = color(input);
    } else if (input instanceof p5.Image) {
      this.type = 'image';
      this.image = input;
    } else if (input instanceof p5.MediaElement) {
      this.type = 'video';
      if (this.video) {
        this.video.remove();
      }
      this.video = input;
      this.video.loop();
      this.video.hide();
      this.video.volume(0);
    }
  },

  // Add reset method
  reset: function() {
    // Remove video if it exists
    if (this.video) {
      this.video.remove();
      this.video = null;
    }
    
    // Clear image
    this.image = null;
    
    // Reset to default color
    this.type = 'color';
    this.color = this.defaultColor;
    
    // Reset color picker if it exists
    let colorPicker = document.getElementById('colourBG');
    if (colorPicker) {
      colorPicker.value = '#DCDCDC';  // Default color in hex
      colorPicker.style.backgroundColor = colorPicker.value;
    }
    
    // Reset file input if it exists
    let uploadBG = document.getElementById('uploadBG');
    if (uploadBG) {
      uploadBG.value = '';  // Clear the file input
    }
  }
};

let colourBG = 220;
let backgroundImage = null;
let backgroundVideo = null;
let isVideo = false;
let font;
let pg;


let E1Colour = 255; // Default white text
let E1; // Variable to store the text
let E1Type = 'text'; // Can be 'text', 'svg', 'image', or 'video'
let E1Media = null;

// GRID AND ANIMATION CONTROLS
let tXE1, tYE1;    // Tile Count X & Y
let spE1;            // Speed
let dspxE1, dspyE1;    // Displacement X & Y
let fctE1;           // Factor/Offset

// TEXT STYLE CONTROLS
let textScaleXE1, textScaleYE1;    // Scale X & Y
let tsE1;                // Text Size
let twE1;                // Text Weight
let ttE1;                // Text Tracking
let tlE1;                // Text Leading

function setup() {
  // Get the parent div element
  let outputDiv = document.getElementById('output');
  
  // Create canvas with the same dimensions as the parent div
  let canvas = createCanvas(outputDiv.offsetWidth, outputDiv.offsetHeight);
  
  // Move the canvas inside the output div
  canvas.parent('output');
  
  // Optional: Add window resize handling
  window.addEventListener('resize', function() {
    resizeCanvas(outputDiv.offsetWidth, outputDiv.offsetHeight);
  });

  // Initialize PGraphics and sliders
  pg = createGraphics(width, height);
  createSliders();

  // Background controls setup
  let colourBG = document.getElementById('colourBG');
  if (colourBG) {
    colourBG.value = '#DCDCDC';
    colourBG.style.backgroundColor = colourBG.value;
    
    colourBG.addEventListener('input', function() {
      backgroundHandler.setBackground(this.value);
      this.style.backgroundColor = this.value;
    });
  }

  // Background upload setup
  let uploadBG = document.getElementById('uploadBG');
  if (uploadBG) {
    uploadBG.addEventListener('click', handleBackgroundUpload);
  }

  // Reset background button setup
  let resetBG = document.getElementById('resetBG');
  if (resetBG) {
    resetBG.addEventListener('click', function() {
      backgroundHandler.reset();
    });
  }

  // Text color setup
  let colourE1 = document.getElementById('colourE1');
  if (colourE1) {
    colourE1.value = '#FFFFFF';
    colourE1.style.backgroundColor = colourE1.value;
    
    colourE1.addEventListener('input', function() {
      E1Colour = color(this.value);
      this.style.backgroundColor = this.value;
    });
  }

  setupExportButtons();

  // Add upload button listener
  let uploadE1Button = document.getElementById('uploadE1');
  if (uploadE1Button) {
    uploadE1Button.addEventListener('click', handleE1Upload);
  }
  
  // Add reset button listener
  let resetE1Button = document.getElementById('resetE1');
  if (resetE1Button) {
    resetE1Button.addEventListener('click', resetE1);
  }

  // Add click listener to canvas or document
  document.addEventListener('click', startAudio);
}

function draw() {
  clear();
  
  // Draw background
  if (isVideo && backgroundVideo) {
    // Draw video background
    let scale = Math.max(width / backgroundVideo.width, height / backgroundVideo.height);
    let w = backgroundVideo.width * scale;
    let h = backgroundVideo.height * scale;
    let x = (width - w) / 2;
    let y = (height - h) / 2;
    image(backgroundVideo, x, y, w, h);
  } else if (backgroundImage) {
    // Draw image background
    let scale = Math.max(width / backgroundImage.width, height / backgroundImage.height);
    let w = backgroundImage.width * scale;
    let h = backgroundImage.height * scale;
    let x = (width - w) / 2;
    let y = (height - h) / 2;
    image(backgroundImage, x, y, w, h);
  } else {
    // Draw color background using backgroundHandler's color
    background(backgroundHandler.color);
  }

  // Clear the PGraphics buffer
  pg.clear();
  pg.background(0, 0, 0, 0); // transparent background
  
  // Handle E1 drawing based on type
  if (E1Type === 'text') {
    pg.fill(E1Colour);
    pg.textAlign(CENTER, CENTER);
    E1 = document.getElementById('textAreaE1').value;
    
    // Apply text styling
    pg.textSize(parseFloat(tsE1.value));
    
    pg.push();
    pg.translate(
      width/2 + parseFloat(document.getElementById('rangeE1PX').value) * 5, 
      height/2 + parseFloat(document.getElementById('rangeE1PY').value) * 5
    );
    pg.scale(parseFloat(textScaleXE1.value), parseFloat(textScaleYE1.value));
    
    // Draw text with tracking and leading
    if (E1) {
      let chars = E1.split('');
      let totalWidth = 0;
      let tracking = parseFloat(ttE1.value) / 100;
      let leading = parseFloat(tlE1.value) / 100;
      
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
        yPos += parseFloat(tsE1.value) * leading;  // Apply leading
      });
    }
    
    pg.pop();
  } else if (E1Media) {
    pg.push();
    pg.translate(
      width/2 + parseFloat(document.getElementById('rangeE1PX').value) * 5,
      height/2 + parseFloat(document.getElementById('rangeE1PY').value) * 5
    );
    pg.scale(parseFloat(textScaleXE1.value), parseFloat(textScaleYE1.value));
    
    if (E1Type === 'svg') {
      pg.tint(E1Colour);
    }
    
    if (E1Type === 'video') {
      pg.image(E1Media, -E1Media.width/2, -E1Media.height/2);
    } else {
      pg.image(E1Media, -E1Media.width/2, -E1Media.height/2);
    }
    
    pg.pop();
  }

  // Draw the tiled text effect
  let tilesXE1 = parseInt(tXE1.value);
  let tilesYE1 = parseInt(tYE1.value);
  let tileWE1 = int(width/tilesXE1);
  let tileHE1 = int(height/tilesYE1);

  for (let y = 0; y < tilesYE1; y++) {
    for (let x = 0; x < tilesXE1; x++) {
      let waveXE1 = int(sin(frameCount * parseFloat(spE1.value) + (x * y) * parseFloat(dspxE1.value)) * parseFloat(fctE1.value));
      let waveYE1 = int(sin(frameCount * parseFloat(spE1.value) + (x * y) * parseFloat(dspyE1.value)) * parseFloat(fctE1.value));

      if (parseFloat(dspxE1.value) === 0) waveXE1 = 0;
      if (parseFloat(dspyE1.value) === 0) waveYE1 = 0;
      
      let sxE1 = x*tileWE1 + waveXE1;
      let syE1 = y*tileHE1 + waveYE1;
      copy(pg, sxE1, syE1, tileWE1, tileHE1, x*tileWE1, y*tileHE1, tileWE1, tileHE1);
    }
  }
}

function windowResized() {
  let outputDiv = document.getElementById('output');
  resizeCanvas(outputDiv.offsetWidth, outputDiv.offsetHeight);
}

function createSliders() {
  // Get all range inputs
  tXE1 = document.getElementById('rangeE1TX');
  tYE1 = document.getElementById('rangeE1TY');
  spE1 = document.getElementById('rangeE1Speed');
  dspxE1 = document.getElementById('rangeE1DX');
  dspyE1 = document.getElementById('rangeE1DY');
  fctE1 = document.getElementById('rangeE1Offset');
  
  // Text position and style controls
  let tpxE1 = document.getElementById('rangeE1PX');
  let tpyE1 = document.getElementById('rangeE1PY');
  textScaleXE1 = document.getElementById('rangeE1SX');
  textScaleYE1 = document.getElementById('rangeE1SY');
  tsE1 = document.getElementById('rangeE1S');
  ttE1 = document.getElementById('rangeE1T');
  tlE1 = document.getElementById('rangeE1L');

  // Initialize range value displays
  initializeRangeValue('rangeValueE1TX', tXE1);
  initializeRangeValue('rangeValueE1TY', tYE1);
  initializeRangeValue('rangeValueE1Speed', spE1);
  initializeRangeValue('rangeValueE1DX', dspxE1);
  initializeRangeValue('rangeValueE1DY', dspyE1);
  initializeRangeValue('rangeValueE1Offset', fctE1);
  initializeRangeValue('rangeValueE1PX', tpxE1);
  initializeRangeValue('rangeValueE1PY', tpyE1);
  initializeRangeValue('rangeValueE1SX', textScaleXE1);
  initializeRangeValue('rangeValueE1SY', textScaleYE1);
  initializeRangeValue('rangeValueE1S', tsE1);
  initializeRangeValue('rangeValueE1T', ttE1, '%');
  initializeRangeValue('rangeValueE1L', tlE1, '%');

  // Add event listeners for all sliders
  addSliderEventListener(tpxE1, 'rangeValueE1PX');
  addSliderEventListener(tpyE1, 'rangeValueE1PY');
  addSliderEventListener(textScaleXE1, 'rangeValueE1SX');
  addSliderEventListener(textScaleYE1, 'rangeValueE1SY');
  addSliderEventListener(tsE1, 'rangeValueE1S');
  addSliderEventListener(ttE1, 'rangeValueE1T', '%');
  addSliderEventListener(tlE1, 'rangeValueE1L', '%');
}

function addSliderEventListener(slider, valueId, suffix = '') {
  if (slider) {
    slider.addEventListener('input', () => {
      document.getElementById(valueId).textContent = slider.value + suffix;
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

function setupExportButtons() {
  // PDF Export
  document.getElementById('exportPDF').addEventListener('click', exportToPDF);
  
  // PNG Export
  document.getElementById('exportPNG').addEventListener('click', exportToPNG);
  
  // JPG Export
  document.getElementById('exportJPG').addEventListener('click', exportToJPG);
  
  // SVG Export
  document.getElementById('exportSVG').addEventListener('click', exportToSVG);
  
  // MP4 Export
  document.getElementById('exportMP4').addEventListener('click', exportToMP4);
}

function exportToPDF() {
  const outputDiv = document.getElementById('output');
  html2pdf()
    .from(outputDiv)
    .save('kinetic-type-export.pdf');
}

function exportToPNG() {
  saveCanvas('kinetic-type-export', 'png');
}

function exportToJPG() {
  saveCanvas('kinetic-type-export', 'jpg');
}

function exportToSVG() {
  // Create a new SVG element
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', width);
  svg.setAttribute('height', height);
  
  // Convert canvas content to SVG
  const svgData = pg.elt.toDataURL('image/svg+xml');
  const link = document.createElement('a');
  link.download = 'kinetic-type-export.svg';
  link.href = svgData;
  link.click();
}

async function exportToMP4() {
  try {
    // Check for MediaRecorder support
    if (!window.MediaRecorder) {
      throw new Error('Your browser does not support video recording');
    }

    // Check for canvas existence
    const canvas = document.querySelector('#defaultCanvas0');
    if (!canvas) {
      throw new Error('Canvas element not found');
    }

    // Create timestamp for filename
    const now = new Date();
    const timestamp = [
      now.getFullYear().toString(),
      (now.getMonth() + 1).toString().padStart(2, '0'),
      now.getDate().toString().padStart(2, '0'),
      now.getHours().toString().padStart(2, '0'),
      now.getMinutes().toString().padStart(2, '0'),
      now.getSeconds().toString().padStart(2, '0')
    ].join('-');

    // Try to use the highest quality codec available
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') 
      ? 'video/webm;codecs=vp9'
      : MediaRecorder.isTypeSupported('video/webm;codecs=h264')
        ? 'video/webm;codecs=h264'
        : 'video/webm';

    // Get stream with higher framerate
    let stream = canvas.captureStream(60); // Increased to 60fps

    // Create MediaRecorder with higher quality settings
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: 200000000 // Increased to 20Mbps
    });

    const chunks = [];
    
    return new Promise((resolve, reject) => {
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onerror = (event) => {
        reject(new Error(`Recording error: ${event.error.message}`));
        resetUI();
      };

      mediaRecorder.onstop = async () => {
        try {
          const blob = new Blob(chunks, { 
            type: mimeType,
          });
          const url = URL.createObjectURL(blob);
          
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          a.download = `expressionofexpose-${timestamp}.webm`;
          
          document.body.appendChild(a);
          a.click();
          
          setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }, 100);
          
          resolve();
        } catch (err) {
          reject(new Error(`Failed to save recording: ${err.message}`));
        } finally {
          resetUI();
        }
      };

      const resetUI = () => {
        const recordButton = document.getElementById('exportMP4');
        if (recordButton) {
          recordButton.style.backgroundColor = '';
          recordButton.textContent = 'VIDEO';
          recordButton.disabled = false;
        }
      };

      const updateUI = () => {
        const recordButton = document.getElementById('exportMP4');
        if (recordButton) {
          recordButton.style.backgroundColor = 'red';
          recordButton.textContent = 'Recording...';
          recordButton.disabled = true;
        }
      };

      try {
        updateUI();
        // Request data more frequently
        mediaRecorder.start(20); // Reduced to 20ms intervals
        console.log('Recording started...');

        // Record for longer duration
        setTimeout(() => {
          if (mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
            console.log('Recording stopped');
          }
        }, 5000); // Increased to 5 seconds

        const cleanupHandler = () => {
          if (mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
          }
          window.removeEventListener('beforeunload', cleanupHandler);
        };

        window.addEventListener('beforeunload', cleanupHandler);
        
      } catch (err) {
        reject(new Error(`Failed to start recording: ${err.message}`));
        resetUI();
      }
    });
  } catch (err) {
    console.error('Export error:', err);
    alert(err.message);
    throw err;
  }
}

function handleBackgroundUpload() {
  let input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*,video/*';
  
  input.onchange = function(e) {
    let file = e.target.files[0];
    if (file.type.startsWith('image/')) {
      loadImage(URL.createObjectURL(file), function(img) {
        backgroundHandler.setBackground(img);
      });
    } else if (file.type.startsWith('video/')) {
      let video = createVideo(URL.createObjectURL(file), function() {
        backgroundHandler.setBackground(video);
      });
    }
  };
  
  input.click();
}

function handleE1Upload() {
  let input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*,video/*,.svg';
  
  input.onchange = function(e) {
    let file = e.target.files[0];
    
    // Disable text input
    let textArea = document.getElementById('textAreaE1');
    if (textArea) {
      textArea.disabled = true;
    }
    
    if (file.name.toLowerCase().endsWith('.svg')) {
      // Handle SVG
      let reader = new FileReader();
      reader.onload = function(event) {
        loadImage(event.target.result, img => {
          E1Media = img;
          E1Type = 'svg';
          toggleE1Controls('svg');
        });
      };
      reader.readAsDataURL(file);
    } else if (file.type.startsWith('image/')) {
      // Handle image
      loadImage(URL.createObjectURL(file), img => {
        E1Media = img;
        E1Type = 'image';
        toggleE1Controls('image');
      });
    } else if (file.type.startsWith('video/')) {
      // Handle video
      let video = createVideo(URL.createObjectURL(file), () => {
        E1Media = video;
        E1Type = 'video';
        video.loop();
        video.hide();
        toggleE1Controls('video');
      });
    }
  };
  
  input.click();
}

function toggleE1Controls(type) {
  const stylingControls = document.getElementById('stylingE1');
  const colorControl = document.getElementById('colourControlE1');
  const textArea = document.getElementById('textAreaE1');
  
  if (stylingControls) {
    stylingControls.style.display = type === 'text' ? 'block' : 'none';
  }
  
  if (colorControl) {
    colorControl.style.display = (type === 'text' || type === 'svg') ? 'block' : 'none';
  }
  
  if (textArea) {
    textArea.style.display = type === 'text' ? 'block' : 'none';
  }
}

function resetE1() {
  // Clear media if it exists
  if (E1Media && E1Type === 'video') {
    E1Media.remove();
  }
  E1Media = null;
  E1Type = 'text';
  
  // Enable and show text area
  let textArea = document.getElementById('textAreaE1');
  if (textArea) {
    textArea.disabled = false;
    textArea.style.display = 'block';
  }
  
  // Show all controls
  toggleE1Controls('text');
}