const logger = require('./logger');

let hasBeenInitialized = false;
let roomba = null;
let currentPos = {x: 0, y: 0};
let scale = 1.0;
let viewport = {x: 0, y: 0, width: 0, height: 0};
let oldViewportOrigin = {x: 0, y: 0};
let clickPosition = {x: 0, y: 0};
let isMouseDown = false;
const wheelZoomAmount = 0.2;
let domCanvas = null;     // Actual canvas on the page
let domContext = null;
let mapCanvas = null;     // Off-screen canvas to draw the map
let mapContext = null;


/*
 * Fetches info to make the UI.
 */
function initialize(r) {
	roomba = r;
	domCanvas = document.getElementById('page-map').getElementsByTagName('canvas')[0];
	domContext = domCanvas.getContext('2d');

	/* Create virtual canvas - not appended to the DOM */
	mapCanvas = document.createElement('canvas');
	mapContext = mapCanvas.getContext('2d');

	domCanvas.addEventListener("mousedown", mouseDown);
	domCanvas.addEventListener("mouseup", mouseUp);
	domCanvas.addEventListener("mousemove", mouseMove);
	domCanvas.addEventListener("wheel", mouseWheel);
	//roomba.on('mission', handleUpdate);

	resize();
	clearMap();


	/***  TESTING  ***/
	let fakeData = require('./map.json');
	let i = 0, timer = 0;
	timer = setInterval(() => {
		if (i >= fakeData.length) {
			clearInterval(timer);
		}
		else {
			handleUpdate(fakeData[i]);
			i++;
		}
	}, 200);
	/******/
}


/*
 * Clears the map and resets things
 */
function clearMap() {
	mapContext.clearRect(0, 0, mapCanvas.width, mapCanvas.height);
	mapContext.beginPath();
	mapContext.strokeStyle = 'rgb(0, 200, 0)';
	mapContext.lineWidth = 16;
	mapContext.lineCap = 'round';
	mapContext.lineJoin = 'round';
}


/*
 * Sets the size of the canvas to the actual size it is on the page
 */
function resize() {
	let width = domCanvas.clientWidth;
	let height = domCanvas.clientHeight;
	domCanvas.width = width;
	domCanvas.height = height;
	mapCanvas.width = 4000;
	mapCanvas.height = 4000;
	viewport.width = width;
	viewport.height = height;
	draw();
}


function mouseDown(event) {
	event.preventDefault();
	oldViewportOrigin = {x: viewport.x, y: viewport.y};
	clickPosition = {x: event.clientX, y: event.clientY};
	isMouseDown = true;
}


function mouseUp(event) {
	event.preventDefault();
	isMouseDown = false;
}


/*
 * Handler for mouse move event. Pans the map.
 */
function mouseMove(event) {
	if (isMouseDown) {
		event.preventDefault();
		viewport.x = oldViewportOrigin.x + (event.clientX - clickPosition.x);
		viewport.y = oldViewportOrigin.y + (event.clientY - clickPosition.y);
		draw();
	}
}


/*
 * Handler for mouse wheel event. Zooms the map in or out.
 */
function mouseWheel(event) {
	event.preventDefault();

	scale = Math.max(scale + (scale * (-Math.sign(event.deltaY) * wheelZoomAmount)), 0.1);

	const newWidth = domCanvas.clientWidth * scale;
	const newHeight = domCanvas.clientHeight * scale;
	const diffW = newWidth - viewport.width;
	const diffH = newHeight - viewport.height;
	const cursorRatioX = (event.clientX - viewport.x) / viewport.width;
	const cursorRatioY = (event.clientY - viewport.y) / viewport.height;
	viewport.x -= diffW * cursorRatioX;
	viewport.y -= diffH * cursorRatioY;
	viewport.width = newWidth;
	viewport.height = newHeight;
	draw();
}


/*
 * Gets position data to draw
 */
function handleUpdate(data) {
	let status = data.cleanMissionStatus;
	if ((status.phase === 'run' || status.phase === 'hmPostMsn') && data.pose) {
		currentPos = data.pose.point;
		mapContext.lineTo(2000+currentPos.x, 2000+currentPos.y);
		mapContext.stroke();
		draw();
	}
}


/*
 * Draws all the stuff
 */
function draw() {
	drawMap();
	drawOverlay();
}


/*
 * Draws the map canvas on the actual one
 */
function drawMap() {
	domContext.clearRect(0, 0, domCanvas.width, domCanvas.height);
	domContext.drawImage(mapCanvas,
	        0, 0, mapCanvas.width, mapCanvas.height,
	        viewport.x, viewport.y, viewport.width, viewport.height);
	        //0, 0, domCanvas.width, domCanvas.height);
}


/*
 * Draws the Roomba icon and possibly other info
 */
function drawOverlay() {
}


module.exports = {
	initialize,
	hasBeenInitialized
};