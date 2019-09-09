import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { ipcRenderer as ipc, remote } from "electron";
import Handlebars from "handlebars";
import fs from "fs";
import pretty from "pretty";
import isDev from "electron-is-dev";
import Titlebar from "./components/Titlebar/titlebar";
import Statusbar from "./components/Statusbar/statusbar";
import Buttonbar from "./components/Buttonbar/buttonbar";

import generateJSON from "../src/utils/jsonConverter";

import "./helpers";
import "./global.scss";

const Renderer = () => {
	// const [json, setJson] = useState(null);

	useEffect(() => {
		ipc.on("debug", (e, msg) => {
			console.log(msg);
		});

		ipc.on("complie", e => {
			const json = generateJSON(remote.getGlobal("jobLocation"));
			const output = template(JSON.parse(json), "utf8");
			const dir = `N:\\HTML\\Out\\${remote.getGlobal("jobNumber")} ~test`;

			if (!fs.existsSync(dir)) fs.mkdirSync(dir);

			let stream;
			if (isDev) {
				stream = fs.createWriteStream("./output/index.htm");
			} else {
				stream = fs.createWriteStream(`N:\\HTML\\Out\\${remote.getGlobal("jobNumber")} ~test\\index.htm`);
			}

			stream.on("end", () => {
				e.sender.send("debug", `HTML FILE GENERATED`);
			});

			stream.once("open", () => {
				const html = `<!DOCTYPE html> <meta http-equiv="content-type" content="text/html; charset=UTF-8"><html><head></head><body>${output}</body></html>`;
				stream.end(
					pretty(html, {
						ocd: true
					})
				);
			});
		});
	});

	return (
		<React.Fragment>
			<Titlebar />
			<Buttonbar />
			<Statusbar />
		</React.Fragment>
	);
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
