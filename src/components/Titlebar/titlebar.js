import React from "react";
import { remote } from "electron";
import "./titlebar.scss";
import { FaWindowClose, FaWindowMinimize } from "react-icons/fa";

const closeWindow = () => {
	remote.BrowserWindow.getFocusedWindow().close();
};

const Titlebar = () => {
	return (
		<div className="Titlebar">
			<div className="titlebar-text">HTML Export v{remote.app.getVersion()}</div>
			<div className="titlebar-close" onClick={closeWindow}>
				<span>
					<FaWindowClose />
				</span>
			</div>
		</div>
	);
};
export default Titlebar;
