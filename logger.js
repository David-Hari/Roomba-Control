const infoPage = require('./info');


/*
 * Logs the given message text on the info page
 */
function logMessage(aString) {
	infoPage.writeLog(aString);
}


/*
 * Logs the given error on the info page
 */
function logError(anError) {
	console.error(anError);
	infoPage.writeLog(anError);
}


module.exports = {
	logMessage,
	logError
};