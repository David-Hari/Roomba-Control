const logger = require('./logger');

let roomba = null;
let pmap_id = null;
let user_pmapv_id = null;


/*
 * Sets up event listener for start button and fetches info to make the UI.
 */
function initialize(r) {
	document.getElementById('clean-start-button').addEventListener('click', cleanSelectedRooms);

	roomba = r;
	roomba.getRobotState(['pmaps', 'cleanSchedule2'])
	.then((info) => {
		info.pmaps.forEach((each) => console.log(each));
		pmap_id = Object.keys(info.pmaps[0])[0];
		user_pmapv_id = info.pmaps[0][pmap_id];
		makeRoomUI(getRoomsFromSchedule(info.cleanSchedule2));
	})
	.catch(logger.logError);
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
		parent.appendChild(makeRoomCheckBox(room));
	}
}

function makeRoomCheckBox(room) {
	let inputContainer = document.createElement('div');
	let inputElement = document.createElement('input');
	inputElement.type = 'checkbox';
	inputElement.id = room.region_id;
	inputElement.setAttribute('data-region-id', room.region_id);
	inputElement.setAttribute('data-region-type', room.region_type);
	let labelElement = document.createElement('label');
	labelElement.htmlFor = inputElement.id;
	labelElement.textContent = room.region_name;
	inputContainer.appendChild(inputElement);
	inputContainer.appendChild(labelElement);
	return inputContainer;
}


/*
 * Initiates a clean of the selected rooms
 */
function cleanSelectedRooms() {
	let container = document.getElementById('clean-rooms-container');
	let selected = container.querySelectorAll('input[type=checkbox]:checked');
	let rooms = [...selected].map(each => {
		return {
			region_id: each.getAttribute('data-region-id'),
			region_type: each.getAttribute('data-region-type'),
			region_name: each.labels[0].textContent
		};
	});
	let params = {
		command: 'start',
		initiator: 'rmtApp',
		time: Math.round((new Date()).getTime()/1000),
		ordered: 0,
		pmap_id: pmap_id,
		regions: rooms,
		user_pmapv_id: user_pmapv_id
	};

	document.getElementById('clean-start-button').disabled = true;
	roomba.on('mission', function (data) {
		console.log(data);
	});
	roomba.cleanRoom(params)
	.then(() => console.log('cleaning'))
	.catch(logger.logError);
}


module.exports = {
	initialize
};