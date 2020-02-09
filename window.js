const { remote } = require('electron');
const Roomba = require('dorita980');
const config = require('./config.json');
const clean = require('./clean');
const schedule = require('./schedule');
const logger = require('./logger');

let roomba = null;
main();


/*
 * Entry point
 */
function main() {
	initialize();

	process.env.ROBOT_CIPHERS = 'AES128-SHA';  // See https://github.com/electron/electron/issues/20759
	roomba = new Roomba.Local(config.blid, config.password, config.ipAddress, 2, config.interval);

	roomba.on('connect', function() {
		setConnectionStatus(true);

		clean.initialize(roomba);
		schedule.initialize(roomba);

		roomba.getRobotState(['name'])
		.then((info) => {
			setRobotName(info.name);
		})
		.catch(logger.logError);

		roomba.on('state', (info) => {
			console.log(info);
			setBatteryPercent(info.batPct);
		});
	});

	remote.getCurrentWindow().on('close', (e) => {
		roomba.end();
	});
}



/*
 * Sets up event listeners for UI elements.
 */
function initialize() {
	let names = [ 'clean', 'schedule', 'info' ];
	for (let name of names) {
		document.getElementById('tab-'+name).addEventListener('click', openPage.bind(null, name));
	}
	openPage(names[0]);
}


/*
 * Displays the given page.
 */
function openPage(pageName) {
	let tabs = document.getElementById('tabs');
	for (let each of tabs.getElementsByClassName('nav-link')) {
		each.classList.remove('active');
	}
	let pages = document.getElementById('pages');
	for (let each of pages.getElementsByClassName('page')) {
		each.style.display = 'none';
	}

	document.getElementById('tab-'+pageName).classList.add('active');
	document.getElementById('page-'+pageName).style.display = 'block';
}


/*
 * Changes the display to indicate that the app is either connected or disconnected
 * to the robot.
 */
function setConnectionStatus(isConnected) {
	let connection = document.getElementById('connection');
	let text = connection.getElementsByClassName('text')[0];
	text.innerText = (isConnected ? 'Connected' : 'Disconnected');
	connection.setAttribute('data-state', (isConnected ? 'on' : 'off'));
}


/*
 * Shows the given robot name in the UI
 */
function setRobotName(str) {
	document.getElementById('robotName').textContent = 'Hi, I\'m ' + str;
}


/*
 * Shows the given battery percent in the UI
 */
function setBatteryPercent(num) {
	document.getElementById('batteryPercent').textContent = 'Battery: ' + num + '%';
}