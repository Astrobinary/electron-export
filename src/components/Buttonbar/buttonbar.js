import React, { useState, useEffect } from "react";
import { ipcRenderer as ipc, remote } from "electron";
import { FaFillDrip, FaPlay, FaPager, FaRegSave, FaRadiation } from "react-icons/fa";
import "./buttonbar.scss";
import storage from "electron-json-storage";

const Buttonbar = () => {
	const [config, setConfig] = useState({
		edgarShade: remote.getGlobal("edgarShade"),
		tocHeader: remote.getGlobal("tocHeader"),
		marked: remote.getGlobal("marked")
	});

	const toggleEDGAR = e => {
		ipc.send("updateConfig", config, "edgarShade", !config.edgarShade);
		setConfig({ ...config, edgarShade: !config.edgarShade });
	};
	const toggleTOC = e => {
		ipc.send("updateConfig", config, "tocHeader", !config.tocHeader);
		setConfig({ ...config, tocHeader: !config.tocHeader });
	};
	const toggleMARKED = e => {
		ipc.send("updateConfig", config, "marked", !config.marked);
		setConfig({ ...config, marked: !config.marked });
	};
	const saveTo = () => {
		remote.dialog.showSaveDialog({ defaultPath: `N:\\HTML\\Out\\${remote.getGlobal("jobNumber")}.htm`, title: "Select save location for HTML files" }, filePath => {
			if (filePath !== undefined) ipc.send("updateSaveLocation", filePath);
		});
	};
	const openSettings = () => {};

	const startExport = () => {
		ipc.send("getXML");
	};

	return (
		<div className="Buttonbar">
			<div className={`btn-contain ${config.edgarShade ? "selected" : ""}`} onClick={e => toggleEDGAR(e)}>
				<div className="icon">
					<FaFillDrip />
				</div>
				edgar shade
			</div>

			<div className={`btn-contain ${config.tocHeader ? "selected" : ""}`} onClick={e => toggleTOC(e)}>
				<div className="icon larger">
					<FaPager />
				</div>
				toc header
			</div>

			<div className={`btn-contain ${config.marked ? "selected" : ""}`} onClick={e => toggleMARKED(e)}>
				<div className="icon">
					<div className="giant">R</div>
				</div>
				marked
			</div>

			<div className="btn-contain sepL slight" onClick={e => saveTo()}>
				<div className="icon larger">
					<FaRegSave />
				</div>
				save to
			</div>

			<div className="btn-contain sepR slight" onClick={e => openSettings()}>
				<div className="icon larger">
					<FaRadiation />
				</div>
				settings
			</div>

			<div className="btn-contain double selected" onClick={() => startExport()}>
				<div className="icon">
					<FaPlay />
				</div>
				start
			</div>
		</div>
	);
};
export default Buttonbar;
