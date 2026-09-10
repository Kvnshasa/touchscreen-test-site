const button = document.getElementById("start");
const reset = document.getElementById("reset");
let test = document.getElementById("test");
const result = document.getElementById("result");
const testArea = document.getElementById("test-area");
const activeTouches = document.getElementById("active-touch-count");
const maxTouches = document.getElementById("max-touch-count");
const regionsStatus = document.getElementById("regions-status");
let testStart = false;
let maxTouch = 0;
let regionsTouched = { topLeft: false, topRight: false, bottomLeft: false, bottomRight: false, center: false };

button.addEventListener("click", function() {
console.log("clicked")
test.innerHTML = "Testing! Touch the area below";
testStart = true;
});

const div = document.getElementById("test-area")

div.addEventListener("pointerdown", function(event) {
if (testStart) {
console.log(event.clientX)
console.log(event.clientY)
result.innerHTML = "The coordinates clicked were( " + event.clientX + "," + event.clientY + ")";
}});

{
const activePointers = new Map();

div.addEventListener("pointermove", function(event) {
if (testStart) {
console.log(event.clientX)
console.log(event.clientY)
result.innerHTML = "Your mouse has moved to( " + event.clientX + "," + event.clientY + ")";
const dotRetrieved = activePointers.get(event.pointerId);
const rect = testArea.getBoundingClientRect();

console.log(rect.width)
console.log(rect.height)
if (dotRetrieved) {

const storeX = event.clientX - rect.left
const storeY = event.clientY - rect.top

let RightSide = false;
let BottomSide = false;

const circleLeftPx   = rect.width  * 0.40;
const circleTopPx    = rect.height * 0.40;
const circleWidthPx  = rect.width  * 0.20;
const circleHeightPx = rect.height * 0.20;
const centerX = circleLeftPx + (circleWidthPx / 2);
const centerY = circleTopPx + (circleHeightPx / 2);
const centerRadius = circleWidthPx / 2;
const dx = storeX - centerX;
const dy = storeY - centerY;
const distance = Math.sqrt(dx*dx + dy*dy);
    
if (storeX > 0 && storeX < rect.width && storeY > 0 && storeY < rect.height) {

dotRetrieved.style.left = event.clientX - rect.left + "px";
dotRetrieved.style.top = event.clientY - rect.top + "px";

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

div.addEventListener("pointerdown", function(event) {
if (testStart) {
const dot = document.createElement("div");
dot.className = "touch-point";
testArea.appendChild(dot);
activePointers.set(event.pointerId, dot);
activeTouches.innerHTML = "Active touches: " + activePointers.size;
if (activePointers.size > maxTouch) {
maxTouch = activePointers.size
maxTouches.innerHTML = "Maximum Touches: " + maxTouch
}
}})

div.addEventListener("pointerup", function(event) {
if (testStart) {
const dotRetrieved = activePointers.get(event.pointerId);
if (dotRetrieved) {
dotRetrieved.remove();
activePointers.delete(event.pointerId);
activeTouches.innerHTML = "Active touches: " + activePointers.size;
}
}})

div.addEventListener("pointercancel", function(event) {
const dotRetrieved = activePointers.get(event.pointerId);
if (dotRetrieved) {
dotRetrieved.remove();
activePointers.delete(event.pointerId);
activeTouches.innerHTML = "Active touches: " + activePointers.size;
}
})

div.addEventListener("pointerleave", function(event) {
const dotRetrieved = activePointers.get(event.pointerId);
if (dotRetrieved) {
dotRetrieved.remove();
activePointers.delete(event.pointerId);
activeTouches.innerHTML = "Active touches: " + activePointers.size;
}
})


reset.addEventListener("click", function() {
testStart = false;
maxTouch = 0;
maxTouches.innerHTML = "Maximum Touches: " + maxTouch;
activeTouches.innerHTML = "Active touches: 0";
test.innerHTML = "Ready? Press Start to begin!";
result.innerHTML = ""
regionsStatus.innerHTML = ""
regionsTouched = { topLeft: false, topRight: false, bottomLeft: false, bottomRight: false, center: false };

for (let [key, value] of activePointers) {
activePointers.get(key).remove();
}

activePointers.clear();
})
}

function updateRegionsDisplay() {
  const touchedCount = Object.values(regionsTouched).filter(value => value == true).length
  regionsStatus.innerHTML = "Regions touched: " + touchedCount + " of 5";
}