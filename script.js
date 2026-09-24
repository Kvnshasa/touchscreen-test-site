// Declaring variables

const button = document.getElementById("start");
const reset = document.getElementById("reset");
let test = document.getElementById("test");
const testArea = document.getElementById("test-area");
const activeTouches = document.getElementById("active-touch-count");
const maxTouches = document.getElementById("max-touch-count");
const regionsStatus = document.getElementById("regions-status");
const summary = document.getElementById("summary");
let testStart = false;
let maxTouch = 0;
let regionsTouched = { topLeft: false, topRight: false, bottomLeft: false, bottomRight: false, center: false };

const regionLabels = {
topLeft: "top-left",
topRight: "top-right",
bottomLeft: "bottom-left",
bottomRight: "bottom-right",
center: "center"
};

// Check if they've clicked the start button and sets testStart -> True
button.addEventListener("click", function() {
console.log("clicked")
test.innerHTML = "Testing! Touch the area below";
testStart = true;
});

const div = document.getElementById("test-area")

// Check if they're pressing down and records coordinates
div.addEventListener("pointerdown", function(event) {
if (testStart) {
console.log(event.clientX)
console.log(event.clientY)
}});

{
const activePointers = new Map();

// Function updates number of current active touches
function updateActiveTouchCount() {
  activeTouches.innerHTML = "Active touches: " + activePointers.size;
}

// Check if they are moving the mouse and where to
div.addEventListener("pointermove", function(event) {
if (testStart) {
console.log(event.clientX)
console.log(event.clientY)

// Gets the current pointer and the test-area dimensions
const dotRetrieved = activePointers.get(event.pointerId);
const rect = testArea.getBoundingClientRect();

console.log(rect.width)
console.log(rect.height)
if (dotRetrieved) {

// Converts coordinates relative to test area
const storeX = event.clientX - rect.left
const storeY = event.clientY - rect.top

let RightSide = false;
let BottomSide = false;

// Converts CSS values to px distances
const circleLeftPx   = rect.width  * 0.40;
const circleTopPx    = rect.height * 0.40;
const circleWidthPx  = rect.width  * 0.20;
const circleHeightPx = rect.height * 0.20;

// Finds centre of circle and then uses pythag to work out the distance of pointer to centre
const centerX = circleLeftPx + (circleWidthPx / 2);
const centerY = circleTopPx + (circleHeightPx / 2);
const centerRadius = circleWidthPx / 2;
const dx = storeX - centerX;
const dy = storeY - centerY;
const distance = Math.sqrt(dx*dx + dy*dy);

// Check if coordinates are within the test area dimensions
if (storeX > 0 && storeX < rect.width && storeY > 0 && storeY < rect.height) {

dotRetrieved.style.left = event.clientX - rect.left + "px";
dotRetrieved.style.top = event.clientY - rect.top + "px";

// Check which regions have been clicked 
if (storeX > rect.width/2) {
RightSide = true;
}
if (storeY > rect.height/2) {
BottomSide = true;
}}

if (distance < centerRadius) {
      regionsTouched.center = true;
    }
else if (RightSide && BottomSide) {regionsTouched.bottomRight = true;} 
else if (RightSide && !BottomSide) {regionsTouched.topRight = true;}
else if (!RightSide && BottomSide) {regionsTouched.bottomLeft = true;}
else if (!RightSide && !BottomSide) {regionsTouched.topLeft = true;}

updateRegionsDisplay();
}
}});

// Create a new dot for each pointer
div.addEventListener("pointerdown", function(event) {
if (testStart) {
const dot = document.createElement("div");
dot.className = "touch-point";
testArea.appendChild(dot);
activePointers.set(event.pointerId, dot);
updateActiveTouchCount();
if (activePointers.size > maxTouch) {
maxTouch = activePointers.size
maxTouches.innerHTML = "Maximum Touches: " + maxTouch
}
}})

// Remove the pointer when screen no longer touched and adjust active touches
div.addEventListener("pointerup", function(event) {
if (testStart) {
const dotRetrieved = activePointers.get(event.pointerId);
if (dotRetrieved) {
dotRetrieved.remove();
activePointers.delete(event.pointerId);
updateActiveTouchCount();
}
}})

// Handles if a dot gets stuck 
div.addEventListener("pointercancel", function(event) {
const dotRetrieved = activePointers.get(event.pointerId);
if (dotRetrieved) {
dotRetrieved.remove();
activePointers.delete(event.pointerId);
updateActiveTouchCount();
}
})

// Handles if a dot tries to leave the test area
div.addEventListener("pointerleave", function(event) {
const dotRetrieved = activePointers.get(event.pointerId);
if (dotRetrieved) {
dotRetrieved.remove();
activePointers.delete(event.pointerId);
updateActiveTouchCount();
}
})


// Resets everything if the reset button is clicked
reset.addEventListener("click", function() {
testStart = false;
maxTouch = 0;
maxTouches.innerHTML = "Maximum Touches: " + maxTouch;
activeTouches.innerHTML = "Active Touches: 0";
test.innerHTML = "Ready? Press Start to begin!";
regionsStatus.innerHTML = ""
regionsTouched = { topLeft: false, topRight: false, bottomLeft: false, bottomRight: false, center: false };
summary.innerHTML = ""
for (let [key, value] of activePointers) {
activePointers.get(key).remove();
}

activePointers.clear();
})
}

// Function updates how many regions have been touched
function updateRegionsDisplay() {
  const touchedCount = Object.values(regionsTouched).filter(value => value == true).length
  regionsStatus.innerHTML = "Regions touched: " + touchedCount + " of 5";
  updateSummary();
}

// Function creates a list of regions not touched and displays the regions that need to be touched
function updateSummary() {
const missing = Object.keys(regionsTouched).filter(key => !regionsTouched[key]);

if (missing.length === 0) {
summary.innerHTML = "All 5 regions touched, max " + maxTouch + " simultaneous touch" + (maxTouch === 1 ? "" : "es") + " - your touchscreen appears to be working normally. ";
}
else {
const missingNames = missing.map(key => regionLabels[key]).join(", ");
summary.innerHTML = "Test incomplete - you haven't touched: " + missingNames + ". Drag into those areas to finish the test."; 
}
}
