const logger = require('./logger');

let hasBeenInitialized = false;
let roomba = null;
let currentPos = {x: 0, y: 0};
let currentAngle = 0;  // degrees
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
let robotIcon = null;
const LINE_THICKNESS = 20;  // cm
const ROOMBA_DIAMETER = 33; // cm


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

	robotIcon = document.createElement('img');
	robotIcon.src = 'robot icon.svg';

	domCanvas.addEventListener("mousedown", mouseDown);
	domCanvas.addEventListener("mouseup", mouseUp);
	domCanvas.addEventListener("mousemove", mouseMove);
	domCanvas.addEventListener("wheel", mouseWheel);
	roomba.on('mission', handleUpdate);

	resize();
	clearMap();


	/***  TESTING  ***/
	/*let fakeData = require('./map.json');
	let i = 0, timer = 0;
	timer = setInterval(() => {
		if (i >= fakeData.length) {
			clearInterval(timer);
		}
		else {
			handleUpdate(fakeData[i]);
			i++;
		}
	}, 400);*/
	/******/
}


/*
 * Sets the size of the canvas to the actual size it is on the page
 */
function resize() {
	domCanvas.width = domCanvas.clientWidth;
	domCanvas.height = domCanvas.clientHeight;
	draw();
}


/*
 * Clears the map and resets things
 */
function clearMap() {
	mapContext.clearRect(0, 0, mapCanvas.width, mapCanvas.height);
	mapCanvas.width = 4000;
	mapCanvas.height = 4000;
	scale = 0.4;
	viewport.x = -500;
	viewport.y = -500;
	viewport.width = mapCanvas.width * scale;
	viewport.height = mapCanvas.height * scale;
	mapContext.beginPath();
	mapContext.strokeStyle = 'rgb(0, 200, 0)';
	mapContext.lineWidth = LINE_THICKNESS;
	mapContext.lineCap = 'round';
	mapContext.lineJoin = 'round';
}


/*
 * Co-ordinate conversion
 */
function robotPosToMapPos(point) {
	return {x: (mapCanvas.width / 2) + point.x, y: (mapCanvas.height / 2) + point.y};
}
function mapPosToViewportPos(point) {
	return {x: viewport.x + (point.x * scale), y: viewport.y + (point.y * scale)};
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

	scale = scale + (scale * (-Math.sign(event.deltaY) * wheelZoomAmount));
	scale = Math.min(Math.max(scale, 0.1), 10);

	const newWidth = mapCanvas.width * scale;
	const newHeight = mapCanvas.height * scale;
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
		currentPos = robotPosToMapPos(data.pose.point);
		currentAngle = data.pose.theta + 90;   // Angle is off by 90 degrees for some reason
		mapContext.lineTo(currentPos.x, currentPos.y);
		mapContext.stroke();
		draw();
	}
}


/*
 * Draws all the stuff
 */
function draw() {
	domContext.clearRect(0, 0, domCanvas.width, domCanvas.height);
	drawMap();
	drawOverlay();
}


/*
 * Draws the map canvas on the actual one
 */
function drawMap() {
	domContext.drawImage(mapCanvas,
	        0, 0, mapCanvas.width, mapCanvas.height,
	        viewport.x, viewport.y, viewport.width, viewport.height);
}


/*
 * Draws the Roomba icon and possibly other info
 */
function drawOverlay() {
	let pos = mapPosToViewportPos(currentPos);
	let size = ROOMBA_DIAMETER * scale;
	domContext.translate(pos.x, pos.y);
	domContext.rotate(currentAngle * Math.PI / 180);
	domContext.drawImage(robotIcon, -(size / 2), -(size / 2), size, size);
	domContext.setTransform(1, 0, 0, 1, 0, 0);  // Reset transformation matrix to the identity matrix
}


module.exports = {
	initialize,
	hasBeenInitialized
};