import React from "react";
import "./buttonbar.scss";
import { ipcRenderer as ipc, remote } from "electron";
import { FaFillDrip, FaPlay, FaPager, FaRegSave, FaRadiation } from "react-icons/fa";

const Buttonbar = () => {
	const toggleEDGAR = e => {
		e.target.classList.toggle("selected");
	};
	const toggleTOC = e => {
		e.target.classList.toggle("selected");
	};
	const toggleMARKED = e => {
		e.target.classList.toggle("selected");
	};
	const saveTo = () => {
		remote.dialog.showSaveDialog({ defaultPath: `N:\\HTML\\Out\\${remote.getGlobal("jobNumber")}.htm`, title: "Select save location for HTML files" }, filePath => {
			if (filePath !== undefined) ipc.send("updateSaveLocation", filePath);
		});
	};
	const openSettings = () => {};

	return (
		<div className="Buttonbar">
			<div className="btn-contain selected" onClick={e => toggleEDGAR(e)}>
				<div className="icon">
					<FaFillDrip />
				</div>
				edgar shade
			</div>

			<div className="btn-contain selected" onClick={e => toggleTOC(e)}>
				<div className="icon larger">
					<FaPager />
				</div>
				toc header
			</div>

			<div className="btn-contain" onClick={e => toggleMARKED(e)}>
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

			<div className="btn-contain double selected" onClick={() => ipc.send("getXML")}>
				<div className="icon">
					<FaPlay />
				</div>
				start
			</div>
		</div>
	);
};
export default Buttonbar;
