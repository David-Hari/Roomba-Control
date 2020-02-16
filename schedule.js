const logger = require('./logger');

let hasBeenInitialized = false;
let roomba = null;


/*
 * Fetches info to make the UI.
 */
function initialize(r) {
	roomba = r;
	roomba.getRobotState(['cleanSchedule2'])
	.then((info) => {
		makeScheduleUI(info.cleanSchedule2);
	})
	.catch(logger.logError);
}


/*
 * Create the labels and such to show the schedule.
 */
function makeScheduleUI(schedule) {
}


module.exports = {
	initialize,
	hasBeenInitialized
};