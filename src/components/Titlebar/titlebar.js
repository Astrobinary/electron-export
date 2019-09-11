import React from "react";
import { remote } from "electron";
import isDev from "electron-is-dev";
import "./titlebar.scss";
import { FaWindowClose } from "react-icons/fa";

const closeWindow = () => {
	remote.BrowserWindow.getFocusedWindow().close();
};

const Titlebar = () => {
	return (
		<div className="Titlebar">
			<div className="titlebar-text">
				HTML Export v{remote.app.getVersion()} {isDev ? "(dev mode)" : ""}
			</div>
			<div className="titlebar-close" onClick={closeWindow}>
				<span>
					<FaWindowClose />
				</span>
			</div>
		</div>
	);
};
export default Titlebar;
