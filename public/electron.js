const { app, BrowserWindow, ipcMain } = require("electron");
const fs = require("fs");
const path = require("path");
const isDev = require("electron-is-dev");
const Handlebars = require("handlebars");
const pretty = require("pretty");
const data = JSON.parse(fs.readFileSync("./src/utils/samples/json/sample_bl.json", "utf8"));
require("../src/helpers");

let mainWindow;

const createWindow = () => {
	mainWindow = new BrowserWindow({
		width: 500,
		height: 600,
		frame: false,
		webPreferences: {
			nodeIntegration: true
		}
	});
	mainWindow.loadURL(isDev ? "http://localhost:3000" : `file://${path.join(__dirname, "../build/index.html")}`);

	if (isDev) {
		mainWindow.webContents.openDevTools();
	}

	mainWindow.on("closed", () => (mainWindow = null));
};

app.on("ready", createWindow);

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});

app.on("activate", () => {
	if (mainWindow === null) {
		createWindow();
	}
});

ipcMain.on("compose-handlebars", (_event, json) => {
	const source = fs.readFileSync("./src/template.handlebars", "utf8").toString();
	const template = Handlebars.compile(source);
	const output = template(data);

	const stream = fs.createWriteStream("./output/index.html");
	stream.once("open", () => {
		const html = `<!DOCTYPE html> <meta http-equiv="content-type" content="text/html; charset=UTF-8"><html><head></head><body>${output}</body></html>`;
		stream.end(
			pretty(html, {
				ocd: true
			})
		);
	});
	console.log(`\n\n\n\n\n\n\n\n\nOutput below: ${new Date().getTime()}`);
	console.log(output);
});
