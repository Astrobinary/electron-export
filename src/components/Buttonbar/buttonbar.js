import React from "react";
import "./buttonbar.scss";
import { ipcRenderer as ipc, shell, remote } from "electron";
import { FaFillDrip, FaPlay, FaPager, FaRegSave, FaFolderOpen } from "react-icons/fa";

const Buttonbar = () => {
	return (
		<div className="Buttonbar">
			<div className="btn-contain selected">
				<div className="icon">
					<FaFillDrip />
				</div>
				edgar shade
			</div>

			<div className="btn-contain selected">
				<div className="icon larger">
					<FaPager />
				</div>
				toc header
			</div>

			<div className="btn-contain">
				<div className="icon">
					<div className="giant">R</div>
				</div>
				marked
			</div>

			<div className="btn-contain sepL slight">
				<div className="icon larger">
					<FaRegSave />
				</div>
				save to
			</div>

			<div className="btn-contain sepR slight" onClick={() => shell.openItem(remote.getGlobal("jobLocation"))}>
				<div className="icon larger">
					<FaFolderOpen />
				</div>
				open job
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
