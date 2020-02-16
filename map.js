const logger = require('./logger');

let currentPos = {x: 0, y: 0};
let domCanvas = null;
let domContext = null;
let mapCanvas = null;
let mapContext = null;
let robotCanvas = null;
let robotContext = null;


/*
 * Fetches info to make the UI.
 */
function initialize(roomba) {
	domCanvas = document.getElementById('page-map').getElementsByTagName('canvas')[0];
	domContext = domCanvas.getContext('2d');


	/* Create virtual canvas - not appended to the DOM */
	mapCanvas = document.createElement('canvas');
	mapContext = mapCanvas.getContext('2d');
	robotCanvas = document.createElement('canvas');
	robotContext = robotCanvas.getContext('2d');

	setTimeout(resize, 1000);
}

function resize() {
	let width = domCanvas.clientWidth;
	let height = domCanvas.clientHeight;
	domCanvas.width = width;
	domCanvas.height = height;
	mapCanvas.width = width;
	mapCanvas.height = height;
	robotCanvas.width = width;
	robotCanvas.height = height;
	draw();
}


function draw() {
	domContext.fillRect(50,50,150,50);
	mapContext.fillStyle = 'blue';
	mapContext.fillRect(50,50,150,150);
	robotContext.fillStyle = 'yellow';
	robotContext.fillRect(50,50,100,50);

	/* render virtual canvases on DOM canvas */
	domContext.drawImage(mapCanvas, 0, 0, domCanvas.width, domCanvas.height);
	domContext.drawImage(robotCanvas, 0, 0, domCanvas.width, domCanvas.height);
}


module.exports = {
	initialize
};