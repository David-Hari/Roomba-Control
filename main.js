const {app, BrowserWindow} = require('electron');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

app.on('ready', function() {
	mainWindow = new BrowserWindow({
		width: 800,
		height: 800,
		webPreferences: {
			nodeIntegration: true
		}
	});
	mainWindow.setMenuBarVisibility(false);
	mainWindow.loadFile('index.html');

	mainWindow.on('closed', function() {
		mainWindow = null;
	});
});

// Quit when all windows are closed.
app.on('window-all-closed', function() {
	app.quit();
});



