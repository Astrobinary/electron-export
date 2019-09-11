const { app, BrowserWindow, ipcMain, globalShortcut } = require("electron");
const path = require("path");
const isDev = require("electron-is-dev");
const storage = require("electron-json-storage");
const { spawn } = require("child_process");

let mainWindow;

const createWindow = () => {
	mainWindow = new BrowserWindow({
		width: 625,
		height: 700,
		frame: false,
		resizable: false,
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

	setJobLocation();
	setJobFolderLocation();
	storage.setDataPath(global.jobFolderLocation);

	storage.get("config", function(error, data) {
		if (error) throw error;

		if (Object.keys(data).length === 0) {
			storage.set("config", { edgarShade: true, tocHeader: true, marked: false }, function(error) {
				if (error) throw error;
			});

			global.edgarShade = true;
			global.tocHeader = true;
			global.marked = false;
		} else {
			global.edgarShade = data.edgarShade;
			global.tocHeader = data.tocHeader;
			global.marked = data.marked;
		}
	});

	mainWindow.on("closed", () => (mainWindow = null));
};

const setJobLocation = () => {
	let arg1 = isDev ? "//sfphq-xppsrv01/XPP/SFP/alljobz/CLS_Genfin/GRP_house/JOB_nc10000863x1_10k" : process.argv[1];

	let path = arg1.split("/");
	path = path.slice(4, path.length);

	global.jobNumber = path[path.length - 1].slice(4);
	path = path.join("\\");
	global.jobLocation = "N:\\" + path;
};

const setJobFolderLocation = () => {
	const jobNumber = global.jobNumber.split("_")[0].split("x");

	const folderName = jobNumber[0];
	const xNumber = jobNumber[1];

	global.jobFolderLocation = `M:\\${folderName}\\x${xNumber}`;
};

app.on("ready", createWindow);

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
	if (mainWindow === null) createWindow();
});

ipcMain.on("getXML", e => {
	let cmd = spawn("divxml -job -ncrd -wpi -xsh", [], { shell: true, cwd: global.jobLocation });

	cmd.stdout.on("data", data => {
		e.sender.send("debug", `${data}`);
	});

	cmd.on("close", code => {
		if (code === 0) {
			e.sender.send("complie", "Creating html file now...");
		}
	});
});

ipcMain.on("debugRelay", (e, msg) => {
	e.sender.send("debug", `${msg}`);
});

ipcMain.on("updateSaveLocation", (e, path) => {
	e.sender.send("saveLocation", `${path}`);
});

ipcMain.on("updateConfig", (e, obj, key, value) => {
	storage.set("config", { ...obj, [key]: value }, function(error) {
		if (error) throw error;
	});

	global[key] = value;

	e.sender.send("debug", `Config file successfully updated. ${key}: ${value}`);
});
