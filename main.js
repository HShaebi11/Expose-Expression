let colourBG = 220; // Default background color

function setup() {
  // Get the output div element
  let outputDiv = document.getElementById('output');
  
  // Create canvas that matches the output div dimensions
  let canvas = createCanvas(outputDiv.offsetWidth, outputDiv.offsetHeight);
  
  // Move the canvas inside the output div
  canvas.parent('output');
  
  // Make sure the canvas style is set to fill the container
  canvas.style('width', '100%');
  canvas.style('height', '100%');

  // Get the HTML color picker element and set up event listener
  let colourPicker = document.getElementById('colourBG');
  colourPicker.value = '#DCDCDC'; // Set initial value
  colourPicker.style.backgroundColor = colourPicker.value; // Set initial background color
  
  colourPicker.addEventListener('input', function() {
    colourBG = color(this.value); // Convert HTML color to p5.js color
    this.style.backgroundColor = this.value; // Update the input element's background color
  });
}

function draw() {
  background(colourBG);
  fill(255, 0, 0);
  circle(width/2, height/2, 100);
}

// Resize canvas when window is resized
function windowResized() {
  let outputDiv = document.getElementById('output');
  resizeCanvas(outputDiv.offsetWidth, outputDiv.offsetHeight);
}