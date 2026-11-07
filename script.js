// Declaring variables

const button = document.getElementById("start");
const reset = document.getElementById("reset");
let test = document.getElementById("test");
const testArea = document.getElementById("test-area");
const activeTouches = document.getElementById("active-touch-count");
const maxTouches = document.getElementById("max-touch-count");
const regionsStatus = document.getElementById("regions-status");
const summary = document.getElementById("summary");
const fullscreen = document.getElementById("fullscreen");
let testStart = false;
let screenRequest = false;
let maxTouch = 0;
let regionsTouched = { topLeft: false, topRight: false, bottomLeft: false, bottomRight: false, center: false };

const regionLabels = {
topLeft: "top-left",
topRight: "top-right",
bottomLeft: "bottom-left",
bottomRight: "bottom-right",
center: "center"
};

// Check if .requestFullscreen exists as a function (Doesn't exist on iPhone)
const canFullscreen = typeof testArea.requestFullscreen === "function";

//Check if they click fullscreen button and enters or exits fullscreen
fullscreen.addEventListener("click", function(event) {
//Prevents the event from affecting parents (doesn't make a pointer in testArea)
event.stopPropagation();
// Leaves event listener if fullscreen isn't available
if (!canFullscreen) return;
screenRequest = !screenRequest;
if (screenRequest) {
testArea.requestFullscreen()
}
else {
document.exitFullscreen()
}
})

//Stop pointerdown on fullscreen button from creating a dot
fullscreen.addEventListener("pointerdown", function(event) {
event.stopPropagation();
})

//Check if they use esc to exit fullscreen
document.addEventListener("fullscreenchange", function () {
screenRequest = document.fullscreenElement != null;

})

// Check if they've clicked the start button and sets testStart -> True
button.addEventListener("click", function() {
test.innerHTML = "Testing! Touch the area below";
testStart = true;
button.disabled = true;
//Displays fullscreen button as an inline-block 
if (canFullscreen) fullscreen.style.display = "inline-block";
});

const div = document.getElementById("test-area")

{
//Create a new map so pointers get update each time since maps are mutable
const activePointers = new Map();

// Function updates number of current active touches
function updateActiveTouchCount() {
  activeTouches.textContent = activePointers.size;
  // Active touches data state is live only if active touches > 0
  activeTouches.dataset.state = activePointers.size > 0 ? "live" : "idle";
}

// Check if they are moving the mouse and where to
div.addEventListener("pointermove", function(event) {
if (testStart) {

// Gets the current pointer and the test-area dimensions
const dotRetrieved = activePointers.get(event.pointerId);
const rect = testArea.getBoundingClientRect();

if (dotRetrieved) {

const {storeX, storeY} = positionDot(dotRetrieved, event);

if (storeX > 0 && storeX < rect.width && storeY > 0 && storeY < rect.height) {
updateTouchedRegion(storeX, storeY);
}
}
}});

// Create a new dot for each pointer
div.addEventListener("pointerdown", function(event) {
if (testStart) {
const dot = document.createElement("div");
dot.className = "touch-point";
testArea.appendChild(dot);

const {storeX, storeY} = positionDot(dot, event);

activePointers.set(event.pointerId, dot);
updateActiveTouchCount();
if (activePointers.size > maxTouch) {
//Update maximum touches
maxTouch = activePointers.size
maxTouches.textContent = maxTouch
}
updateTouchedRegion(storeX, storeY);
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
button.disabled = false;
maxTouches.textContent = "0";
activeTouches.textContent = "0";
activeTouches.dataset.state = "idle";
test.innerHTML = "Ready? Press Start to begin!";
regionsStatus.textContent = "0 / 5";
regionsTouched = { topLeft: false, topRight: false, bottomLeft: false, bottomRight: false, center: false };
syncRegionHighlights();
summary.innerHTML = ""
for (let [key, value] of activePointers) {
activePointers.get(key).remove();
}

activePointers.clear();
fullscreen.style.display = "none";
})

/* ============================================================
   ADDED FIX - finger sliding off the box left a stuck pointer
   ------------------------------------------------------------
   Cause: on touch, the browser implicitly captures the pointer
   to the element that received pointerdown. While captured,
   boundary events are suppressed, so "pointerleave" never fires
   and the dot stays in activePointers until the finger lifts.

   Instead of waiting for a leave event, check the coordinates on
   every move. pointermove is always delivered, capture or not.
   ============================================================ */

// End the pointer as soon as it moves outside the test area
div.addEventListener("pointermove", function(event) {
if (!testStart) return;
const dot = activePointers.get(event.pointerId);
if (!dot) return;

const rect = testArea.getBoundingClientRect();
const isOutside = event.clientX <= rect.left || event.clientX >= rect.right ||
                  event.clientY <= rect.top  || event.clientY >= rect.bottom;

//Delete the dot if its outside the test area (This one handles it for fingers)
if (isOutside) {
dot.remove();
activePointers.delete(event.pointerId);
updateActiveTouchCount();
}
});
}

// Maps each region to its element so the UI can reflect touch state
const regionElements = {
topLeft: document.getElementById("region-top-left"),
topRight: document.getElementById("region-top-right"),
bottomLeft: document.getElementById("region-bottom-left"),
bottomRight: document.getElementById("region-bottom-right"),
center: document.getElementById("region-center")
};

// Adds or removes the "is-touched" highlight on each region
function syncRegionHighlights() {
for (const key in regionElements) {
const element = regionElements[key];
if (element) {
element.classList.toggle("is-touched", regionsTouched[key] === true);
}
}
}

// Function updates how many regions have been touched
function updateRegionsDisplay() {
  const touchedCount = Object.values(regionsTouched).filter(value => value == true).length
  regionsStatus.textContent = touchedCount + " / 5";
  syncRegionHighlights();
  updateSummary();
}

// Function creates a list of regions not touched and displays the regions that need to be touched
function updateSummary() {
const missing = Object.keys(regionsTouched).filter(key => !regionsTouched[key]);

if (missing.length === 0) {
summary.dataset.state = "complete";
summary.innerHTML = "All 5 regions touched, max " + maxTouch + " simultaneous touch" + (maxTouch === 1 ? "" : "es") + " - your touchscreen appears to be working normally. ";
}
else {
summary.dataset.state = "incomplete";
const missingNames = missing.map(key => regionLabels[key]).join(", ");
summary.innerHTML = "Test incomplete - you haven't touched: " + missingNames + ". Drag into those areas to finish the test."; 
}
}

//Function handles the coordinates of the dot
function positionDot(dot, event) {

const rect = testArea.getBoundingClientRect();

//Converts coordinates relative to the test area
const storeX = event.clientX - rect.left;
const storeY = event.clientY - rect.top;

dot.style.left = storeX + "px";
dot.style.top = storeY + "px";
return {storeX, storeY};
}

//Function handles which regions have been touched
function updateTouchedRegion(storeX, storeY) {

const rect = testArea.getBoundingClientRect();

let RightSide = false;
let BottomSide = false;

// Converts CSS values to px distances
const circleLeftPx   = rect.width  * 0.44;
const circleTopPx    = rect.height * 0.40;
const circleWidthPx  = rect.width  * 0.12;
const circleHeightPx = rect.height * 0.20;

// Finds centre of circle and then uses pythag to work out the distance of pointer to centre
const centerX = circleLeftPx + (circleWidthPx / 2);
const centerY = circleTopPx + (circleHeightPx / 2);
const centerRadius = circleWidthPx / 2;
const dx = storeX - centerX;
const dy = storeY - centerY;
const distance = Math.sqrt(dx*dx + dy*dy);

if (storeX > rect.width/2) {
RightSide = true;
}
if (storeY > rect.height/2) {
BottomSide = true;
}

if (distance < centerRadius) {
      regionsTouched.center = true;
    }
else if (RightSide && BottomSide) {regionsTouched.bottomRight = true;} 
else if (RightSide && !BottomSide) {regionsTouched.topRight = true;}
else if (!RightSide && BottomSide) {regionsTouched.bottomLeft = true;}
else if (!RightSide && !BottomSide) {regionsTouched.topLeft = true;}

updateRegionsDisplay();
}