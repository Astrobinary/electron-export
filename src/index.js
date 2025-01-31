import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { ipcRenderer as ipc, remote, shell } from "electron";
import Handlebars from "handlebars";
import fs from "fs";
import sanitizeHtml from "sanitize-html";
import { HtmlValidate } from "html-validate";

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
	const [isLoading, setIsLoading] = useState(false);
	let path = useRef();

	const startProcess = () => {
		setIsLoading(true);
		ipc.send("getXML", path.current);
	};

	useEffect(() => {
		let uniqueFolder = remote.getGlobal("jobNumber");

		if (isDev) {
			path.current = `C:\\Users\\padillab\\Documents\\Development\\electron-export\\output\\${uniqueFolder}\\${remote.getGlobal("jobNumber")}.htm`;
		} else {
			path.current = `N:\\HTML\\Out\\${uniqueFolder}\\${remote.getGlobal("jobNumber")}.htm`;
		}

		ipc.on("saveLocation", (e, newPath) => {
			path.current = newPath;
			e.sender.send("debugRelay", `\nNew save path selected: ${path.current}\n`);
		});
	});

	useEffect(() => {
		ipc.once("complie", e => {
			let folder = remote.getGlobal("saveLocation");

			if (!fs.existsSync(folder)) {
				if (folder.includes("C:\\Users\\padillab\\Documents\\Development")) console.log(folder);
				fs.mkdirSync(folder);
			}

			let json;
			if (isDev && fs.existsSync(`${remote.getGlobal("jobLocation")}\\gen.json`)) {
				console.log("JSON Already generated.");
				json = fs.readFileSync(`${remote.getGlobal("jobLocation")}\\gen.json`);
			} else {
				json = generateJSON(remote.getGlobal("jobLocation"));
			}

			const output = template(JSON.parse(json), "utf8");

			let stream;

			stream = fs.createWriteStream(path.current);

			stream.once("open", () => {
				let html = `<!DOCTYPE html> <meta http-equiv="content-type" content="text/html; charset=UTF-8"><html><head></head><body>${output}</body></html>`;
				// let clean = sanitizeHtml(html, {
				// 	recognizeSelfClosing: true,
				// 	allowedTags: false,
				// 	allowedAttributes: false
				// });

				const htmlvalidate = new HtmlValidate({
					extends: ["htmlvalidate:recommended"]
				});

				const report = htmlvalidate.validateString("<div>lorem ipsum</span>");
				console.log(report.results);

				stream.end(
					pretty(html, {
						ocd: true
					})
				);
			});

			shell.showItemInFolder(path.current);
			e.sender.send("debugRelay", `HTML created at: ${path.current}`);
			setIsLoading(false);
			return;
		});

		return () => {
			ipc.removeAllListeners("complie");
		};
	}, [isLoading]);

	return (
		<React.Fragment>
			<Titlebar />
			<JobInfoBar />
			<DebugWindow />
			{isLoading ? (
				<div className="loading-contain">
					<div className="longfazers">
						<span />
						<span />
						<span />
						<span />
					</div>
					<h1>Creating HTML</h1>
				</div>
			) : (
				<Buttonbar newpath={path} startProcess={startProcess} />
			)}
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

		fs.rmdir(path, err => {
			if (err) {
				console.log(err);
				remote.dialog.showMessageBox({ type: "error", title: "Error", message: err.toString() });
			}
		});
		fs.mkdirSync(path);
	}
};

const template = Handlebars.compile(`
{{#each this.el}} {{!-- Document Root, filter only elements --}}
{{#each this.el}} {{!-- Each element in document (Pages/Styles) --}}
   {{#filter_scope this "pages"}} {{!-- Pages element only --}}
	
		{{#each this.el}}
			<div class="page" style="width: 612pt; text-align: center; margin: auto; position: relative;">
				{{#sort_blocks this.el}} {{!-- Each stream, reduced to array of blocks --}}
					{{#each this}} {{!-- Each block --}}

						{{#create_blocks ../this this @index}} {{!-- Generates block elements --}}

							{{#each this.el}} {{!-- Each group --}}
								
								{{~#create_group @root.el.0.el.1.el ../../this ../this this @index ~}}
									{{~ display_text @root.el.0.el.1.el ../../../../this ../../this ../this ~}}
								{{/create_group}}

							{{/each}}

						{{/create_blocks}}

					{{/each}}
				{{/sort_blocks}}
			</div>
			<hr style="page-break-after: always; width: 612pt; margin-top: 20pt; margin-bottom: 20pt; border: 0px; height: 3px; background-color: black" />
		{{/each}}

	{{/filter_scope}}{{!-- Pages element only --}}
{{/each}}{{!-- Each element in document (Pages/Styles) --}}
{{/each}}{{!-- Document Root, filter only elements --}}`);

ReactDOM.render(<Renderer />, document.getElementById("root"));
