import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { ipcRenderer as ipc, remote, shell } from "electron";
import Handlebars from "handlebars";
import fs from "fs";
import dir from "path";
import pretty from "pretty";
import isDev from "electron-is-dev";
import Titlebar from "./components/Titlebar/titlebar";
import JobInfoBar from "./components/JobInfoBar/jobinfobar";
import DebugWindow from "./components/DebugWindow/debugwindow";
import Buttonbar from "./components/Buttonbar/buttonbar";
import Statusbar from "./components/Statusbar/statusbar";

import generateJSON from "../src/utils/jsonConverter";

import "./helpers";
import "./global.scss";

const Renderer = () => {
	let path = useRef();

	useEffect(() => {
		const today = new Date();
		const pm = today.getHours() >= 12 ? "pm" : "am";
		const hour = ((today.getHours() + 11) % 12) + 1;
		const time = hour + "." + today.getMinutes() + pm;

		let uniqueFolder = `${remote.getGlobal("jobNumber")}_(${time})`;

		if (isDev) {
			path.current = `C:\\Users\\padillab\\Documents\\Development\\electron-export\\output\\${uniqueFolder}\\${remote.getGlobal("jobNumber")}.htm`;
		} else {
			path.current = `N:\\HTML\\Out\\${uniqueFolder}\\${remote.getGlobal("jobNumber")}.htm`;
		}

		ipc.on("saveLocation", (e, newPath) => {
			path.current = newPath;
			e.sender.send("debugRelay", `New save path selected: ${path.current}`);
		});

		ipc.on("complie", e => {
			let folder = `${remote.getGlobal("saveLocation")}`;
			if (!fs.existsSync(folder)) fs.mkdirSync(folder);

			let json;
			if (isDev && fs.existsSync(`${remote.getGlobal("jobLocation")}\\gen.json`)) {
				console.log("JSON Already generated.");
				json = fs.readFileSync(`${remote.getGlobal("jobLocation")}\\gen.json`);
			} else {
				json = generateJSON(remote.getGlobal("jobLocation"));
			}

			let stream;
			stream = fs.createWriteStream(path.current);

			const output = template(JSON.parse(json), "utf8");
			stream.once("open", () => {
				const html = `<!DOCTYPE html> <meta http-equiv="content-type" content="text/html; charset=UTF-8"><html><head></head><body>${output}</body></html>`;
				stream.end(
					pretty(html, {
						ocd: true
					})
				);
			});

			e.sender.send("debugRelay", `HTML created at: ${path.current}`);
			shell.showItemInFolder(path.current);
		});
	});

	return (
		<React.Fragment>
			<Titlebar />
			<JobInfoBar />
			<DebugWindow />
			<Buttonbar newpath={path} />
			<Statusbar />
		</React.Fragment>
	);
};

const deleteFolderRecursive = path => {
	if (fs.existsSync(path)) {
		fs.readdirSync(path).forEach(function(file) {
			var curPath = path + "/" + file;
			if (fs.lstatSync(curPath).isDirectory()) {
				deleteFolderRecursive(curPath);
			} else {
				fs.unlinkSync(curPath);
			}
		});
		fs.rmdirSync(path);
		fs.mkdirSync(path);
	}
};

const template = Handlebars.compile(`
{{#each this.el}} {{!-- Document Root, filter only elements --}}
{{#each this.el}} {{!-- Each element in document (Pages/Styles) --}}
   {{#filter_scope this "pages"}} {{!-- Pages element only --}}
	
		{{#each this.el}}
			<div class="page" style="width: {{this.el.[0].el.[0].att.bsx}}pt; text-align: left; margin: auto; position: relative;">
				{{#gather_blocks this.el}} {{!-- Each stream, reduced to array of blocks --}}
					{{#each this}} {{!-- Each block --}}

						{{#create_blocks ../this this @index}} {{!-- Generates block elements --}}

							{{#each this.el}} {{!-- Each group --}}
								
								{{~#create_tags @root.el.0.el.1.el ../this this @index ~}}
									{{~ display_text @root.el.0.el.1.el ../../this ../this ~}}
								{{/create_tags}}

							{{/each}}

						{{/create_blocks}}

					{{/each}}
				{{/gather_blocks}}
			</div>
			<hr style="page-break-after: always; width: 612pt; margin-top: 20pt; margin-bottom: 20pt; border: 0px; height: 3px; background-color: black" />
		{{/each}}

	{{/filter_scope}}{{!-- Pages element only --}}
{{/each}}{{!-- Each element in document (Pages/Styles) --}}
{{/each}}{{!-- Document Root, filter only elements --}}`);

ReactDOM.render(<Renderer />, document.getElementById("root"));
