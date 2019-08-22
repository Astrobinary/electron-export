import React from "react";
import { remote } from "electron";
import "./titlebar.scss";

const closeWindow = () => {
	remote.BrowserWindow.getFocusedWindow().close();
};

const Titlebar = () => {
	return (
		<div className="Titlebar">
			<div className="titlebar-text">HTML Export</div>
			<div className="titlebar-close" onClick={closeWindow}>
				<span>X</span>
			</div>
		</div>
	);
};

export default Titlebar;
