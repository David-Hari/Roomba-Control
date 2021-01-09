const { remote } = require('electron');
const Roomba = require('dorita980');
const config = require('./config.json');
const cleanPage = require('./clean');
const mapPage = require('./map');
const schedulePage = require('./schedule');
const infoPage = require('./info');
const logger = require('./logger');

let roomba = null;
let pages = {
	'clean': cleanPage,
	'map': mapPage,
	'schedule': schedulePage,
	'info': infoPage
};

main();


/*
 * Entry point
 */
function main() {
	process.env.ROBOT_CIPHERS = 'AES128-SHA';  // See https://github.com/electron/electron/issues/20759
	initializePages();

	logger.logMessage('Attempting to connect to Roomba...');
	setConnectionStatus('Connecting...');
	roomba = new Roomba.Local(config.blid, config.password, config.ipAddress, 2, config.interval);
	roomba.on('connect', function() {
		logger.logMessage('Roomba connected.');
		setConnectionStatus('Connected');
		openPage('clean');

		roomba.getRobotState(['name'])
		.then((info) => {
			setRobotName(info.name);
		})
		.catch(logger.logError);

		roomba.on('state', (info) => {
			setStatus(info);
		});
	});
	roomba.on('offline', function() {
		logger.logMessage('Cannot connect to Roomba (offline).');
		setConnectionStatus('Offline');
	});
	roomba.on('disconnect', function() {
		logger.logMessage('Disconnected from Roomba.');
		setConnectionStatus('Disconnected');
	});
	roomba.on('close', function(error) {
		logger.logMessage('Connection to Roomba closed. ' + error.message);
	});
	roomba.on('reconnect', function() {
		logger.logMessage('Reconnecting...');
	});

	remote.getCurrentWindow().on('close', (e) => {
		roomba.end();
	});
}



/*
 * Sets up event listeners for tabs and open the first page.
 */
function initializePages() {
	let names = [ 'clean', 'map', 'schedule', 'info' ];
	for (let name of Object.keys(pages)) {
		document.getElementById('tab-'+name).addEventListener('click', openPage.bind(null, name));
	}
}


/*
 * Displays the given page.
 */
function openPage(pageName) {
	let tabs = document.getElementById('tabs');
	for (let each of tabs.getElementsByClassName('nav-link')) {
		each.classList.remove('active');
	}
	let pageElements = document.getElementById('pages');
	for (let each of pageElements.getElementsByClassName('page')) {
		each.style.display = 'none';
	}

	document.getElementById('tab-'+pageName).classList.add('active');
	document.getElementById('page-'+pageName).style.display = 'block';

	let page = pages[pageName];
	if (!page.hasBeenInitialized) {
		console.log('Initializing page: ' + pageName);
		page.initialize(roomba);
		page.hasBeenInitialized = true;
	}
}


/*
 * Changes the display to indicate that the app is either connected or disconnected
 * to the robot.
 */
function setConnectionStatus(statusText) {
	let connection = document.getElementById('connection');
	let text = connection.getElementsByClassName('text')[0];
	text.innerText = statusText;
	connection.setAttribute('data-state', (statusText === 'Connected'  ? 'on' : 'off'));
}


/*
 * Shows the given robot name in the UI
 */
function setRobotName(str) {
	document.getElementById('robotName').textContent = 'Hi, I\'m ' + str;
}


/*
 * Shows the status of the robot, such as the battery percent and if the bin is full.
 */
function setStatus(info) {
	let str = 'Battery: ' + info.batPct + '%';
	if (info.bin.present) {
		if (info.bin.full) {
			str += ', Bin: full';
		}
	}
	else {
		str += ', Bin: missing';
	}
	document.getElementById('status').textContent = str;
}