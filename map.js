const logger = require('./logger');

let hasBeenInitialized = false;
let roomba = null;
let currentPos = {x: 0, y: 0};
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

	roomba.on('mission', handleUpdate);
	setTimeout(resize, 100);
}


/*
 * Sets the size of the canvas to the actual size it is on the page
 */
function resize() {
	let width = domCanvas.clientWidth;
	let height = domCanvas.clientHeight;
	domCanvas.width = width;
	domCanvas.height = height;
	mapCanvas.width = width;
	mapCanvas.height = height;
	draw();
}


/*
 * Gets position data to draw
 */
function handleUpdate(data) {
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
	domContext.drawImage(mapCanvas, 0, 0, domCanvas.width, domCanvas.height);
}


/*
 * Draws the Roomba icon and possibly other info
 */
function drawOverlay() {
	domContext.fillStyle = 'blue';
	domContext.fillRect(50,50,150,50);
}


module.exports = {
	initialize,
	hasBeenInitialized
};