import React, { useState, useEffect } from "react";

import ReactDOM from "react-dom";
import "./global.scss";

import jsonConvert from "./utils/jsonConverter";
import Titlebar from "./components/Titlebar/titlebar";

const { ipcRenderer } = require("electron");

const Renderer = () => {
	const [json, setJson] = useState(null);

	const renderHandlebars = () => {
		console.log("composing template...");
		ipcRenderer.send("compose-handlebars", json);
	};

	useEffect(() => {
		renderHandlebars();
	});

	return (
		<React.Fragment>
			<Titlebar />
			<button onClick={() => setJson(jsonConvert())}>Create Json test file</button>
			<button onClick={() => renderHandlebars()}>Handlebars template</button>
		</React.Fragment>
	);
};

ReactDOM.render(<Renderer />, document.getElementById("root"));
