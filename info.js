const logger = require('./logger');

let hasBeenInitialized = false;
let roomba = null;


/*
 * Fetches info to make the UI.
 */
function initialize(r) {
	roomba = r;

}



module.exports = {
	initialize,
	hasBeenInitialized
};