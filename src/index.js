import React, { useState, useEffect } from "react";

import ReactDOM from "react-dom";
import "./global.scss";

import jsonConvert from "./utils/jsonConverter";
import Titlebar from "./components/Titlebar/titlebar";

const { ipcRenderer } = require("electron");

const Renderer = () => {
	const [json, setJson] = useState(null);

	const renderHandlebars = () => {
		ipcRenderer.send("compose-handlebars", json);
	};

	useEffect(() => {
		ipcRenderer.send("compose-handlebars", json);
	});

	return (
		<React.Fragment>
			<Titlebar />
			<button onClick={() => setJson(jsonConvert())}>Create Json test file</button>
			<button onClick={() => renderHandlebars()}>Handlebars template</button>
			<button onClick={() => console.log(json)}>Log state</button>
		</React.Fragment>
	);
};

ReactDOM.render(<Renderer />, document.getElementById("root"));
