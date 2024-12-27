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

// Define multiple canvases
let backgroundCanvas;
let mainCanvas;
let overlayCanvas;

class ElementHandler {
  constructor(id, zIndex = 0) {
    this.id = id;      // 'E1', 'E2', etc.
    this.zIndex = zIndex;  // New property for stacking order
    this.colour = 255; // Default white text
    this.text = '';    // Variable to store the text
    this.type = 'text'; // Can be 'text', 'svg', 'image', or 'video'
    this.media = null;
    
    // Position properties
    this.x = 0;
    this.y = 0;
    
    // GRID AND ANIMATION CONTROLS
    this.controls = {
      tX: null,     // Tile Count X
      tY: null,     // Tile Count Y
      sp: null,     // Speed
      dspx: null,   // Displacement X
      dspy: null,   // Displacement Y
      fct: null,    // Factor/Offset
      
      // TEXT STYLE CONTROLS
      textScaleX: null,
      textScaleY: null,
      ts: null,     // Text Size
      tt: null,     // Text Tracking
      tl: null      // Text Leading
    };
    
    this.initializeControls();
  }

  initializeControls() {
    // Initialize all controls using the ID prefix
    this.controls.tX = document.getElementById(`range${this.id}TX`);
    this.controls.tY = document.getElementById(`range${this.id}TY`);
    this.controls.sp = document.getElementById(`range${this.id}Speed`);
    this.controls.dspx = document.getElementById(`range${this.id}DX`);
    this.controls.dspy = document.getElementById(`range${this.id}DY`);
    this.controls.fct = document.getElementById(`range${this.id}Offset`);
    this.controls.textScaleX = document.getElementById(`range${this.id}SX`);
    this.controls.textScaleY = document.getElementById(`range${this.id}SY`);
    this.controls.ts = document.getElementById(`range${this.id}S`);
    this.controls.tt = document.getElementById(`range${this.id}T`);
    this.controls.tl = document.getElementById(`range${this.id}L`);
  }

  draw(targetCanvas) {
    if (this.type === 'text') {
      this.drawText(targetCanvas);
    } else if (this.media) {
      this.drawMedia(targetCanvas);
    }
  }

  // Add method to change z-index
  setZIndex(index) {
    this.zIndex = index;
  }

  drawText(targetCanvas) {
    console.log(`Drawing ${this.id} with type ${this.type}`);
    // ... rest of drawText method ...
  }

  drawMedia(targetCanvas) {
    console.log(`Drawing ${this.id} media of type ${this.type}`);
    // ... rest of drawMedia method ...
  }

  // ... rest of the methods
}

// Create instances with z-index values
let E1 = new ElementHandler('E1', 1);

console.log('E1:', E1);

// Make them visually distinct
E1.colour = color(255, 0, 0);  // Make E1 red

// Set different z-indices to ensure they're both visible
E1.setZIndex(1);

// Add some default text if none exists
if (!E1.text) E1.text = "Element 1";

// Position them in different places
E1.x = width / 3;
E1.y = height / 2;

function setup() {
  // Get the parent div element
  let outputDiv = document.getElementById('output');
  
  // Create canvases with the same dimensions as the parent div
  backgroundCanvas = createCanvas(outputDiv.offsetWidth, outputDiv.offsetHeight);
  mainCanvas = createGraphics(outputDiv.offsetWidth, outputDiv.offsetHeight);
  
  // Set up canvas hierarchy
  backgroundCanvas.parent('output');
  backgroundCanvas.style('z-index', '1');
  
  mainCanvas.parent('output');
  mainCanvas.style('z-index', '2');
  mainCanvas.position(0, 0);
  
  // Optional: Add window resize handling
  window.addEventListener('resize', function() {
    resizeCanvas(outputDiv.offsetWidth, outputDiv.offsetHeight);
    mainCanvas.resizeCanvas(outputDiv.offsetWidth, outputDiv.offsetHeight);
  });

  // Initialize PGraphics
  pg = createGraphics(width, height);
  
  // Setup for E1 only
  setupElementColor('E1');
  setupElementButtons('E1');
  
  setupExportButtons();
  
  // Add click listener to canvas or document
  document.addEventListener('click', startAudio);
}

function setupElementColor(id) {
  let colorPicker = document.getElementById(`colour${id}`);
  if (colorPicker) {
    colorPicker.value = '#FFFFFF';
    colorPicker.style.backgroundColor = colorPicker.value;
    
    colorPicker.addEventListener('input', function() {
      window[id].colour = color(this.value);
      this.style.backgroundColor = this.value;
    });
  }
}

function setupElementButtons(id) {
  // Add upload button listener
  let uploadButton = document.getElementById(`upload${id}`);
  if (uploadButton) {
    uploadButton.addEventListener('click', () => handleElementUpload(window[id]));
  }
  
  // Add reset button listener
  let resetButton = document.getElementById(`reset${id}`);
  if (resetButton) {
    resetButton.addEventListener('click', () => resetElement(window[id]));
  }
}

function handleElementUpload(element) {
  let input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*,video/*,.svg';
  
  input.onchange = function(e) {
    let file = e.target.files[0];
    
    if (file.name.toLowerCase().endsWith('.svg')) {
      // Handle SVG
      let reader = new FileReader();
      reader.onload = function(event) {
        loadImage(event.target.result, img => {
          element.media = img;
          element.type = 'svg';
        });
      };
      reader.readAsDataURL(file);
    } else if (file.type.startsWith('image/')) {
      // Handle image
      loadImage(URL.createObjectURL(file), img => {
        element.media = img;
        element.type = 'image';
      });
    } else if (file.type.startsWith('video/')) {
      // Handle video
      let video = createVideo(URL.createObjectURL(file), () => {
        element.media = video;
        element.type = 'video';
        video.loop();
        video.hide();
      });
    }
    toggleElementControls(element);
  };
  
  input.click();
}

function resetElement(element) {
  // Clear media if it exists
  if (element.media && element.type === 'video') {
    element.media.remove();
  }
  element.media = null;
  element.type = 'text';
  
  // Enable and show text area
  let textArea = document.getElementById(`textArea${element.id}`);
  if (textArea) {
    textArea.disabled = false;
    textArea.style.display = 'block';
  }
  
  // Show all controls
  toggleElementControls(element);
}

function toggleElementControls(element) {
  const stylingControls = document.getElementById(`styling${element.id}`);
  const colorControl = document.getElementById(`colourControl${element.id}`);
  const textArea = document.getElementById(`textArea${element.id}`);
  
  if (stylingControls) {
    stylingControls.style.display = element.type === 'text' ? 'block' : 'none';
  }
  
  if (colorControl) {
    colorControl.style.display = (element.type === 'text' || element.type === 'svg') ? 'block' : 'none';
  }
  
  if (textArea) {
    textArea.style.display = element.type === 'text' ? 'block' : 'none';
  }
}

function draw() {
  // Clear canvas
  clear();
  
  // Draw background
  backgroundHandler.draw();

  // Draw only E1
  mainCanvas.push();
  E1.draw(mainCanvas);
  applyTilingEffect(E1, mainCanvas);
  mainCanvas.pop();

  // Display the canvas
  image(mainCanvas, 0, 0);
}

function windowResized() {
  let outputDiv = document.getElementById('output');
  resizeCanvas(outputDiv.offsetWidth, outputDiv.offsetHeight);
  mainCanvas.resizeCanvas(outputDiv.offsetWidth, outputDiv.offsetHeight);
}

function createSliders() {
  // Keep only E1 sliders
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

  // Add event listeners for sliders
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

function applyTilingEffect(element, targetCanvas) {
  let tilesX = parseInt(element.controls.tX.value);
  let tilesY = parseInt(element.controls.tY.value);
  let tileW = int(width/tilesX);
  let tileH = int(height/tilesY);

  for (let y = 0; y < tilesY; y++) {
    for (let x = 0; x < tilesX; x++) {
      let waveX = int(sin(frameCount * parseFloat(element.controls.sp.value) + 
                         (x * y) * parseFloat(element.controls.dspx.value)) * 
                         parseFloat(element.controls.fct.value));
      let waveY = int(sin(frameCount * parseFloat(element.controls.sp.value) + 
                         (x * y) * parseFloat(element.controls.dspy.value)) * 
                         parseFloat(element.controls.fct.value));

      if (parseFloat(element.controls.dspx.value) === 0) waveX = 0;
      if (parseFloat(element.controls.dspy.value) === 0) waveY = 0;
      
      let sx = x*tileW + waveX;
      let sy = y*tileH + waveY;
      targetCanvas.copy(pg, sx, sy, tileW, tileH, x*tileW, y*tileH, tileW, tileH);
    }
  }
}