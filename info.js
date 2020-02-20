let hasBeenInitialized = false;
let logTextArea = null;


/*
 * Fetches info to make the UI.
 */
function initialize(roomba) {
	logTextArea = document.getElementById('logtext');
}


/*
 * Writes the string on a new line in the log text box
 */
function writeLog(string) {
	logTextArea.value += string + '\n';
}


module.exports = {
	initialize,
	hasBeenInitialized,
	writeLog
};