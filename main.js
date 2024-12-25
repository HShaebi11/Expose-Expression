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
}

function draw() {
  background(220);
  fill(255, 0, 0);  // Set fill color to red (RGB values)
  circle(width/2, height/2, 100);  // Draw circle in center of canvas, diameter 100
}

// Resize canvas when window is resized
function windowResized() {
  let outputDiv = document.getElementById('output');
  resizeCanvas(outputDiv.offsetWidth, outputDiv.offsetHeight);
}