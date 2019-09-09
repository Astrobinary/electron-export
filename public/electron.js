const { app, BrowserWindow, ipcMain, globalShortcut } = require("electron");
const path = require("path");
const isDev = require("electron-is-dev");
const { spawn } = require("child_process");

let mainWindow;

const createWindow = () => {
	mainWindow = new BrowserWindow({
		width: 600,
		height: 700,
		frame: false,
		// resizable: false,
		webPreferences: {
			nodeIntegration: true
		}
	});

	mainWindow.loadURL(isDev ? "http://localhost:3000" : `file://${path.join(__dirname, "../build/index.html")}`);

	if (isDev) {
		mainWindow.webContents.openDevTools();
	} else {
		globalShortcut.register("Control+`", () => {
			mainWindow.webContents.openDevTools({ mode: "detach" });
		});
	}

	getJobLocation();

	mainWindow.on("closed", () => (mainWindow = null));
};

const getJobLocation = () => {
	let arg1 = isDev ? "//sfphq-xppsrv01/XPP/SFP/alljobz/CLS_Genfin/GRP_house/JOB_nt10003590x3_s3a-FILED" : process.argv[1];

	let path = arg1.split("/");
	path = path.slice(4, path.length);

	global.jobNumber = path[path.length - 1].slice(4);
	path = path.join("\\");
	global.jobLocation = "N:\\" + path;
};

app.on("ready", createWindow);

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
	if (mainWindow === null) createWindow();
});

ipcMain.on("getXML", e => {
	let cmd = spawn("divxml -job -ncrd -wpi", [], { shell: true, cwd: global.jobLocation });

	cmd.stdout.on("data", data => {
		e.sender.send("debug", `${data}`);
	});

	cmd.on("close", code => {
		if (code === 0) {
			e.sender.send("complie");
		}
	});
});
