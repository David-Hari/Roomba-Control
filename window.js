const { remote } = require('electron');
const Roomba = require('dorita980');
const config = require('./config.json');

let roomba = null;
let pmap_id = null;
let user_pmapv_id = null;
main();


/*
 * Entry point
 */
function main() {
	setupTabs();

	process.env.ROBOT_CIPHERS = 'AES128-SHA';  // See https://github.com/electron/electron/issues/20759
	roomba = new Roomba.Local(config.blid, config.password, config.ipAddress);

	roomba.on('connect', function() {
		setConnectionStatus(true);
		roomba.getRobotState(['pmaps', 'cleanSchedule2'])
		.then((info) => {
			pmap_id = Object.keys(info.pmaps[0])[0];
			user_pmapv_id = info.pmaps[0][pmap_id];
			console.log(pmap_id, user_pmapv_id);
			makeScheduleUI(info.cleanSchedule2);
			makeRoomUI(getRoomsFromSchedule(info.cleanSchedule2));
		})
		.catch(logError);
	});

	remote.getCurrentWindow().on('close', (e) => {
		roomba.end();
	});
}



/*
 * Sets up each tab then opens on the first one.
 */
function setupTabs() {
	let names = [ 'clean', 'schedule', 'info' ];
	for (let name of names) {
		document.getElementById('tab-'+name).addEventListener('click', openPage.bind(null, name));
	}
	openPage(names[0]);
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
 * Create the labels and such to show the schedule.
 */
function makeScheduleUI(schedule) {
}


/*
 * Return an array of rooms that were found in the schedule.
 * This is needed because the robot does not provide this information as part of the map.
 * Hopefully the schedule covers all rooms in the house.
 */
function getRoomsFromSchedule(schedule) {
	let allRooms = {};
	for (let each of schedule) {
		console.assert(each.cmd.pmap_id === pmap_id, each.cmd.pmap_id, pmap_id);
		console.assert(each.cmd.user_pmapv_id === user_pmapv_id, each.cmd.user_pmapv_id, user_pmapv_id);
		for (let room of each.cmd.regions) {
			allRooms[room.region_id] = room;
		}
	}
	return Object.values(allRooms);
}


/*
 * Adds a check box for each room that can be cleaned.
 */
function makeRoomUI(rooms) {
	let parent = document.getElementById('clean-rooms-container');
	for (let room of rooms) {
		parent.appendChild(makeRoomCheckBox('room-'+room.region_id, room.region_name));
	}
}

function makeRoomCheckBox(roomId, label) {
	let inputContainer = document.createElement('div');
	let inputElement = document.createElement('input');
	inputElement.type = 'checkbox';
	inputElement.id = roomId;
	let labelElement = document.createElement('label');
	labelElement.htmlFor = inputElement.id;
	labelElement.textContent = label;
	inputContainer.appendChild(inputElement);
	inputContainer.appendChild(labelElement);
	return inputContainer;
}


/*
 * Initiates a clean of the given rooms
 */
function cleanRooms(rooms) {
	var params = {
		command: 'start',
		initiator: 'rmtApp',
		time: Math.round((new Date()).getTime()/1000),
		ordered: 0,
		pmap_id: pmap_id,
		regions: rooms,
		user_pmapv_id: user_pmapv_id
	};
	roomba.cleanRoom(params)
		.then(() => console.log('cleaning'))
		.catch(logError);
}


/*
 * Logs the given error on the info page
 */
function logError(anError) {
	// TODO
	console.error(anError);
}