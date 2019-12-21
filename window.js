const { remote } = require('electron');
const Roomba = require('dorita980');
const config = require('./config.json');

process.env.ROBOT_CIPHERS = 'AES128-SHA';  // See https://github.com/electron/electron/issues/20759
let roomba = new Roomba.Local(config.blid, config.password, config.ipAddress);

roomba.on('connect', function() {
	setConnectionStatus(true);
	getCleanSchedule();
});

remote.getCurrentWindow().on('close', (e) => {
	roomba.end();
});


function setConnectionStatus(isConnected) {
	let connection = document.getElementById('connection');
	let text = connection.getElementsByClassName('text')[0];
	text.innerText = (isConnected ? 'Connected' : 'Disconnected');
	connection.setAttribute('data-state', (isConnected ? 'on' : 'off'));
}

function getCleanSchedule() {
	roomba.getRobotState('cleanSchedule2')
		.then((info) => console.log('State: ',info.cleanSchedule2))
		.catch(console.error);
}

function cleanSelectedRooms() {
	// TODO: Fetch pmap_id and user_pmapv_id using roomba.getRobotState('pmaps'). key is pmap_id, value is user_pmapv_id
	/*var params = {
		command: 'start',
		initiator: 'rmtApp',
		time: Math.round((new Date()).getTime()/1000),
		ordered: 0,
		pmap_id: pmap_id,
		regions: [
			{
				region_id: '11',
				region_name: 'Kitchen',
				region_type: 'kitchen'
			}
		],
		user_pmapv_id: user_pmapv_id
	};
	roomba.cleanRoom(params)
		.then(() => console.log('cleaning'))
		.catch(console.error);*/
}
